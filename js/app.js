// =====================================================================
// MAIN APPLICATION CONTROLLER (js/app.js)
// Connects UI events, keyboard shortcuts, Wake Lock, Audio, State,
// Dynamic /decks Catalog & GitHub API Auto-Discovery, Multi-Game
// Non-Repeating Round Slicer, "Winner Stays On" Next Match Flow,
// 1-Tap Fast Money Scoring Chips, and Hybrid Multiplayer Sync.
// Works both on GitHub Pages (https://) and locally via file://!
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  let activeRole = "lobby"; // 'lobby' | 'host' | 'tv' | 'buzzer1' | 'buzzer2' | 'solo'
  let currentRoomCode = "";
  let roomState = Feud.createDefaultRoomState("1234");

  let lastStrikeSeq = 0;
  let lastFanfareSeq = 0;
  let lastDupBuzzSeq = 0;
  let lastTimeUpSeq = 0;
  let lastZeroPtsSeq = 0;
  let lastRevealedCount = 0;
  let lastBuzzerWinner = 0;
  let hostFmTimerInterval = null;
  let hostTurnTimerInterval = null;
  let presetIdx = 0;
  let nextMatchContenderMode = "winner-stays"; // 'winner-stays' | 'new-teams'

  // =====================================================================
  // 1. SCREEN WAKE LOCK API (KEEPS ALL 4 PHONES AWAKE)
  // =====================================================================
  let wakeLockSentinel = null;

  async function requestWakeLock() {
    const badge = document.getElementById("wakeLockBadge");
    if (!badge) return;
    if (!("wakeLock" in navigator)) {
      badge.textContent = "☀️ Stay-Awake N/A";
      badge.className = "pill-badge awake-warn";
      return;
    }
    try {
      wakeLockSentinel = await navigator.wakeLock.request("screen");
      badge.textContent = "☀️ Screen Awake";
      badge.className = "pill-badge awake-ok";
      wakeLockSentinel.addEventListener("release", () => {
        badge.textContent = "💤 Wake Lock Inactive";
        badge.className = "pill-badge awake-warn";
      });
    } catch (err) {
      badge.textContent = "💤 Wake Lock Inactive";
      badge.className = "pill-badge awake-warn";
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      requestWakeLock();
    }
  });

  document.addEventListener(
    "pointerdown",
    () => {
      if (!wakeLockSentinel || wakeLockSentinel.released) {
        requestWakeLock();
      }
    },
    { passive: true }
  );

  // =====================================================================
  // 2. REMOTE SYNC CALLBACKS & SOUND DISPATCH
  // =====================================================================
  function syncSequenceCounters(state) {
    lastStrikeSeq = state.strikeSeq || 0;
    lastFanfareSeq = state.fanfareSeq || 0;
    lastDupBuzzSeq = state.dupBuzzSeq || 0;
    lastTimeUpSeq = state.timeUpSeq || 0;
    lastZeroPtsSeq = state.zeroPtsSeq || 0;
    lastRevealedCount = Array.isArray(state.revealed) ? state.revealed.length : 0;
    lastBuzzerWinner = state.buzzerWinner || 0;
  }

  Feud.initSyncCallbacks({
    getLocalState: () => roomState,
    onStatusChange: (statusText) => {
      const codeBadge = document.getElementById("roomCodeBadge");
      if (codeBadge && activeRole !== "lobby") {
        codeBadge.textContent = statusText;
      }
    },
    onRemoteState: (incoming) => {
      if (!incoming) return;

      if (incoming.strikeSeq && incoming.strikeSeq !== lastStrikeSeq) {
        lastStrikeSeq = incoming.strikeSeq;
        if (activeRole === "tv" || activeRole === "host" || activeRole === "solo") {
          Feud.showBigRedXOverlay(incoming.strikes || 1);
        }
      }

      if (incoming.fanfareSeq && incoming.fanfareSeq !== lastFanfareSeq) {
        lastFanfareSeq = incoming.fanfareSeq;
        if (activeRole === "tv") {
          Feud.playFanfare();
        }
      }

      if (incoming.dupBuzzSeq && incoming.dupBuzzSeq !== lastDupBuzzSeq) {
        lastDupBuzzSeq = incoming.dupBuzzSeq;
        if (activeRole === "tv") {
          Feud.playBuzzerHonk();
          Feud.showToast("❌ Duplicate Answer — Try Again!");
        }
      }

      if (incoming.timeUpSeq && incoming.timeUpSeq !== lastTimeUpSeq) {
        lastTimeUpSeq = incoming.timeUpSeq;
        if (activeRole === "tv") {
          Feud.playBuzzerHonk();
          Feud.showToast("⏰ Time's Up!");
        }
      }

      if (incoming.zeroPtsSeq && incoming.zeroPtsSeq !== lastZeroPtsSeq) {
        lastZeroPtsSeq = incoming.zeroPtsSeq;
        if (activeRole === "tv") {
          Feud.playBuzzerHonk();
        }
      }

      const newRevLen = Array.isArray(incoming.revealed) ? incoming.revealed.length : 0;
      const roundChanged = incoming.roundIdx !== roomState.roundIdx;
      if (!roundChanged && newRevLen > lastRevealedCount && activeRole === "tv") {
        Feud.playDing();
      }
      lastRevealedCount = newRevLen;

      if (incoming.buzzerWinner && incoming.buzzerWinner !== lastBuzzerWinner) {
        if (activeRole === "tv" || activeRole === "host" || activeRole === "solo") {
          Feud.playFaceOffTone(incoming.buzzerWinner);
        }
        if (activeRole === "host") {
          setTimeout(() => hostRestartTurnTimer(), 50);
        }
      }
      lastBuzzerWinner = incoming.buzzerWinner || 0;

      const customChanged =
        JSON.stringify(incoming.customRounds || {}) !==
          JSON.stringify(roomState.customRounds || {}) ||
        JSON.stringify(incoming.customDeck || null) !==
          JSON.stringify(roomState.customDeck || null) ||
        JSON.stringify(incoming.matchRounds || null) !==
          JSON.stringify(roomState.matchRounds || null);

      roomState = { ...roomState, ...incoming };
      Feud.renderBranding(roomState);
      if (customChanged) {
        Feud.populateRoundDropdowns(roomState);
      }
      renderActiveView();
    }
  });

  async function pushRoomPatch(patch) {
    roomState = { ...roomState, ...patch, updatedAt: Date.now() };
    syncSequenceCounters(roomState);
    Feud.renderBranding(roomState);
    renderActiveView();
    await Feud.syncPushPatch(patch, roomState);
  }

  // =====================================================================
  // 3. DYNAMIC /decks CATALOG & GITHUB PAGES AUTO-DISCOVERY
  // =====================================================================
  function getCatalogList() {
    if (!Array.isArray(Feud.DECK_CATALOG)) {
      Feud.DECK_CATALOG = [
        {
          id: "starter",
          label: "🎉 Starter Party Deck (6 Rounds)",
          file: null,
          builtin: "starter"
        }
      ];
    }
    return Feud.DECK_CATALOG;
  }

  function populateDeckCatalogSelect() {
    const sel = document.getElementById("setupDeckSelect");
    if (!sel) return;
    const catalog = getCatalogList();
    const activeDeckName =
      roomState.customDeck && roomState.customDeck.name ? roomState.customDeck.name : null;

    sel.innerHTML = "";
    let matched = false;

    catalog.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.label;
      if (
        (!activeDeckName && item.builtin === "starter") ||
        (activeDeckName &&
          item.data &&
          item.data.deckName &&
          item.data.deckName === activeDeckName) ||
        (activeDeckName && item.id.replace(/\.(json|csv)$/i, "") === activeDeckName)
      ) {
        opt.selected = true;
        matched = true;
      }
      sel.appendChild(opt);
    });

    if (activeDeckName && !matched) {
      const customOpt = document.createElement("option");
      customOpt.value = "__custom__";
      customOpt.textContent = `📂 Custom: ${activeDeckName} (${
        Feud.getSourceRoundsList(roomState).length
      } Rds)`;
      customOpt.selected = true;
      sel.appendChild(customOpt);
    }
  }

  async function discoverGitHubDecksFolder() {
    try {
      const host = window.location.hostname || "";
      if (!host.endsWith(".github.io")) return;
      const owner = host.split(".")[0];
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const repo = pathParts[0];
      if (!owner || !repo) return;

      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/decks`;
      const res = await fetch(apiUrl);
      if (!res.ok) return;
      const files = await res.json();
      if (!Array.isArray(files)) return;

      const catalog = getCatalogList();
      const knownIds = new Set(catalog.map((c) => c.id.toLowerCase()));

      files.forEach((f) => {
        if (!f || !f.name) return;
        if (!/\.(json|csv)$/i.test(f.name)) return;
        if (/^catalog\.js$/i.test(f.name)) return;
        if (knownIds.has(f.name.toLowerCase())) return;

        catalog.push({
          id: f.name,
          label: `📄 ${f.name.replace(/\.(json|csv)$/i, "")} (${f.name})`,
          file: `./decks/${f.name}`,
          data: null
        });
        knownIds.add(f.name.toLowerCase());
      });

      populateDeckCatalogSelect();
    } catch (e) {}
  }

  async function onSelectCatalogDeck(deckId) {
    if (!deckId || deckId === "__custom__") return;
    const catalog = getCatalogList();
    const entry = catalog.find((c) => c.id === deckId);
    if (!entry) return;

    if (entry.builtin === "starter") {
      await restoreDefaultDeck(false);
      syncSetupModalInputsFromState();
      return;
    }

    if (entry.data) {
      // Instant offline load from bundled decks/catalog.js (works over file://!)
      const jsonText = JSON.stringify(entry.data);
      await applyImportedDeckText(jsonText, entry.id, false, false);
      syncSetupModalInputsFromState();
      return;
    }

    if (entry.file) {
      await fetchAndApplyRemoteDeck(entry.file, false);
      syncSetupModalInputsFromState();
    }
  }

  function resetCurrentDeckHistory() {
    Feud.resetDeckPlayedHistory(roomState);
    Feud.renderBranding(roomState);
    Feud.showToast("↺ Reset played round history! All rounds in this deck are fresh again.");
  }

  // =====================================================================
  // 4. NEW GAME SETUP WIZARD & LOBBY ACTIONS
  // =====================================================================
  function syncSetupModalInputsFromState() {
    populateDeckCatalogSelect();
    const iconIn = document.getElementById("setupGameIconInput");
    const titleIn = document.getElementById("setupGameTitleInput");
    const t1In = document.getElementById("setupTeam1Input");
    const t2In = document.getElementById("setupTeam2Input");
    const timerSel = document.getElementById("setupTurnTimerSelect");
    const rdsSel = document.getElementById("setupRoundsPerMatchSelect");
    const orderSel = document.getElementById("setupRoundOrderSelect");
    const fmCheck = document.getElementById("setupEnableFastMoneyCheckbox");
    const pinIn = document.getElementById("setupHostPinInput");
    const lobbyPin = document.getElementById("hostPinCreate");

    if (iconIn) iconIn.value = roomState.gameIcon || "🎉";
    if (titleIn) titleIn.value = roomState.gameTitle || "Party Feud";
    if (t1In) t1In.value = roomState.team1Name || "Team Alpha";
    if (t2In) t2In.value = roomState.team2Name || "Team Omega";
    if (timerSel) timerSel.value = String(roomState.turnTimerDuration || 10);
    if (rdsSel) rdsSel.value = String(roomState.roundsPerMatch ?? 4);
    if (orderSel) orderSel.value = roomState.roundOrder || "sequential";
    if (fmCheck) fmCheck.checked = roomState.enableFastMoney !== false;
    if (pinIn && lobbyPin && lobbyPin.value.trim()) {
      pinIn.value = lobbyPin.value.trim();
    }
    Feud.renderBranding(roomState);
  }

  function openNewGameModal(preferredMode = "host") {
    Feud.unlockAudio();
    syncSetupModalInputsFromState();
    const modal = document.getElementById("newGameModal");
    if (modal) modal.classList.remove("hidden");
  }

  function closeNewGameModal() {
    const modal = document.getElementById("newGameModal");
    if (modal) modal.classList.add("hidden");
  }

  function cycleSetupTeamPresets() {
    const presets = Feud.getActiveTeamPresets(roomState);
    presetIdx = (presetIdx + 1) % presets.length;
    const [t1, t2] = presets[presetIdx];
    const t1In = document.getElementById("setupTeam1Input");
    const t2In = document.getElementById("setupTeam2Input");
    if (t1In) t1In.value = t1;
    if (t2In) t2In.value = t2;
    roomState.team1Name = t1;
    roomState.team2Name = t2;
  }

  async function loadBuiltInDeck(deckKey) {
    if (deckKey === "starter") {
      await onSelectCatalogDeck("starter");
    } else if (deckKey === "desi-thanksgiving") {
      await onSelectCatalogDeck("desi-thanksgiving.json");
    } else if (deckKey === "friendly-sample") {
      await onSelectCatalogDeck("sample-friendly-feud.json");
    }
  }

  async function confirmStartNewGame(mode) {
    Feud.unlockAudio();
    const iconVal = (document.getElementById("setupGameIconInput")?.value || "").trim() || "🎉";
    const titleVal =
      (document.getElementById("setupGameTitleInput")?.value || "").trim() || "Party Feud";
    const t1Val = (document.getElementById("setupTeam1Input")?.value || "").trim() || "Team 1";
    const t2Val = (document.getElementById("setupTeam2Input")?.value || "").trim() || "Team 2";
    const timerDur =
      parseInt(document.getElementById("setupTurnTimerSelect")?.value || "10", 10) || 10;
    const roundsPerMatch = parseInt(
      document.getElementById("setupRoundsPerMatchSelect")?.value ?? "4",
      10
    );
    const roundOrder = document.getElementById("setupRoundOrderSelect")?.value || "sequential";
    const enableFastMoney = Boolean(
      document.getElementById("setupEnableFastMoneyCheckbox")?.checked
    );
    const pinVal = (document.getElementById("setupHostPinInput")?.value || "").trim() || "1234";

    if (mode === "host" && !/^\d{4}$/.test(pinVal)) {
      Feud.showToast("Please enter a 4-digit numeric Host PIN (e.g., 1234).");
      return;
    }

    Feud.saveGameIcon(iconVal);
    Feud.saveGameTitle(titleVal);

    stopLocalTurnTimerInterval();
    clearInterval(hostFmTimerInterval);
    hostFmTimerInterval = null;

    const fresh = Feud.createDefaultRoomState(mode === "host" ? pinVal : "0000");
    const slice = Feud.buildMatchSlice(fresh, {
      roundsPerMatch,
      roundOrder,
      enableFastMoney
    });

    roomState = {
      ...fresh,
      gameIcon: iconVal,
      gameTitle: titleVal,
      team1Name: t1Val,
      team2Name: t2Val,
      team1Score: 0,
      team2Score: 0,
      stage: "main",
      enableFastMoney,
      roundsPerMatch,
      roundOrder,
      matchNumber: slice.matchNumber,
      matchRounds: slice.matchRounds,
      matchSourceIndices: slice.matchSourceIndices,
      matchFastMoney: slice.matchFastMoney,
      activeFmSetIdx: slice.activeFmSetIdx,
      roundIdx: 0,
      questionRevealed: false,
      controllingTeam: 0,
      turnTimerDuration: timerDur,
      turnTimerRemaining: timerDur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0,
      fmClock: 20,
      fmHideP1: false,
      fmEntries: slice.matchFastMoney.map(() => ({ p1Ans: "", p1Pts: 0, p2Ans: "", p2Pts: 0 }))
    };

    closeNewGameModal();

    if (mode === "solo") {
      currentRoomCode = "SOLO";
      syncSequenceCounters(roomState);
      Feud.saveLastSession("solo", "SOLO");
      enterRole("solo", "SOLO");
      await Feud.startHostRoomSync("SOLO", roomState);
      Feud.showToast(
        `Match #${slice.matchNumber} Ready (${slice.matchSourceIndices.length} unplayed rounds)! Press Space to reveal Round 1.`
      );
    } else {
      const code = Feud.generateRoomCode();
      currentRoomCode = code;
      syncSequenceCounters(roomState);
      enterRole("host", code);
      Feud.saveLastSession("host", code, pinVal);
      await Feud.startHostRoomSync(code, roomState);
      Feud.showToast(
        `Room ${code} created (Match #${slice.matchNumber})! Share code ${code} or tap 📱 Join QR.`
      );
    }
  }

  async function createHostRoom() {
    openNewGameModal("host");
  }

  async function joinHostRoom() {
    Feud.unlockAudio();
    const code = document.getElementById("hostJoinCode").value.trim().toUpperCase();
    const pin = document.getElementById("hostJoinPin").value.trim();

    if (code.length < 4 || pin.length < 4) {
      Feud.showToast("Enter the 4-character Room Code and 4-digit Host PIN.");
      return;
    }

    Feud.showToast(`Connecting to Room ${code}…`);
    const res = await Feud.joinExistingRoomSync({ code, role: "host", pin });
    if (!res.ok) {
      Feud.playBuzzerHonk();
      Feud.showToast(res.error || "Could not unlock room.");
      return;
    }

    roomState = { ...roomState, ...res.state };
    currentRoomCode = code;
    syncSequenceCounters(roomState);
    Feud.saveLastSession("host", code, pin);
    enterRole("host", code);
    Feud.showToast(`Unlocked Host Mode for Room ${code}!`);
  }

  async function joinTvDisplay() {
    Feud.unlockAudio();
    const code = document.getElementById("tvRoomInput").value.trim().toUpperCase();
    if (code.length < 4) {
      Feud.showToast("Enter the 4-character Room Code from the Host.");
      return;
    }

    Feud.showToast(`Connecting TV to Room ${code}…`);
    const res = await Feud.joinExistingRoomSync({ code, role: "tv" });
    if (!res.ok) {
      Feud.showToast(res.error || `Room "${code}" not found.`);
      return;
    }

    roomState = { ...roomState, ...res.state };
    currentRoomCode = code;
    syncSequenceCounters(roomState);
    Feud.saveLastSession("tv", code);
    enterRole("tv", code);
    Feud.showToast(`📺 TV Display connected to Room ${code}!`);
  }

  async function joinTeamBuzzer(teamNum) {
    Feud.unlockAudio();
    const code = document.getElementById("buzzerRoomInput").value.trim().toUpperCase();
    if (code.length < 4) {
      Feud.showToast("Enter the 4-character Room Code first!");
      return;
    }

    const role = teamNum === 1 ? "buzzer1" : "buzzer2";
    Feud.showToast(`Connecting Team ${teamNum} Buzzer to ${code}…`);
    const res = await Feud.joinExistingRoomSync({ code, role });
    if (!res.ok) {
      Feud.showToast(res.error || `Room "${code}" not found.`);
      return;
    }

    roomState = { ...roomState, ...res.state };
    currentRoomCode = code;
    syncSequenceCounters(roomState);
    Feud.saveLastSession(role, code);
    enterRole(role, code);
    Feud.showToast(`🔔 Team ${teamNum} Buzzer Ready!`);
  }

  async function startLocalSoloMode() {
    openNewGameModal("solo");
  }

  function enterRole(role, code) {
    activeRole = role;
    requestWakeLock();
    Feud.renderBranding(roomState);

    document.getElementById("lobbyView").classList.add("hidden");
    document.getElementById("tvView").classList.add("hidden");
    document.getElementById("hostView").classList.add("hidden");
    document.getElementById("buzzerView").classList.add("hidden");

    const codeBadge = document.getElementById("roomCodeBadge");
    const qrBtn = document.getElementById("btnQrCode");
    const leaveBtn = document.getElementById("btnLeaveRoom");
    const sub = document.getElementById("roleSubtitle");

    codeBadge.textContent = `Room: ${code}`;
    codeBadge.classList.remove("hidden");
    if (qrBtn) qrBtn.classList.toggle("hidden", code === "SOLO");
    leaveBtn.classList.remove("hidden");

    if (role === "host") {
      document.getElementById("hostView").classList.remove("hidden");
      sub.textContent = `Host Remote • PIN: ${roomState.pin}`;
      Feud.populateRoundDropdowns(roomState);
    } else if (role === "tv") {
      document.getElementById("tvView").classList.remove("hidden");
      sub.textContent = "TV Display Screen (Cast Mode)";
    } else if (role === "solo") {
      document.getElementById("tvView").classList.remove("hidden");
      sub.textContent = "Single-Screen Interactive TV Board";
      Feud.populateRoundDropdowns(roomState);
    } else if (role === "buzzer1" || role === "buzzer2") {
      document.getElementById("buzzerView").classList.remove("hidden");
      sub.textContent = role === "buzzer1" ? "Team 1 Podium Buzzer" : "Team 2 Podium Buzzer";
    }

    renderActiveView();
  }

  function switchSoloAndHostView() {
    if (currentRoomCode === "SOLO" || activeRole === "solo" || activeRole === "host") {
      if (activeRole === "solo") {
        enterRole("host", currentRoomCode || "SOLO");
      } else {
        enterRole("solo", currentRoomCode || "SOLO");
      }
    }
  }

  function leaveToLobby() {
    Feud.cleanupSync();
    Feud.clearLastSession();
    stopLocalTurnTimerInterval();
    clearInterval(hostFmTimerInterval);
    hostFmTimerInterval = null;
    activeRole = "lobby";
    document.getElementById("lobbyView").classList.remove("hidden");
    document.getElementById("tvView").classList.add("hidden");
    document.getElementById("hostView").classList.add("hidden");
    document.getElementById("buzzerView").classList.add("hidden");
    document.getElementById("roomCodeBadge").classList.add("hidden");
    document.getElementById("btnQrCode")?.classList.add("hidden");
    document.getElementById("btnLeaveRoom").classList.add("hidden");
    document.getElementById("roleSubtitle").textContent = `4-Phone Multiplayer • ${Feud.getRoundCount(
      roomState
    )} Rounds`;
    Feud.renderBranding(roomState);
  }

  // =====================================================================
  // 5. END MATCH / NEXT GAME ("WINNER STAYS ON" OR "TWO NEW TEAMS")
  // =====================================================================
  function getWinningTeamInfo() {
    const s1 = Number(roomState.team1Score) || 0;
    const s2 = Number(roomState.team2Score) || 0;
    const t1 = roomState.team1Name || "Team 1";
    const t2 = roomState.team2Name || "Team 2";
    if (s1 >= s2) {
      return { winnerNum: 1, winnerName: t1, loserName: t2, winScore: s1, loseScore: s2, isTie: s1 === s2 };
    }
    return { winnerNum: 2, winnerName: t2, loserName: t1, winScore: s2, loseScore: s1, isTie: false };
  }

  function pickNextChallengerName(excludeName) {
    const presets = Feud.getActiveTeamPresets(roomState);
    const flat = [];
    presets.forEach((pair) => {
      if (pair[0]) flat.push(pair[0]);
      if (pair[1]) flat.push(pair[1]);
    });
    const cleanExclude = String(excludeName || "").toLowerCase();
    const candidates = flat.filter(
      (n) =>
        n.toLowerCase() !== cleanExclude &&
        n.toLowerCase() !== String(roomState.team1Name || "").toLowerCase() &&
        n.toLowerCase() !== String(roomState.team2Name || "").toLowerCase()
    );
    if (candidates.length > 0) {
      presetIdx = (presetIdx + 1) % candidates.length;
      return candidates[presetIdx];
    }
    return "Team Challengers";
  }

  async function openNextMatchModal() {
    Feud.unlockAudio();
    stopLocalTurnTimerInterval();
    const nextFanfare = (roomState.fanfareSeq || 0) + 1;
    Feud.playFanfare();
    await pushRoomPatch({ stage: "winner", turnTimerRunning: false, fanfareSeq: nextFanfare });

    const info = getWinningTeamInfo();
    const stats = Feud.getDeckPlayStats(roomState);

    const banner = document.getElementById("nextMatchWinnerBanner");
    const sub = document.getElementById("nextMatchScoreSub");
    const remBadge = document.getElementById("nextMatchRemainingBadge");

    if (banner) {
      banner.textContent = info.isTie
        ? `⚡ Tie Game (${info.winScore} – ${info.loseScore})!`
        : `🏆 ${info.winnerName} Wins!`;
    }
    if (sub) {
      sub.textContent = `${roomState.team1Name}: ${roomState.team1Score} pts  •  ${roomState.team2Name}: ${roomState.team2Score} pts`;
    }
    if (remBadge) {
      remBadge.textContent = `📊 ${stats.remainingRoundsCount} of ${stats.totalRounds} Deck Rounds Still Unused`;
    }

    setNextMatchContenderMode("winner-stays");
    document.getElementById("nextMatchModal")?.classList.remove("hidden");
  }

  function closeNextMatchModal() {
    document.getElementById("nextMatchModal")?.classList.add("hidden");
  }

  function setNextMatchContenderMode(mode) {
    nextMatchContenderMode = mode;
    const btnWin = document.getElementById("btnModeWinnerStays");
    const btnRematch = document.getElementById("btnModeRematch");
    const btnNew = document.getElementById("btnModeTwoNewTeams");
    const btnSuggest = document.getElementById("btnSuggestChallengerPreset");

    if (btnWin) btnWin.classList.toggle("gold", mode === "winner-stays");
    if (btnRematch) btnRematch.classList.toggle("gold", mode === "rematch");
    if (btnNew) btnNew.classList.toggle("gold", mode === "new-teams");

    const l1 = document.getElementById("nextMatchT1Label");
    const l2 = document.getElementById("nextMatchT2Label");
    const in1 = document.getElementById("nextMatchTeam1Input");
    const in2 = document.getElementById("nextMatchTeam2Input");

    const info = getWinningTeamInfo();

    if (mode === "winner-stays") {
      if (l1) l1.textContent = "👑 Defending Champion (Stays On)";
      if (l2) l2.textContent = "⚔️ New Challenger Team Name";
      if (in1) in1.value = info.winnerName;
      if (in2) in2.value = pickNextChallengerName(info.winnerName);
      if (btnSuggest) {
        btnSuggest.classList.remove("hidden");
        btnSuggest.textContent = "🎲 Suggest Challenger Name";
      }
    } else if (mode === "rematch") {
      if (l1) l1.textContent = "🔥 Team 1 (Rematch)";
      if (l2) l2.textContent = "🔥 Team 2 (Rematch)";
      if (in1) in1.value = roomState.team1Name || "Team 1";
      if (in2) in2.value = roomState.team2Name || "Team 2";
      if (btnSuggest) {
        btnSuggest.classList.add("hidden");
      }
    } else {
      if (l1) l1.textContent = "👥 New Team 1 Name";
      if (l2) l2.textContent = "👥 New Team 2 Name";
      const presets = Feud.getActiveTeamPresets(roomState);
      presetIdx = (presetIdx + 1) % presets.length;
      const [p1, p2] = presets[presetIdx];
      if (in1) in1.value = p1 || "Team 1";
      if (in2) in2.value = p2 || "Team 2";
      if (btnSuggest) {
        btnSuggest.classList.remove("hidden");
        btnSuggest.textContent = "🎲 Swap Preset Pair";
      }
    }
  }

  function cycleNextMatchChallengerPreset() {
    if (nextMatchContenderMode === "winner-stays") {
      const in1 = document.getElementById("nextMatchTeam1Input");
      const in2 = document.getElementById("nextMatchTeam2Input");
      if (in2) {
        in2.value = pickNextChallengerName(in1 ? in1.value : "");
      }
    } else if (nextMatchContenderMode === "new-teams") {
      setNextMatchContenderMode("new-teams");
    }
  }

  async function confirmStartNextMatch() {
    Feud.unlockAudio();
    const t1 =
      (document.getElementById("nextMatchTeam1Input")?.value || "").trim() || "Defending Champs";
    const t2 =
      (document.getElementById("nextMatchTeam2Input")?.value || "").trim() || "Challengers";

    stopLocalTurnTimerInterval();
    clearInterval(hostFmTimerInterval);
    hostFmTimerInterval = null;

    const slice = Feud.buildMatchSlice(roomState, {
      roundsPerMatch: roomState.roundsPerMatch,
      roundOrder: roomState.roundOrder,
      enableFastMoney: roomState.enableFastMoney
    });

    const dur = Number(roomState.turnTimerDuration) || 10;

    closeNextMatchModal();
    await pushRoomPatch({
      stage: "main",
      matchNumber: slice.matchNumber,
      matchRounds: slice.matchRounds,
      matchSourceIndices: slice.matchSourceIndices,
      matchFastMoney: slice.matchFastMoney,
      activeFmSetIdx: slice.activeFmSetIdx,
      roundIdx: 0,
      questionRevealed: false,
      controllingTeam: 0,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0,
      team1Name: t1,
      team2Name: t2,
      team1Score: 0,
      team2Score: 0,
      fmClock: 20,
      fmHideP1: false,
      fmEntries: slice.matchFastMoney.map(() => ({ p1Ans: "", p1Pts: 0, p2Ans: "", p2Pts: 0 }))
    });

    Feud.populateRoundDropdowns(roomState);
    Feud.showToast(
      `🚀 Match #${slice.matchNumber} Started: ${t1} vs. ${t2} (Fresh Unplayed Rounds)!`
    );
  }

  // =====================================================================
  // 6. ROOM QR CODE MODAL
  // =====================================================================
  function openQrModal() {
    const code = currentRoomCode || "SOLO";
    const baseUrl = window.location.href.split("?")[0].split("#")[0];
    const joinUrl = `${baseUrl}?room=${encodeURIComponent(code)}`;
    const qrTextEl = document.getElementById("qrRoomCodeText");
    const qrUrlEl = document.getElementById("qrJoinUrlText");
    const qrImgEl = document.getElementById("qrCodeImg");

    if (qrTextEl) qrTextEl.textContent = code;
    if (qrUrlEl) qrUrlEl.textContent = joinUrl;
    if (qrImgEl) {
      qrImgEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(
        joinUrl
      )}`;
    }
    document.getElementById("qrModal")?.classList.remove("hidden");
  }

  function closeQrModal() {
    document.getElementById("qrModal")?.classList.add("hidden");
  }

  // =====================================================================
  // 7. VIEW DISPATCHER, QUESTION REVEAL & PLAYER TURN TIMER ENGINE
  // =====================================================================
  const viewHandlers = {
    onToggleAnswer: (idx) => hostToggleAnswer(idx),
    onUpdateFm: (idx, field, val) => hostUpdateFm(idx, field, val),
    onSelectFmChip: (idx, playerNum, ansText, pts) =>
      hostSelectFmChip(idx, playerNum, ansText, pts)
  };

  function renderActiveView() {
    if (activeRole === "tv" || activeRole === "solo") {
      Feud.renderTvView(roomState, activeRole, viewHandlers);
    } else if (activeRole === "host") {
      Feud.renderHostView(roomState, viewHandlers);
    } else if (activeRole === "buzzer1" || activeRole === "buzzer2") {
      Feud.renderBuzzerView(roomState, activeRole);
    }
  }

  function stopLocalTurnTimerInterval() {
    if (hostTurnTimerInterval) {
      clearInterval(hostTurnTimerInterval);
      hostTurnTimerInterval = null;
    }
  }

  function startLocalTurnTimerLoop() {
    stopLocalTurnTimerInterval();
    hostTurnTimerInterval = setInterval(async () => {
      const currentRem = Number(roomState.turnTimerRemaining) || 0;
      const next = Math.max(0, currentRem - 1);
      if (next > 0) {
        if (next <= 5) {
          Feud.playTick(next <= 3);
        }
        await pushRoomPatch({ turnTimerRemaining: next, turnTimerRunning: true });
      } else {
        stopLocalTurnTimerInterval();
        const nextTimeUp = (roomState.timeUpSeq || 0) + 1;
        Feud.playBuzzerHonk();
        Feud.showToast("⏰ Time's Up! Tap Strike (X) or Restart Timer (R).");
        await pushRoomPatch({
          turnTimerRemaining: 0,
          turnTimerRunning: false,
          timeUpSeq: nextTimeUp
        });
      }
    }, 1000);
  }

  async function hostRevealQuestionAndStartTimer() {
    Feud.unlockAudio();
    const dur = Number(roomState.turnTimerDuration) || 10;
    Feud.playTick(false);
    await pushRoomPatch({
      questionRevealed: true,
      turnTimerRemaining: dur,
      turnTimerRunning: true
    });
    startLocalTurnTimerLoop();
  }

  async function hostToggleQuestionVisibility() {
    Feud.unlockAudio();
    const nextShown = !roomState.questionRevealed;
    if (!nextShown) {
      stopLocalTurnTimerInterval();
      const dur = Number(roomState.turnTimerDuration) || 10;
      await pushRoomPatch({
        questionRevealed: false,
        turnTimerRunning: false,
        turnTimerRemaining: dur
      });
    } else {
      await pushRoomPatch({ questionRevealed: true });
    }
  }

  async function hostRestartTurnTimer() {
    Feud.unlockAudio();
    const dur = Number(roomState.turnTimerDuration) || 10;
    Feud.playTick(false);
    await pushRoomPatch({
      questionRevealed: true,
      turnTimerRemaining: dur,
      turnTimerRunning: true
    });
    startLocalTurnTimerLoop();
  }

  async function hostToggleTurnTimer() {
    Feud.unlockAudio();
    const dur = Number(roomState.turnTimerDuration) || 10;
    if (roomState.turnTimerRunning) {
      stopLocalTurnTimerInterval();
      await pushRoomPatch({ turnTimerRunning: false });
    } else {
      const startFrom =
        Number(roomState.turnTimerRemaining) > 0 ? Number(roomState.turnTimerRemaining) : dur;
      Feud.playTick(false);
      await pushRoomPatch({
        questionRevealed: true,
        turnTimerRemaining: startFrom,
        turnTimerRunning: true
      });
      startLocalTurnTimerLoop();
    }
  }

  async function hostStopResetTurnTimer() {
    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      turnTimerRemaining: dur,
      turnTimerRunning: false
    });
  }

  async function hostSetTurnTimerDuration(sec) {
    stopLocalTurnTimerInterval();
    const cleanSec = Math.max(3, Math.min(60, Number(sec) || 10));
    await pushRoomPatch({
      turnTimerDuration: cleanSec,
      turnTimerRemaining: cleanSec,
      turnTimerRunning: false
    });
    Feud.showToast(`⏱️ Player Answer Timer set to ${cleanSec}s!`);
  }

  async function hostSetControllingTeam(teamNum) {
    const cleanTeam = [0, 1, 2].includes(Number(teamNum)) ? Number(teamNum) : 0;
    await pushRoomPatch({ controllingTeam: cleanTeam });
    if (cleanTeam === 1) {
      Feud.showToast(`🎯 ${roomState.team1Name} has control of the board!`);
    } else if (cleanTeam === 2) {
      Feud.showToast(`🎯 ${roomState.team2Name} has control of the board!`);
    } else {
      Feud.showToast("⚡ Face-Off Mode");
    }
  }

  async function pressTeamBuzzer() {
    Feud.unlockAudio();
    if (roomState.buzzerWinner !== 0) return;
    const myTeam = activeRole === "buzzer1" ? 1 : 2;
    Feud.playFaceOffTone(myTeam);
    if (navigator.vibrate) navigator.vibrate(120);
    await Feud.syncSendTeamBuzz(myTeam);
  }

  async function hostToggleAnswer(slotIdx) {
    Feud.unlockAudio();
    const round = Feud.getRoundData(roomState, roomState.roundIdx);
    const ans = round.answers[slotIdx];
    if (!ans) return;

    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;

    const revSet = new Set(roomState.revealed || []);
    const pts = ans.points * round.multiplier;
    let newPot = roomState.pot || 0;

    if (revSet.has(slotIdx)) {
      revSet.delete(slotIdx);
      newPot = Math.max(0, newPot - pts);
    } else {
      revSet.add(slotIdx);
      newPot += pts;
      Feud.playDing();
    }
    await pushRoomPatch({
      questionRevealed: true,
      revealed: Array.from(revSet),
      pot: newPot,
      turnTimerRunning: false,
      turnTimerRemaining: dur
    });
  }

  async function hostRevealAll() {
    Feud.unlockAudio();
    stopLocalTurnTimerInterval();
    const round = Feud.getRoundData(roomState, roomState.roundIdx);
    const all = round.answers.map((_, i) => i);
    Feud.playDing();
    await pushRoomPatch({
      questionRevealed: true,
      revealed: all,
      turnTimerRunning: false
    });
  }

  async function hostResetRound() {
    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      stage: "main",
      questionRevealed: false,
      controllingTeam: 0,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0
    });
  }

  async function hostSelectRound(idx) {
    stopLocalTurnTimerInterval();
    const total = Feud.getRoundCount(roomState);
    const cleanIdx = Math.max(0, Math.min(total - 1, Number(idx) || 0));
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      stage: "main",
      roundIdx: cleanIdx,
      questionRevealed: false,
      controllingTeam: 0,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0
    });
  }

  async function hostPrevRound() {
    const total = Feud.getRoundCount(roomState);
    const prev = (roomState.roundIdx - 1 + total) % total;
    await hostSelectRound(prev);
  }

  async function hostNextRound() {
    const total = Feud.getRoundCount(roomState);
    const next = (roomState.roundIdx + 1) % total;
    await hostSelectRound(next);
  }

  async function hostManualBuzz(team) {
    Feud.unlockAudio();
    if (roomState.buzzerWinner !== 0) return;
    Feud.playFaceOffTone(team);
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      buzzerWinner: team,
      questionRevealed: true,
      turnTimerRemaining: dur,
      turnTimerRunning: true
    });
    startLocalTurnTimerLoop();
  }

  async function hostResetBuzzers() {
    await pushRoomPatch({ buzzerWinner: 0 });
    Feud.showToast("Podium buzzers unlocked!");
  }

  async function hostTriggerStrike(count) {
    Feud.unlockAudio();
    stopLocalTurnTimerInterval();
    const num = count || Math.min(3, (roomState.strikes || 0) + 1);
    const nextSeq = (roomState.strikeSeq || 0) + 1;
    Feud.showBigRedXOverlay(num);

    // On 3rd strike, automatically pre-load a 15s Steal Huddle timer!
    const nextDur = num >= 3 ? 15 : Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      strikes: num,
      strikeSeq: nextSeq,
      turnTimerRunning: false,
      turnTimerRemaining: nextDur
    });

    if (num >= 3) {
      Feud.showToast("🚨 3 Strikes! Steal Opportunity — Press R to start 15s Steal Huddle!");
    }
  }

  async function hostClearStrikes() {
    await pushRoomPatch({ strikes: 0 });
  }

  async function hostCyclePresets() {
    const presets = Feud.getActiveTeamPresets(roomState);
    presetIdx = (presetIdx + 1) % presets.length;
    const [t1, t2] = presets[presetIdx];
    await pushRoomPatch({ team1Name: t1, team2Name: t2 });
    Feud.showToast(`Teams updated: ${t1} vs. ${t2}`);
  }

  async function hostRenameTeam(team, val) {
    const clean = val.trim() || `Team ${team}`;
    await pushRoomPatch(team === 1 ? { team1Name: clean } : { team2Name: clean });
  }

  async function hostAdjustScore(team, delta) {
    if (team === 1) {
      await pushRoomPatch({ team1Score: Math.max(0, (roomState.team1Score || 0) + delta) });
    } else {
      await pushRoomPatch({ team2Score: Math.max(0, (roomState.team2Score || 0) + delta) });
    }
  }

  async function hostAwardPot(team) {
    Feud.unlockAudio();
    stopLocalTurnTimerInterval();
    const pot = roomState.pot || 0;
    if (pot <= 0) {
      Feud.showToast("Round Pot is 0 — reveal an answer first!");
      return;
    }
    Feud.playFanfare();
    const nextFanfare = (roomState.fanfareSeq || 0) + 1;
    if (team === 1) {
      await pushRoomPatch({
        team1Score: (roomState.team1Score || 0) + pot,
        pot: 0,
        turnTimerRunning: false,
        fanfareSeq: nextFanfare
      });
      Feud.showToast(`🏆 Awarded ${pot} pts to ${roomState.team1Name}!`);
    } else {
      await pushRoomPatch({
        team2Score: (roomState.team2Score || 0) + pot,
        pot: 0,
        turnTimerRunning: false,
        fanfareSeq: nextFanfare
      });
      Feud.showToast(`🏆 Awarded ${pot} pts to ${roomState.team2Name}!`);
    }
  }

  // =====================================================================
  // 8. FAST MONEY CONTROLS & 1-TAP SCORING CHIPS
  // =====================================================================
  async function hostSwitchStage(stage) {
    if (stage === "fast" && roomState.enableFastMoney === false) {
      Feud.showToast("Fast Money is disabled for this match.");
      return;
    }
    stopLocalTurnTimerInterval();
    await pushRoomPatch({ stage, turnTimerRunning: false });
  }

  async function hostUpdateFm(idx, field, val) {
    const entries = (roomState.fmEntries || []).map((item) => ({ ...item }));
    if (!entries[idx]) entries[idx] = { p1Ans: "", p1Pts: 0, p2Ans: "", p2Pts: 0 };
    const patch = { fmEntries: entries };

    if (field === "p1Pts" || field === "p2Pts") {
      const n = parseInt(val, 10) || 0;
      entries[idx][field] = n;
      if (n > 0) {
        Feud.playDing();
      } else if (String(val).trim() === "0") {
        Feud.playBuzzerHonk();
        patch.zeroPtsSeq = (roomState.zeroPtsSeq || 0) + 1;
      }
    } else {
      entries[idx][field] = val;
    }
    await pushRoomPatch(patch);
  }

  async function hostSelectFmChip(idx, playerNum, ansText, pts) {
    Feud.unlockAudio();
    const entries = (roomState.fmEntries || []).map((item) => ({ ...item }));
    if (!entries[idx]) entries[idx] = { p1Ans: "", p1Pts: 0, p2Ans: "", p2Pts: 0 };

    const ansField = playerNum === 1 ? "p1Ans" : "p2Ans";
    const ptsField = playerNum === 1 ? "p1Pts" : "p2Pts";

    if (ansText !== null && ansText !== undefined) {
      entries[idx][ansField] = ansText;
    } else if (!entries[idx][ansField]) {
      entries[idx][ansField] = "—";
    }
    entries[idx][ptsField] = Number(pts) || 0;

    const patch = { fmEntries: entries };
    if (pts > 0) {
      Feud.playDing();
    } else {
      Feud.playBuzzerHonk();
      patch.zeroPtsSeq = (roomState.zeroPtsSeq || 0) + 1;
    }
    await pushRoomPatch(patch);
  }

  async function hostSetFmClock(sec) {
    clearInterval(hostFmTimerInterval);
    hostFmTimerInterval = null;
    const btn = document.getElementById("hostBtnFmTimer");
    if (btn) btn.textContent = "Start";
    await pushRoomPatch({ fmClock: sec });
  }

  function hostToggleFmClock() {
    Feud.unlockAudio();
    const btn = document.getElementById("hostBtnFmTimer");
    if (hostFmTimerInterval) {
      clearInterval(hostFmTimerInterval);
      hostFmTimerInterval = null;
      if (btn) btn.textContent = "Resume";
    } else {
      if (btn) btn.textContent = "Pause";
      hostFmTimerInterval = setInterval(async () => {
        const next = Math.max(0, (roomState.fmClock || 0) - 1);
        if (next > 0 && next <= 5) {
          Feud.playTick(next <= 3);
        }
        await pushRoomPatch({ fmClock: next });
        if (next <= 0) {
          clearInterval(hostFmTimerInterval);
          hostFmTimerInterval = null;
          if (btn) btn.textContent = "Time!";
          Feud.playBuzzerHonk();
        }
      }, 1000);
    }
  }

  async function hostFmDuplicateBuzz() {
    Feud.unlockAudio();
    Feud.playBuzzerHonk();
    const nextDup = (roomState.dupBuzzSeq || 0) + 1;
    await pushRoomPatch({ dupBuzzSeq: nextDup });
    Feud.showToast("❌ Duplicate Answer — Try Again!");
  }

  async function hostToggleFmHideP1() {
    await pushRoomPatch({ fmHideP1: !roomState.fmHideP1 });
  }

  async function hostResetFm() {
    clearInterval(hostFmTimerInterval);
    hostFmTimerInterval = null;
    const btn = document.getElementById("hostBtnFmTimer");
    if (btn) btn.textContent = "Start";
    const fmList = Feud.getFastMoneyList(roomState);
    await pushRoomPatch({
      fmClock: 20,
      fmHideP1: false,
      fmEntries: fmList.map(() => ({ p1Ans: "", p1Pts: 0, p2Ans: "", p2Pts: 0 }))
    });
  }

  // =====================================================================
  // 9. EDIT ROUND MODAL + UNIVERSAL DECK MANAGER (CSV / FRIENDLY-FEUD JSON)
  // =====================================================================
  function openEditRoundModal() {
    const round = Feud.getRoundData(roomState, roomState.roundIdx);
    document.getElementById("editPromptInput").value = round.prompt;
    document.getElementById("editMultSelect").value = String(round.multiplier);

    const container = document.getElementById("editAnswersInputs");
    container.innerHTML = "";
    const maxSlots = Math.max(6, round.answers.length, 8);
    for (let i = 0; i < maxSlots; i++) {
      const ans = round.answers[i] || { text: "", points: "" };
      const row = document.createElement("div");
      row.className = "fm-in-pair";
      row.innerHTML = `
        <span class="host-rank-circle" style="margin-top:5px;">${i + 1}</span>
        <input id="editAnsText_${i}" class="fm-txt" style="text-transform:none;" type="text" placeholder="Answer #${
          i + 1
        } (optional)" value="${Feud.escapeHtml(ans.text)}" />
        <input id="editAnsPts_${i}" class="fm-num display-font" type="number" min="0" max="200" placeholder="Pts" value="${
          ans.points !== "" ? ans.points : ""
        }" />
      `;
      container.appendChild(row);
    }

    document.getElementById("editRoundModal").classList.remove("hidden");
  }

  function closeEditRoundModal() {
    document.getElementById("editRoundModal").classList.add("hidden");
  }

  async function saveEditedRound() {
    const newPrompt = document.getElementById("editPromptInput").value.trim();
    const newMult = Number(document.getElementById("editMultSelect").value) || 1;
    const newAnswers = [];

    for (let i = 0; i < 8; i++) {
      const textEl = document.getElementById(`editAnsText_${i}`);
      const ptsEl = document.getElementById(`editAnsPts_${i}`);
      if (!textEl || !ptsEl) continue;
      const t = textEl.value.trim();
      const p = parseInt(ptsEl.value, 10);
      if (t) {
        newAnswers.push({ text: t, points: isNaN(p) ? 10 : p });
      }
    }

    if (!newPrompt || newAnswers.length === 0) {
      Feud.showToast("Please enter a prompt and at least 1 answer.");
      return;
    }

    const activeRound = Feud.getRoundData(roomState, roomState.roundIdx);
    const customKey =
      activeRound && activeRound.sourceIdx !== undefined
        ? String(activeRound.sourceIdx)
        : String(roomState.roundIdx);

    const customRounds = { ...(roomState.customRounds || {}) };
    customRounds[customKey] = {
      prompt: newPrompt,
      multiplier: newMult,
      answers: newAnswers
    };

    Feud.saveCustomRounds(customRounds);
    closeEditRoundModal();
    await pushRoomPatch({ customRounds, revealed: [], pot: 0 });
    Feud.populateRoundDropdowns(roomState);
    Feud.showToast("✅ Custom round saved locally & synced to TV!");
  }

  async function resetCurrentRoundToDefault() {
    const activeRound = Feud.getRoundData(roomState, roomState.roundIdx);
    const customKey =
      activeRound && activeRound.sourceIdx !== undefined
        ? String(activeRound.sourceIdx)
        : String(roomState.roundIdx);
    const customRounds = { ...(roomState.customRounds || {}) };
    delete customRounds[customKey];
    delete customRounds[String(roomState.roundIdx)];
    Feud.saveCustomRounds(customRounds);
    closeEditRoundModal();
    await pushRoomPatch({ customRounds, revealed: [], pot: 0 });
    Feud.populateRoundDropdowns(roomState);
    Feud.showToast("Restored default question & answers for this round.");
  }

  function openDeckManagerModal() {
    const titleIn = document.getElementById("deckGameTitleInput");
    const iconIn = document.getElementById("deckGameIconInput");
    if (titleIn) titleIn.value = roomState.gameTitle || "Party Feud";
    if (iconIn) iconIn.value = roomState.gameIcon || "🎉";
    document.getElementById("deckManagerModal").classList.remove("hidden");
  }

  function closeDeckManagerModal() {
    document.getElementById("deckManagerModal").classList.add("hidden");
  }

  async function saveCustomGameBranding() {
    const titleIn = document.getElementById("deckGameTitleInput");
    const iconIn = document.getElementById("deckGameIconInput");
    const cleanTitle = (titleIn && titleIn.value.trim()) || "Party Feud";
    const cleanIcon = (iconIn && iconIn.value.trim()) || "🎉";
    Feud.saveGameTitle(cleanTitle);
    Feud.saveGameIcon(cleanIcon);
    await pushRoomPatch({ gameTitle: cleanTitle, gameIcon: cleanIcon });
    Feud.showToast(`✅ Updated branding to "${cleanIcon} ${cleanTitle}"!`);
  }

  async function importDeckFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const fileName = file.name || "Custom Deck";
    const isCsv = /\.csv$/i.test(fileName);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = String(e.target.result || "");
        await applyImportedDeckText(content, fileName, isCsv, true);
        event.target.value = "";
      } catch (err) {
        Feud.showToast(`❌ Import failed: ${err.message || "Invalid file format"}`);
      }
    };
    reader.readAsText(file);
  }

  async function loadDeckFromUrlInput() {
    const urlIn = document.getElementById("deckRemoteUrlInput");
    const url = urlIn ? urlIn.value.trim() : "";
    if (!url) {
      Feud.showToast("Paste a URL to a .csv or .json deck file first.");
      return;
    }
    await fetchAndApplyRemoteDeck(url, true);
  }

  async function fetchAndApplyRemoteDeck(url, closeModals = true) {
    try {
      // Check if this URL matches a bundled deck in decks/catalog.js first!
      const fileName = url.split("/").pop().split("?")[0];
      const catalog = getCatalogList();
      const bundled = catalog.find(
        (c) => c.data && (c.id.toLowerCase() === fileName.toLowerCase() || c.file === url)
      );
      if (bundled && bundled.data) {
        await applyImportedDeckText(JSON.stringify(bundled.data), bundled.id, false, closeModals);
        return;
      }

      Feud.showToast("⏳ Loading question deck…");
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const isCsv =
        /\.csv($|\?)/i.test(url) ||
        (!text.trim().startsWith("{") && !text.trim().startsWith("["));
      const label = fileName || "Remote Deck";
      await applyImportedDeckText(text, label, isCsv, closeModals);
    } catch (err) {
      Feud.showToast(`❌ Could not load deck: ${err.message}`);
    }
  }

  async function applyImportedDeckText(content, sourceLabel, isCsv, closeModals = true) {
    const parsed = isCsv ? Feud.parseFeudCsv(content) : Feud.parseFeudJson(content);

    if (parsed.kind === "overrides") {
      const merged = { ...(roomState.customRounds || {}), ...parsed.customRounds };
      Feud.saveCustomRounds(merged);
      await pushRoomPatch({ customRounds: merged, revealed: [], pot: 0 });
      Feud.populateRoundDropdowns(roomState);
      if (closeModals) {
        closeDeckManagerModal();
        closeEditRoundModal();
      }
      Feud.showToast("✅ Imported custom poll overrides!");
      return;
    }

    const customDeck = {
      name: parsed.deckName || sourceLabel.replace(/\.(json|csv)$/i, ""),
      teamPresets: parsed.teamPresets || null,
      rounds: parsed.rounds,
      fastMoney: parsed.fastMoney || null
    };

    const nextTitle = parsed.gameTitle || roomState.gameTitle || "Party Feud";
    const nextIcon = parsed.gameIcon || roomState.gameIcon || "🎉";
    Feud.saveCustomDeck(customDeck);
    Feud.saveCustomRounds({});
    Feud.saveGameTitle(nextTitle);
    Feud.saveGameIcon(nextIcon);

    const presets = Feud.getActiveTeamPresets({ customDeck });
    const [t1, t2] = presets[0] || [roomState.team1Name, roomState.team2Name];

    const fmList = (customDeck.fastMoney || Feud.getFastMoneyList({ customDeck })).slice(0, 5);
    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      gameTitle: nextTitle,
      gameIcon: nextIcon,
      team1Name: t1,
      team2Name: t2,
      customDeck,
      customRounds: {},
      matchRounds: null,
      matchSourceIndices: null,
      matchFastMoney: fmList,
      roundIdx: 0,
      questionRevealed: false,
      controllingTeam: 0,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0,
      fmEntries: fmList.map(() => ({ p1Ans: "", p1Pts: 0, p2Ans: "", p2Pts: 0 }))
    });

    Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
    if (closeModals) {
      closeDeckManagerModal();
      closeEditRoundModal();
    }
    Feud.showToast(`🎉 Loaded "${customDeck.name}" (${parsed.rounds.length} rounds)!`);
  }

  async function restoreDefaultDeck(closeModals = true) {
    Feud.saveCustomDeck(null);
    Feud.saveCustomRounds({});
    const defTitle = (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameTitle) || "Party Feud";
    const defIcon = (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameIcon) || "🎉";
    Feud.saveGameTitle(defTitle);
    Feud.saveGameIcon(defIcon);

    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;
    const fresh = Feud.createDefaultRoomState(roomState.pin);
    await pushRoomPatch({
      gameTitle: defTitle,
      gameIcon: defIcon,
      team1Name: fresh.team1Name,
      team2Name: fresh.team2Name,
      customDeck: null,
      customRounds: {},
      matchRounds: null,
      matchSourceIndices: null,
      matchFastMoney: fresh.matchFastMoney,
      roundIdx: 0,
      questionRevealed: false,
      controllingTeam: 0,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0,
      fmEntries: fresh.fmEntries
    });

    Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
    if (closeModals) {
      closeDeckManagerModal();
    }
    Feud.showToast(`${defIcon} Restored the default Starter Party Deck!`);
  }

  function triggerFileDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadDeckAsCsv() {
    const rounds = Feud.getAllEffectiveRounds(roomState);
    const fm = Feud.getSourceFastMoneyList(roomState);
    const csv = Feud.exportToCsv(rounds, fm);
    triggerFileDownload("party-feud-deck.csv", csv, "text/csv;charset=utf-8;");
    Feud.showToast("📥 Downloaded CSV Spreadsheet (Google Sheets / Excel ready)!");
  }

  function downloadDeckAsFriendlyFeudJson() {
    const rounds = Feud.getAllEffectiveRounds(roomState);
    const fm = Feud.getSourceFastMoneyList(roomState);
    const json = Feud.exportToFriendlyFeudJson(rounds, fm);
    triggerFileDownload("friendly-feud-pack.json", json, "application/json");
    Feud.showToast("📥 Downloaded Friendly-Feud compatible JSON pack!");
  }

  function downloadDeckAsNativeJson() {
    const rounds = Feud.getAllEffectiveRounds(roomState);
    const fm = Feud.getSourceFastMoneyList(roomState);
    const json = Feud.exportToNativeDeckJson(rounds, fm, roomState);
    triggerFileDownload("party-feud-deck.json", json, "application/json");
    Feud.showToast("📥 Downloaded Full Party Feud Deck JSON!");
  }

  // =====================================================================
  // 10. TOP BAR UTILITIES & KEYBOARD SHORTCUTS
  // =====================================================================
  function toggleMute() {
    const muted = Feud.toggleAudioMute();
    document.getElementById("btnMute").textContent = muted ? "🔇 Muted" : "🔊 Sound";
    Feud.showToast(muted ? "Sound Muted" : "Sound Enabled");
  }

  function toggleFullScreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() =>
          Feud.showToast("Rotate phone sideways for widescreen TV!")
        );
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else {
        Feud.showToast("Rotate phone sideways for widescreen TV!");
      }
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }

  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (activeRole !== "solo" && activeRole !== "host") return;
    if (roomState.stage === "fast") return;

    if (e.key >= "1" && e.key <= "8") {
      const slot = parseInt(e.key, 10) - 1;
      hostToggleAnswer(slot);
    } else if (e.key === " ") {
      e.preventDefault();
      hostRevealQuestionAndStartTimer();
    } else if (e.key === "r" || e.key === "R") {
      hostRestartTurnTimer();
    } else if (e.key === "t" || e.key === "T") {
      hostToggleTurnTimer();
    } else if (e.key === "x" || e.key === "X") {
      hostTriggerStrike();
    } else if (e.key === "c" || e.key === "C") {
      hostClearStrikes();
    } else if (e.key === "ArrowRight") {
      hostNextRound();
    } else if (e.key === "ArrowLeft") {
      hostPrevRound();
    }
  });

  Object.assign(window, {
    requestWakeLock,
    toggleMute,
    toggleFullScreen,
    leaveToLobby,
    onSelectCatalogDeck,
    resetCurrentDeckHistory,
    openNewGameModal,
    closeNewGameModal,
    cycleSetupTeamPresets,
    loadBuiltInDeck,
    confirmStartNewGame,
    openNextMatchModal,
    closeNextMatchModal,
    setNextMatchContenderMode,
    cycleNextMatchChallengerPreset,
    confirmStartNextMatch,
    openQrModal,
    closeQrModal,
    createHostRoom,
    joinHostRoom,
    joinTvDisplay,
    joinTeamBuzzer,
    startLocalSoloMode,
    switchSoloAndHostView,
    openEditRoundModal,
    closeEditRoundModal,
    saveEditedRound,
    resetCurrentRoundToDefault,
    openDeckManagerModal,
    closeDeckManagerModal,
    saveCustomGameBranding,
    importDeckFile,
    loadDeckFromUrlInput,
    restoreDefaultDeck,
    downloadDeckAsCsv,
    downloadDeckAsFriendlyFeudJson,
    downloadDeckAsNativeJson,
    pressTeamBuzzer,
    hostRevealQuestionAndStartTimer,
    hostToggleQuestionVisibility,
    hostRestartTurnTimer,
    hostToggleTurnTimer,
    hostStopResetTurnTimer,
    hostSetTurnTimerDuration,
    hostSetControllingTeam,
    hostToggleAnswer,
    hostRevealAll,
    hostResetRound,
    hostSelectRound,
    hostPrevRound,
    hostNextRound,
    hostManualBuzz,
    hostResetBuzzers,
    hostTriggerStrike,
    hostClearStrikes,
    hostCyclePresets,
    hostRenameTeam,
    hostAdjustScore,
    hostAwardPot,
    hostSwitchStage,
    hostUpdateFm,
    hostSelectFmChip,
    hostSetFmClock,
    hostToggleFmClock,
    hostFmDuplicateBuzz,
    hostToggleFmHideP1,
    hostResetFm
  });

  function initOnLoad() {
    requestWakeLock();
    populateDeckCatalogSelect();
    discoverGitHubDecksFolder();
    Feud.renderBranding(roomState);
    document.getElementById("roleSubtitle").textContent = `4-Phone Multiplayer • ${Feud.getRoundCount(
      roomState
    )} Rounds`;

    const params = new URLSearchParams(window.location.search);
    const urlTitle = (params.get("title") || "").trim();
    const urlIcon = (params.get("icon") || "").trim();
    if (urlTitle) {
      roomState.gameTitle = urlTitle;
      Feud.saveGameTitle(urlTitle);
    }
    if (urlIcon) {
      roomState.gameIcon = urlIcon;
      Feud.saveGameIcon(urlIcon);
    }
    if (urlTitle || urlIcon) {
      Feud.renderBranding(roomState);
    }

    const urlDeck = (params.get("deck") || "").trim();
    if (urlDeck) {
      fetchAndApplyRemoteDeck(urlDeck, true);
    }

    const urlRoom = (params.get("room") || "").trim().toUpperCase();
    if (urlRoom) {
      ["hostJoinCode", "tvRoomInput", "buzzerRoomInput"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = urlRoom;
      });
    } else {
      const last = Feud.loadLastSession();
      if (last && last.code && last.code !== "SOLO") {
        ["hostJoinCode", "tvRoomInput", "buzzerRoomInput"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = last.code;
        });
        if (last.pin) {
          const pinEl = document.getElementById("hostJoinPin");
          if (pinEl) pinEl.value = last.pin;
        }
      }
    }
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initOnLoad);
  } else {
    initOnLoad();
  }
})(window.Feud);
