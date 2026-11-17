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
  let lastBeSpecificSeq = 0;
  let lastTimeUpSeq = 0;
  let lastZeroPtsSeq = 0;
  let lastRevealedCount = 0;
  let lastBuzzerWinner = 0;
  let hostFmTimerInterval = null;
  let hostTurnTimerInterval = null;
  let presetIdx = 0;
  let nextMatchContenderMode = "winner-stays"; // 'winner-stays' | 'new-teams'
  let undoStack = [];
  const MAX_UNDO_STACK = 25;

  function buildUndoSnapshot() {
    return {
      stage: roomState.stage || "main",
      roundIdx: roomState.roundIdx || 0,
      roundPhase: roomState.roundPhase || "faceoff-ready",
      questionRevealed: Boolean(roomState.questionRevealed),
      controllingTeam: roomState.controllingTeam || 0,
      faceoffFirstTeam: roomState.faceoffFirstTeam || 0,
      faceoffBestRank: roomState.faceoffBestRank ?? 999,
      faceoffWinnerTeam: roomState.faceoffWinnerTeam || 0,
      originalPlayingTeam: roomState.originalPlayingTeam || 0,
      roundWinnerTeam: roomState.roundWinnerTeam || 0,
      lastOverlayXCount: roomState.lastOverlayXCount || 1,
      revealed: Array.isArray(roomState.revealed) ? [...roomState.revealed] : [],
      pot: roomState.pot || 0,
      strikes: roomState.strikes || 0,
      team1Score: roomState.team1Score || 0,
      team2Score: roomState.team2Score || 0,
      buzzerWinner: roomState.buzzerWinner || 0,
      buzzerArmedTeam: roomState.buzzerArmedTeam || 0,
      turnTimerRemaining:
        typeof roomState.turnTimerRemaining === "number"
          ? roomState.turnTimerRemaining
          : Number(roomState.turnTimerDuration) || 10,
      turnTimerRunning: false
    };
  }

  function pushUndoSnapshot() {
    undoStack.push(buildUndoSnapshot());
    if (undoStack.length > MAX_UNDO_STACK) {
      undoStack.shift();
    }
  }

  function clearUndoStack() {
    undoStack = [];
  }

  async function hostUndo() {
    Feud.unlockAudio();
    if (!undoStack.length) {
      Feud.showToast("Nothing to undo.");
      return;
    }
    stopLocalTurnTimerInterval();
    const snap = undoStack.pop();
    await pushRoomPatch(snap);
    Feud.showToast("↩️ Undid last action!");
  }

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
    lastBeSpecificSeq = state.beSpecificSeq || 0;
    lastTimeUpSeq = state.timeUpSeq || 0;
    lastZeroPtsSeq = state.zeroPtsSeq || 0;
    lastRevealedCount = Array.isArray(state.revealed) ? state.revealed.length : 0;
    lastBuzzerWinner = state.buzzerWinner || 0;
  }

  Feud.initSyncCallbacks({
    getLocalState: () => roomState,
    onForcedExit: (reason) => {
      Feud.playBuzzerHonk();
      leaveToLobby({ force: true });
      Feud.showToast(reason || "🔒 This buzzer is already open on another device.");
    },
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
          Feud.showBigRedXOverlay(incoming.lastOverlayXCount || incoming.strikes || 1);
        }
      }

      if (typeof incoming.soundMuted === "boolean") {
        Feud.setAudioMuted(incoming.soundMuted);
        syncMuteButtonLabels(incoming.soundMuted);
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

      if (incoming.beSpecificSeq && incoming.beSpecificSeq !== lastBeSpecificSeq) {
        lastBeSpecificSeq = incoming.beSpecificSeq;
        if (activeRole === "tv" || activeRole === "solo") {
          Feud.showBeSpecificOverlay();
          Feud.showToast("🔍 Please Be More Specific!");
        }
      }

      if (incoming.timeUpSeq && incoming.timeUpSeq !== lastTimeUpSeq) {
        lastTimeUpSeq = incoming.timeUpSeq;
        if (
          activeRole === "tv" ||
          activeRole === "buzzer1" ||
          activeRole === "buzzer2" ||
          activeRole === "buzzer_combo"
        ) {
          Feud.playTimeUpBell();
          if (navigator.vibrate && activeRole !== "tv") navigator.vibrate([150, 80, 150]);
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

      const customChanged =
        JSON.stringify(incoming.customRounds || {}) !==
          JSON.stringify(roomState.customRounds || {}) ||
        JSON.stringify(incoming.customDeck || null) !==
          JSON.stringify(roomState.customDeck || null) ||
        JSON.stringify(incoming.matchRounds || null) !==
          JSON.stringify(roomState.matchRounds || null) ||
        incoming.roundPhase !== roomState.roundPhase ||
        incoming.roundIdx !== roomState.roundIdx;

      const prevStage = roomState.stage;
      roomState = { ...roomState, ...incoming };

      if (incoming.buzzerWinner && incoming.buzzerWinner !== lastBuzzerWinner) {
        if (activeRole === "tv" || activeRole === "host" || activeRole === "solo") {
          Feud.playFaceOffTone(incoming.buzzerWinner);
        }
        if (activeRole === "host" && incoming.turnTimerRunning) {
          startLocalTurnTimerLoop();
        }
      }
      lastBuzzerWinner = incoming.buzzerWinner || 0;

      Feud.renderBranding(roomState);
      if (customChanged) {
        Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
      }
      renderActiveView();
      if (activeRole === "host" && roomState.stage === "winner" && prevStage !== "winner") {
        populateAndShowNextMatchModal();
      }
    }
  });

  async function pushRoomPatch(patch) {
    // Any buzzer change that doesn't explicitly re-arm a team disarms the Face-Off re-arm flag,
    // so a stale "armed" buzzer can never steal control mid-round.
    if ("buzzerWinner" in patch && !("buzzerArmedTeam" in patch)) {
      patch = { ...patch, buzzerArmedTeam: 0 };
    }
    let markedUsed = null;
    if (patch && patch.questionRevealed === true) {
      const nextState = { ...roomState, ...patch };
      markedUsed = Feud.markCurrentRoundUsed ? Feud.markCurrentRoundUsed(nextState) : null;
      if (markedUsed) {
        patch = { ...patch, usedRoundIndices: markedUsed };
      }
    }
    roomState = { ...roomState, ...patch, updatedAt: Date.now() };
    syncSequenceCounters(roomState);
    if (markedUsed || "questionRevealed" in patch) {
      Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
    }
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
    const sel = document.getElementById("deckManagerSelect");
    if (!sel) return;

    const catalog = getCatalogList();
    const activeDeckName =
      roomState.customDeck && roomState.customDeck.name ? roomState.customDeck.name : null;

    sel.innerHTML = "";
    let matched = false;

    catalog.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = Feud.formatDeckOptionLabel
        ? Feud.formatDeckOptionLabel(item)
        : item.label;
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

    const selectedVal = sel.value || "starter";
    const deckSlug =
      selectedVal === "__custom__"
        ? ""
        : String(selectedVal).replace(/\.(json|csv)$/i, "");
    const reviewHref = deckSlug
      ? `./review.html?deck=${encodeURIComponent(deckSlug)}&from=setup`
      : "./review.html?from=setup";
    document.querySelectorAll(".review-deck-link").forEach((linkEl) => {
      linkEl.setAttribute("href", reviewHref);
    });
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
    const autoXCheck = document.getElementById("setupAutoStartOnStrikeCheckbox");
    const pinIn = document.getElementById("setupHostPinInput");
    const lobbyPin = document.getElementById("hostPinCreate");

    if (iconIn) iconIn.value = roomState.gameIcon || "🎉";
    if (titleIn) titleIn.value = roomState.gameTitle || "Party Feud";
    if (t1In) t1In.value = roomState.team1Name || "Team Alpha";
    if (t2In) t2In.value = roomState.team2Name || "Team Omega";
    if (timerSel) timerSel.value = String(roomState.turnTimerDuration || 10);
    if (rdsSel) rdsSel.value = String(roomState.roundsPerMatch ?? 4);
    if (orderSel) orderSel.value = roomState.roundOrder || "shuffle-by-level";
    if (fmCheck) fmCheck.checked = Boolean(roomState.enableFastMoney);
    if (autoXCheck) autoXCheck.checked = Boolean(roomState.autoStartTimerOnStrike);
    if (pinIn && lobbyPin && lobbyPin.value.trim()) {
      pinIn.value = lobbyPin.value.trim();
    }
    syncDeckManagerBrandingInputs();
    Feud.renderBranding(roomState);
  }

  function syncDeckManagerBrandingInputs() {
    const titleIn = document.getElementById("deckGameTitleInput");
    const iconIn = document.getElementById("deckGameIconInput");
    if (titleIn) titleIn.value = roomState.gameTitle || "Party Feud";
    if (iconIn) iconIn.value = roomState.gameIcon || "🎉";
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
    clearUndoStack();
    const iconVal =
      (document.getElementById("deckGameIconInput")?.value || "").trim() ||
      roomState.gameIcon ||
      "🎉";
    const titleVal =
      (document.getElementById("deckGameTitleInput")?.value || "").trim() ||
      roomState.gameTitle ||
      (roomState.customDeck && roomState.customDeck.name) ||
      "Party Feud";
    const t1Val = (document.getElementById("setupTeam1Input")?.value || "").trim() || "Team 1";
    const t2Val = (document.getElementById("setupTeam2Input")?.value || "").trim() || "Team 2";
    const timerDur =
      parseInt(document.getElementById("setupTurnTimerSelect")?.value || "10", 10) || 10;
    const roundsPerMatch = parseInt(
      document.getElementById("setupRoundsPerMatchSelect")?.value ?? "4",
      10
    );
    const roundOrder =
      document.getElementById("setupRoundOrderSelect")?.value || "shuffle-by-level";
    const enableFastMoney = Boolean(
      document.getElementById("setupEnableFastMoneyCheckbox")?.checked
    );
    const autoStartTimerOnStrike = Boolean(
      document.getElementById("setupAutoStartOnStrikeCheckbox")?.checked
    );
    const pinVal = (document.getElementById("setupHostPinInput")?.value || "").trim() || "1234";

    if (!/^\d{4}$/.test(pinVal)) {
      Feud.showToast("Please enter a 4-digit numeric Host PIN (e.g., 1234).");
      return;
    }

    Feud.saveGameIcon(iconVal);
    Feud.saveGameTitle(titleVal);

    stopLocalTurnTimerInterval();
    clearInterval(hostFmTimerInterval);
    hostFmTimerInterval = null;

    const fresh = Feud.createDefaultRoomState(pinVal);
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
      usedRoundIndices: slice.usedRoundIndices || slice.matchSourceIndices || [],
      matchFastMoney: slice.matchFastMoney,
      activeFmSetIdx: slice.activeFmSetIdx,
      roundIdx: 0,
      roundPhase: "faceoff-ready",
      questionRevealed: false,
      controllingTeam: 0,
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      faceoffWinnerTeam: 0,
      originalPlayingTeam: 0,
      roundWinnerTeam: 0,
      lastOverlayXCount: 1,
      turnTimerDuration: timerDur,
      turnTimerRemaining: timerDur,
      turnTimerRunning: false,
      autoStartTimerOnStrike,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0,
      fmClock: 20,
      fmHideP1: false,
      fmEntries: slice.matchFastMoney.map(() => ({ p1Ans: "", p1Pts: 0, p2Ans: "", p2Pts: 0 }))
    };

    closeNewGameModal();

    const code = Feud.generateRoomCode();
    currentRoomCode = code;
    syncSequenceCounters(roomState);
    Feud.saveRoomStateToStorage(code, roomState);
    enterRole("host", code);
    Feud.saveLastSession("host", code, pinVal);
    await Feud.startHostRoomSync(code, roomState);
    openTvSetupChoiceModal(code);
  }

  function openTvSetupChoiceModal(code) {
    const codeEl = document.getElementById("tvChoiceRoomCode");
    if (codeEl) codeEl.textContent = code || currentRoomCode || "----";
    const qrBtn = document.getElementById("tvChoiceQrBtn");
    if (qrBtn) {
      qrBtn.disabled = isFileProtocol();
      qrBtn.title = isFileProtocol()
        ? "QR requires http:// or https:// (not file://)"
        : "Show TV QR code";
    }
    document.getElementById("tvSetupChoiceModal")?.classList.remove("hidden");
  }

  function chooseTvSetupOption(choice) {
    document.getElementById("tvSetupChoiceModal")?.classList.add("hidden");
    const code = currentRoomCode;
    if (choice === "local") {
      if (openTvDisplayWindow(code)) {
        Feud.showToast(`Room ${code} ready! 📺 TV window opened — drag it to your TV screen.`);
      }
    } else if (choice === "qr") {
      openRemoteTvQrModal();
    } else {
      Feud.showToast(`Room ${code} ready! Playing with Host screen view.`);
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

  async function joinTvDisplay(opts) {
    const autoLaunched = Boolean(opts && opts.autoLaunched === true);
    Feud.unlockAudio();
    const code = document.getElementById("tvRoomInput").value.trim().toUpperCase();
    if (code.length < 4) {
      Feud.showToast("Enter the 4-character Room Code from the Host.");
      return;
    }

    if (!autoLaunched) {
      if (openTvDisplayWindow(code)) return;
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
    // An auto-launched TV window shares localStorage with the Host window — don't overwrite the Host's saved session/PIN
    if (!autoLaunched) Feud.saveLastSession("tv", code);
    enterRole("tv", code);
    Feud.showToast(
      autoLaunched
        ? `📺 TV connected to Room ${code}! Drag this window to the TV, then click ⛶ TV Fullscreen (click once to enable sound).`
        : `📺 TV Display connected to Room ${code}!`
    );
  }

  // Opens (or reuses) a dedicated TV Display window that auto-joins the given room.
  // Must be called synchronously inside the click handler so browsers don't block the popup.
  const openedBuzzerPopups = { buzzer1: null, buzzer2: null, buzzer_combo: null };

  function getOpenedPopupBuzzers() {
    const out = { b1: false, b2: false, combo: false };
    Object.keys(openedBuzzerPopups).forEach((role) => {
      const w = openedBuzzerPopups[role];
      if (w && !w.closed) {
        if (role === "buzzer1") out.b1 = true;
        if (role === "buzzer2") out.b2 = true;
        if (role === "buzzer_combo") out.combo = true;
      } else {
        openedBuzzerPopups[role] = null;
      }
    });
    return out;
  }

  function openRoleWindow(code, role, windowName, features) {
    const baseUrl = window.location.href.split("?")[0].split("#")[0];
    const targetUrl = `${baseUrl}?room=${encodeURIComponent(code)}&role=${encodeURIComponent(role)}`;
    let win = null;
    try {
      win = window.open(targetUrl, windowName, features);
    } catch (e) {
      win = null;
    }
    if (!win) {
      Feud.showToast(
        `⚠️ Popup blocked — allow popups for this site to open ${role} in a new window.`
      );
      return null;
    }
    try {
      win.focus();
    } catch (e) {}
    return win;
  }

  function openTvDisplayWindow(code) {
    return Boolean(
      openRoleWindow(code, "tv", "partyFeudTvDisplay", "popup=yes,width=1280,height=720")
    );
  }

  function reopenTvWindow() {
    if (!currentRoomCode || currentRoomCode === "SOLO") return;
    openTvDisplayWindow(currentRoomCode);
  }

  async function joinTeamBuzzer(teamNum, opts) {
    const autoLaunched = Boolean(opts && opts.autoLaunched === true);
    Feud.unlockAudio();
    requestWakeLock();
    const code = document.getElementById("buzzerRoomInput").value.trim().toUpperCase();
    if (code.length < 4) {
      Feud.showToast("Enter the 4-character Room Code first!");
      return;
    }

    const role = teamNum === 1 ? "buzzer1" : "buzzer2";
    if (!autoLaunched) {
      const popupWin = openRoleWindow(
        code,
        role,
        `partyFeudBuzzer${teamNum}`,
        "popup=yes,width=480,height=780"
      );
      if (popupWin) {
        openedBuzzerPopups[role] = popupWin;
        refreshLobbyBuzzerLocks(false);
        return;
      }
    }
    Feud.showToast(`Connecting Team ${teamNum} Buzzer to ${code}…`);
    let res = await Feud.joinExistingRoomSync({ code, role });
    if (!res.ok && autoLaunched && !(res.error && res.error.includes("already open"))) {
      Feud.showToast(`Retrying Team ${teamNum} Buzzer connection…`);
      await new Promise((r) => setTimeout(r, 1500));
      res = await Feud.joinExistingRoomSync({ code, role });
    }
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

  async function joinComboBuzzer(opts) {
    const autoLaunched = Boolean(opts && opts.autoLaunched === true);
    Feud.unlockAudio();
    requestWakeLock();
    const code = document.getElementById("buzzerRoomInput").value.trim().toUpperCase();
    if (code.length < 4) {
      Feud.showToast("Enter the 4-character Room Code first!");
      return;
    }

    const role = "buzzer_combo";
    if (!autoLaunched) {
      const popupWin = openRoleWindow(
        code,
        role,
        "partyFeudComboBuzzer",
        "popup=yes,width=540,height=860"
      );
      if (popupWin) {
        openedBuzzerPopups[role] = popupWin;
        refreshLobbyBuzzerLocks(false);
        return;
      }
    }
    Feud.showToast(`Connecting Combo Buzzer to ${code}…`);
    let res = await Feud.joinExistingRoomSync({ code, role });
    if (!res.ok && autoLaunched && !(res.error && res.error.includes("already open"))) {
      Feud.showToast("Retrying Combo Buzzer connection…");
      await new Promise((r) => setTimeout(r, 1500));
      res = await Feud.joinExistingRoomSync({ code, role });
    }
    if (!res.ok) {
      Feud.showToast(res.error || `Room "${code}" not found.`);
      return;
    }

    roomState = { ...roomState, ...res.state };
    currentRoomCode = code;
    syncSequenceCounters(roomState);
    Feud.saveLastSession(role, code);
    enterRole(role, code);
    Feud.showToast("🔔 Combo Buzzer Ready!");
  }

  async function startLocalSoloMode() {
    openNewGameModal("solo");
  }

  let embeddedTvResizeObserver = null;

  function updateEmbeddedTvScale() {
    const tvEl = document.getElementById("tvView");
    const dockEl = document.getElementById("hostTvMonitorDock");
    if (!tvEl || !dockEl || !tvEl.classList.contains("embedded-in-host")) return;
    const dockWidth = dockEl.clientWidth || 480;
    const scale = Math.max(0.18, Math.min(1, dockWidth / 1280));
    tvEl.style.setProperty("--tv-scale", scale.toFixed(4));
  }

  function syncTvViewPlacement(role) {
    const tvEl = document.getElementById("tvView");
    const dockEl = document.getElementById("hostTvMonitorDock");
    const anchorEl = document.getElementById("tvViewRootAnchor");
    if (!tvEl) return;

    if (role === "host" && dockEl) {
      if (tvEl.parentElement !== dockEl) {
        dockEl.appendChild(tvEl);
      }
      tvEl.classList.add("embedded-in-host");
      tvEl.classList.remove("hidden");
      if (!embeddedTvResizeObserver && typeof ResizeObserver !== "undefined") {
        embeddedTvResizeObserver = new ResizeObserver(() => updateEmbeddedTvScale());
        embeddedTvResizeObserver.observe(dockEl);
      }
      requestAnimationFrame(() => updateEmbeddedTvScale());
    } else {
      tvEl.classList.remove("embedded-in-host");
      tvEl.style.removeProperty("--tv-scale");
      if (anchorEl && anchorEl.parentNode && tvEl.previousElementSibling !== anchorEl) {
        anchorEl.parentNode.insertBefore(tvEl, anchorEl.nextSibling);
      }
    }
  }

  window.addEventListener("resize", () => {
    if (activeRole === "host") updateEmbeddedTvScale();
  });

  function enterRole(role, code) {
    activeRole = role;
    try {
      const url = new URL(window.location.href);
      if (code && code !== "SOLO") {
        url.searchParams.set("room", code);
        url.searchParams.set("role", role);
      } else {
        url.searchParams.delete("room");
        url.searchParams.delete("role");
      }
      url.searchParams.delete("returnTo");
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
    document.body.classList.toggle("tv-viewport-lock", role === "tv" || role === "solo");
    // Anti-accident lock: Buzzer phones hide the top mode-switcher behind a 3-second hold
    document.body.classList.toggle(
      "buzzer-nav-locked",
      role === "buzzer1" || role === "buzzer2" || role === "buzzer_combo"
    );
    requestWakeLock();
    Feud.renderBranding(roomState);

    document.getElementById("lobbyView").classList.add("hidden");
    document.getElementById("tvView").classList.add("hidden");
    document.getElementById("hostView").classList.add("hidden");
    document.getElementById("buzzerView").classList.add("hidden");
    document.getElementById("comboBuzzerView")?.classList.add("hidden");
    document.getElementById("comboBuzzerView")?.classList.add("hidden");

    const codeBadge = document.getElementById("roomCodeBadge");
    const qrBtn = document.getElementById("btnQrCode");
    const menuQrBtn = document.getElementById("hostMenuQrBtn");
    const leaveBtn = document.getElementById("btnLeaveRoom");
    const sub = document.getElementById("roleSubtitle");

    codeBadge.textContent = `Room: ${code}`;
    codeBadge.classList.remove("hidden");
    const hideQr = code === "SOLO" || isFileProtocol();
    if (qrBtn) qrBtn.classList.toggle("hidden", hideQr);
    if (menuQrBtn) menuQrBtn.classList.toggle("hidden", hideQr);
    leaveBtn.classList.remove("hidden");

    syncTvViewPlacement(role);

    if (role === "host") {
      document.getElementById("hostView").classList.remove("hidden");
      document.getElementById("tvView").classList.remove("hidden");
      sub.textContent = `Host Remote • PIN: ${roomState.pin}`;
      Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
      requestAnimationFrame(() => updateEmbeddedTvScale());
    } else if (role === "tv") {
      document.getElementById("tvView").classList.remove("hidden");
      sub.textContent = "TV Display Screen (Cast Mode)";
    } else if (role === "solo") {
      document.getElementById("tvView").classList.remove("hidden");
      sub.textContent = "Single-Screen Interactive TV Board";
      Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
    } else if (role === "buzzer1" || role === "buzzer2") {
      document.getElementById("buzzerView").classList.remove("hidden");
      sub.textContent = role === "buzzer1" ? "Team 1 Podium Buzzer" : "Team 2 Podium Buzzer";
    } else if (role === "buzzer_combo") {
      document.getElementById("comboBuzzerView")?.classList.remove("hidden");
      sub.textContent = "Combo Shared Buzzer";
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

  // ---------------------------------------------------------------------
  // Buzzer-phone anti-accident exit: press & hold for 3 seconds to leave
  // ---------------------------------------------------------------------
  const BUZZER_EXIT_HOLD_MS = 3000;
  let buzzerExitTimer = null;
  let buzzerExitTick = null;

  function buzzerExitHoldStart(ev, btnId = "buzzerExitHoldBtn") {
    if (ev && ev.preventDefault) ev.preventDefault();
    buzzerExitHoldCancel(btnId);
    const btn = document.getElementById(btnId);
    const startedAt = Date.now();
    if (btn) btn.classList.add("holding");
    buzzerExitTick = setInterval(() => {
      const left = Math.max(0, BUZZER_EXIT_HOLD_MS - (Date.now() - startedAt));
      if (btn) {
        btn.style.setProperty("--hold-pct", `${Math.round((1 - left / BUZZER_EXIT_HOLD_MS) * 100)}%`);
        btn.textContent =
          btnId === "comboExitHoldBtn"
            ? `🔓 ${Math.ceil(left / 1000)}s`
            : `🔓 Keep holding… ${Math.ceil(left / 1000)}s`;
      }
    }, 100);
    buzzerExitTimer = setTimeout(() => {
      buzzerExitHoldCancel(btnId);
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      leaveToLobby({ force: true });
    }, BUZZER_EXIT_HOLD_MS);
  }

  function buzzerExitHoldCancel(btnId = "buzzerExitHoldBtn") {
    clearTimeout(buzzerExitTimer);
    clearInterval(buzzerExitTick);
    buzzerExitTimer = null;
    buzzerExitTick = null;
    ["buzzerExitHoldBtn", "comboExitHoldBtn", btnId].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.remove("holding");
        btn.style.setProperty("--hold-pct", "0%");
        btn.textContent = id === "comboExitHoldBtn" ? "🔒" : "🔒 Hold 3s to Exit Buzzer";
      }
    });
  }

  function leaveToLobby(opts) {
    const force = Boolean(opts && opts.force === true);
    if (activeRole === "host" && !force) {
      const baseUrl = window.location.href.split("?")[0].split("#")[0];
      const win = window.open(baseUrl, "_blank");
      if (win) {
        try {
          win.focus();
        } catch (e) {}
        return;
      }
      if (!window.confirm("Leave Host View and return to the Lobby?")) return;
    }
    // Guard: buzzer phones may only leave via the 3-second hold (or an explicit confirm)
    if (
      (activeRole === "buzzer1" || activeRole === "buzzer2" || activeRole === "buzzer_combo") &&
      !force
    ) {
      if (!window.confirm("Leave Buzzer Mode and return to the Lobby?")) return;
    }
    document.body.classList.remove("buzzer-nav-locked");
    clearUndoStack();
    Feud.cleanupSync();
    Feud.clearLastSession();
    stopLocalTurnTimerInterval();
    clearInterval(hostFmTimerInterval);
    hostFmTimerInterval = null;
    activeRole = "lobby";
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      url.searchParams.delete("role");
      url.searchParams.delete("returnTo");
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
    syncTvViewPlacement("lobby");
    document.body.classList.remove("tv-viewport-lock");
    document.getElementById("lobbyView").classList.remove("hidden");
    document.getElementById("tvView").classList.add("hidden");
    document.getElementById("hostView").classList.add("hidden");
    document.getElementById("buzzerView").classList.add("hidden");
    document.getElementById("comboBuzzerView")?.classList.add("hidden");
    document.getElementById("roomCodeBadge").classList.add("hidden");
    document.getElementById("btnQrCode")?.classList.add("hidden");
    document.getElementById("btnLeaveRoom").classList.add("hidden");
    document.getElementById("roleSubtitle").textContent = "Live Party Multiplayer";
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

  function populateAndShowNextMatchModal() {
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

  async function openNextMatchModal() {
    Feud.unlockAudio();
    stopLocalTurnTimerInterval();
    const nextFanfare = (roomState.fanfareSeq || 0) + 1;
    Feud.playFanfare();
    await pushRoomPatch({ stage: "winner", turnTimerRunning: false, fanfareSeq: nextFanfare });
    populateAndShowNextMatchModal();
  }

  function closeNextMatchModal() {
    document.getElementById("nextMatchModal")?.classList.add("hidden");
  }

  async function returnToBoardFromWinnerModal() {
    closeNextMatchModal();
    await pushRoomPatch({ stage: "main", turnTimerRunning: false });
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
    clearUndoStack();
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
      usedRoundIndices: slice.usedRoundIndices || slice.matchSourceIndices || [],
      matchFastMoney: slice.matchFastMoney,
      activeFmSetIdx: slice.activeFmSetIdx,
      roundIdx: 0,
      roundPhase: "faceoff-ready",
      questionRevealed: false,
      controllingTeam: 0,
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      faceoffWinnerTeam: 0,
      originalPlayingTeam: 0,
      roundWinnerTeam: 0,
      lastOverlayXCount: 1,
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
    syncSetupModalInputsFromState();
    Feud.showToast(
      `🚀 Match #${slice.matchNumber} Started: ${t1} vs. ${t2} (Fresh Unplayed Rounds)!`
    );
  }

  // =====================================================================
  // 6. ROOM QR CODE MODAL
  // =====================================================================
  function applyBuzzerButtonLocks(bz) {
    const info = bz || (Feud.getConnectedBuzzerTeams ? Feud.getConnectedBuzzerTeams() : {});
    const b1 = Boolean(info.b1);
    const b2 = Boolean(info.b2);
    const combo = Boolean(info.combo);

    const qrB1 = document.getElementById("qrCard_buzzer1");
    const qrB2 = document.getElementById("qrCard_buzzer2");
    const qrCombo = document.getElementById("qrCard_buzzer_combo");
    const badgeB1 = document.getElementById("qrBadge_buzzer1");
    const badgeB2 = document.getElementById("qrBadge_buzzer2");
    const badgeCombo = document.getElementById("qrBadge_buzzer_combo");
    if (qrB1) qrB1.disabled = b1 || combo;
    if (qrB2) qrB2.disabled = b2 || combo;
    if (qrCombo) qrCombo.disabled = combo || b1 || b2;
    const activeTvRole = roomState && roomState.tvQrOverlay ? roomState.tvQrOverlay.role : null;
    if (badgeB1) {
      badgeB1.textContent =
        b1 || combo
          ? combo
            ? "🔒 Combo Open"
            : "🔒 Team 1 Open"
          : activeTvRole === "buzzer1"
          ? "📺 Showing on TV (click to hide)"
          : "Click to show on TV";
    }
    if (badgeB2) {
      badgeB2.textContent =
        b2 || combo
          ? combo
            ? "🔒 Combo Open"
            : "🔒 Team 2 Open"
          : activeTvRole === "buzzer2"
          ? "📺 Showing on TV (click to hide)"
          : "Click to show on TV";
    }
    if (badgeCombo) {
      badgeCombo.textContent =
        combo || b1 || b2
          ? combo
            ? "🔒 Combo Open"
            : "🔒 Team Buzzer Open"
          : activeTvRole === "buzzer_combo"
          ? "📺 Showing on TV (click to hide)"
          : "Click to show on TV";
    }

    const lobbyB1 = document.getElementById("btnJoinBuzzer1");
    const lobbyB2 = document.getElementById("btnJoinBuzzer2");
    const lobbyCombo = document.getElementById("btnJoinBuzzerCombo");
    if (lobbyB1) {
      lobbyB1.disabled = b1 || combo;
      lobbyB1.textContent = combo
        ? "🔒 Team 1 (Combo Open)"
        : b1
        ? "🔒 Team 1 Open"
        : "🔔 Team 1 Buzzer";
    }
    if (lobbyB2) {
      lobbyB2.disabled = b2 || combo;
      lobbyB2.textContent = combo
        ? "🔒 Team 2 (Combo Open)"
        : b2
        ? "🔒 Team 2 Open"
        : "🔔 Team 2 Buzzer";
    }
    if (lobbyCombo) {
      lobbyCombo.disabled = combo || b1 || b2;
      lobbyCombo.textContent = combo
        ? "🔒 Combo Buzzer Open"
        : b1 || b2
        ? "🔒 Combo Buzzer (Team Open)"
        : "🔔 Combo Buzzer (Shared Device)";
    }
  }

  let lobbyProbeTimer = null;
  function refreshLobbyBuzzerLocks(allowPeer = true) {
    const popupBz = getOpenedPopupBuzzers();
    const input = document.getElementById("buzzerRoomInput");
    const code = (input ? input.value : "").trim().toUpperCase();
    if (code.length < 4 || !Feud.probeRoomBuzzers) {
      applyBuzzerButtonLocks(popupBz);
      return;
    }
    applyBuzzerButtonLocks(popupBz);
    Feud.probeRoomBuzzers(code, { allowPeer }).then((bz) => {
      const latest = (input ? input.value : "").trim().toUpperCase();
      if (latest === code) {
        const curPop = getOpenedPopupBuzzers();
        applyBuzzerButtonLocks({
          b1: Boolean(bz.b1 || curPop.b1),
          b2: Boolean(bz.b2 || curPop.b2),
          combo: Boolean(bz.combo || curPop.combo)
        });
      }
    });
  }

  const QR_LAN_HOST_KEY = "party_feud_lan_host_v1";
  let detectedLanIp = "";
  let lanIpDetectPromise = null;
  let lastQrRole = "tv";

  function isFileProtocol() {
    return window.location.protocol === "file:";
  }

  function isLoopbackHost() {
    const h = (window.location.hostname || "").toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "[::1]";
  }

  function getSavedLanHost() {
    try {
      return (localStorage.getItem(QR_LAN_HOST_KEY) || "").trim();
    } catch (e) {
      return "";
    }
  }

  function detectLanIp() {
    if (detectedLanIp) return Promise.resolve(detectedLanIp);
    if (lanIpDetectPromise) return lanIpDetectPromise;
    const RTC = window.RTCPeerConnection || window.webkitRTCPeerConnection;
    if (!RTC) return Promise.resolve("");

    lanIpDetectPromise = new Promise((resolve) => {
      let pc = null;
      let done = false;
      const finish = (ip) => {
        if (done) return;
        done = true;
        try {
          if (pc) pc.close();
        } catch (e) {}
        if (ip) detectedLanIp = ip;
        resolve(ip || "");
      };
      const timer = setTimeout(() => finish(""), 750);
      try {
        pc = new RTC({ iceServers: [] });
        pc.createDataChannel("");
        pc.onicecandidate = (ev) => {
          if (!ev || !ev.candidate || !ev.candidate.candidate) return;
          const match = ev.candidate.candidate.match(
            /\b((?:192\.168|10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3})\b/
          );
          if (match && match[1]) {
            clearTimeout(timer);
            finish(match[1]);
          }
        };
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(() => {
            clearTimeout(timer);
            finish("");
          });
      } catch (e) {
        clearTimeout(timer);
        finish("");
      }
    });
    return lanIpDetectPromise;
  }

  function getQrBaseUrl() {
    const rawBase = window.location.href.split("?")[0].split("#")[0];
    if (!isLoopbackHost()) return rawBase;
    const overrideHost = getSavedLanHost() || detectedLanIp;
    if (!overrideHost) return rawBase;
    try {
      const u = new URL(rawBase);
      u.hostname = overrideHost;
      return u.toString();
    } catch (e) {
      return rawBase;
    }
  }

  function applyQrLanHost() {
    const input = document.getElementById("qrLanHostInput");
    const val = (input ? input.value : "").trim().replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
    try {
      if (val) {
        localStorage.setItem(QR_LAN_HOST_KEY, val);
      } else {
        localStorage.removeItem(QR_LAN_HOST_KEY);
      }
    } catch (e) {}
    openQrModal(roomState && roomState.tvQrOverlay ? roomState.tvQrOverlay.role : null);
  }

  function buildQrJoinUrl(role) {
    const code = currentRoomCode || "SOLO";
    const baseUrl = getQrBaseUrl();
    return `${baseUrl}?room=${encodeURIComponent(code)}&role=${encodeURIComponent(role)}`;
  }

  function refreshQrGridCards() {
    const roles = ["tv", "buzzer1", "buzzer2", "buzzer_combo"];
    const activeTvRole = roomState && roomState.tvQrOverlay ? roomState.tvQrOverlay.role : null;
    const hideBtn = document.getElementById("qrHideFromTvBtn");
    if (hideBtn) hideBtn.classList.toggle("hidden", !activeTvRole);

    roles.forEach((r) => {
      const url = buildQrJoinUrl(r);
      const imgEl = document.getElementById(`qrImg_${r}`);
      const urlEl = document.getElementById(`qrUrl_${r}`);
      const cardEl = document.getElementById(`qrCard_${r}`);
      const badgeEl = document.getElementById(`qrBadge_${r}`);
      if (urlEl) urlEl.textContent = url;
      if (imgEl && imgEl.dataset.qrUrl !== url) {
        imgEl.dataset.qrUrl = url;
        imgEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(
          url
        )}`;
      }
      const isShowingOnTv = activeTvRole === r;
      if (cardEl) cardEl.classList.toggle("is-active-on-tv", isShowingOnTv);
      if (badgeEl && !(cardEl && cardEl.disabled)) {
        badgeEl.textContent = isShowingOnTv ? "📺 Showing on TV (click to hide)" : "Click to show on TV";
      }
    });
  }

  function selectQrForTv(qrRole) {
    if (isFileProtocol()) return;
    const currentTvRole = roomState && roomState.tvQrOverlay ? roomState.tvQrOverlay.role : null;
    const nextRole = !qrRole || qrRole === currentTvRole ? null : qrRole;

    if (activeRole === "host" && roomState) {
      if (nextRole) {
        const code = currentRoomCode || "SOLO";
        pushRoomPatch({
          tvQrOverlay: { role: nextRole, url: buildQrJoinUrl(nextRole), roomCode: code }
        });
      } else {
        pushRoomPatch({ tvQrOverlay: null });
      }
    }
    refreshQrGridCards();
    applyBuzzerButtonLocks();
  }

  function openQrModal(initialTvRole = null) {
    if (isFileProtocol()) {
      Feud.showToast("Join QR is only available when served over HTTP/HTTPS (not file://).");
      return;
    }
    const code = currentRoomCode || "SOLO";
    const qrTextEl = document.getElementById("qrRoomCodeText");
    if (qrTextEl) qrTextEl.textContent = code;

    const lanWrap = document.getElementById("qrLanHostWrap");
    const lanInput = document.getElementById("qrLanHostInput");
    const lanHint = document.getElementById("qrLanHostHint");
    if (lanWrap) {
      const loopback = isLoopbackHost();
      lanWrap.classList.toggle("hidden", !loopback);
      if (loopback) {
        const activeIp = getSavedLanHost() || detectedLanIp;
        if (lanInput && document.activeElement !== lanInput) {
          lanInput.value = activeIp;
        }
        if (lanHint) {
          lanHint.textContent = activeIp
            ? `Using network IP ${activeIp} instead of ${window.location.hostname}.`
            : "Browser hid local IP — enter your PC's Wi-Fi IP (e.g. 192.168.1.50) so phones can scan.";
        }
        if (!activeIp) {
          detectLanIp().then((ip) => {
            if (ip && !getSavedLanHost()) {
              const modal = document.getElementById("qrModal");
              if (modal && !modal.classList.contains("hidden")) {
                openQrModal(roomState && roomState.tvQrOverlay ? roomState.tvQrOverlay.role : null);
              }
            }
          });
        }
      }
    }

    document.getElementById("qrModal")?.classList.remove("hidden");
    if (initialTvRole && activeRole === "host" && roomState) {
      pushRoomPatch({
        tvQrOverlay: {
          role: initialTvRole,
          url: buildQrJoinUrl(initialTvRole),
          roomCode: code
        }
      });
    }
    refreshQrGridCards();
    applyBuzzerButtonLocks();
  }

  function openRemoteTvQrModal() {
    if (isFileProtocol()) {
      Feud.showToast("Join QR is only available when served over HTTP/HTTPS (not file://).");
      return;
    }
    const code = currentRoomCode || "SOLO";
    const url = buildQrJoinUrl("tv");
    const codeEl = document.getElementById("remoteTvQrRoomCode");
    const urlEl = document.getElementById("remoteTvQrUrl");
    const imgEl = document.getElementById("remoteTvQrImg");
    if (codeEl) codeEl.textContent = code;
    if (urlEl) urlEl.textContent = url;
    if (imgEl && imgEl.dataset.qrUrl !== url) {
      imgEl.dataset.qrUrl = url;
      imgEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(
        url
      )}`;
    }

    const lanWrap = document.getElementById("remoteTvLanHostWrap");
    const lanInput = document.getElementById("remoteTvLanHostInput");
    const lanHint = document.getElementById("remoteTvLanHostHint");
    if (lanWrap) {
      const loopback = isLoopbackHost();
      lanWrap.classList.toggle("hidden", !loopback);
      if (loopback) {
        const activeIp = getSavedLanHost() || detectedLanIp;
        if (lanInput && document.activeElement !== lanInput) {
          lanInput.value = activeIp;
        }
        if (lanHint) {
          lanHint.textContent = activeIp
            ? `Using network IP ${activeIp} instead of ${window.location.hostname}.`
            : "Browser hid local IP — enter your PC's Wi-Fi IP (e.g. 192.168.1.50) so your TV can scan.";
        }
        if (!activeIp) {
          detectLanIp().then((ip) => {
            if (ip && !getSavedLanHost()) {
              const modal = document.getElementById("remoteTvQrModal");
              if (modal && !modal.classList.contains("hidden")) {
                openRemoteTvQrModal();
              }
            }
          });
        }
      }
    }

    document.getElementById("remoteTvQrModal")?.classList.remove("hidden");
  }

  function closeRemoteTvQrModal() {
    document.getElementById("remoteTvQrModal")?.classList.add("hidden");
  }

  function applyRemoteTvLanHost() {
    const input = document.getElementById("remoteTvLanHostInput");
    const val = (input ? input.value : "").trim().replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
    try {
      if (val) {
        localStorage.setItem(QR_LAN_HOST_KEY, val);
      } else {
        localStorage.removeItem(QR_LAN_HOST_KEY);
      }
    } catch (e) {}
    openRemoteTvQrModal();
  }

  function closeQrModal() {
    document.getElementById("qrModal")?.classList.add("hidden");
    if (activeRole === "host" && roomState && roomState.tvQrOverlay) {
      pushRoomPatch({ tvQrOverlay: null });
    }
  }

  // =====================================================================
  // 7. VIEW DISPATCHER, QUESTION REVEAL & PLAYER TURN TIMER ENGINE
  // =====================================================================
  const viewHandlers = {
    onToggleAnswer: (idx) => hostToggleAnswer(idx),
    onUpdateFm: (idx, field, val) => hostUpdateFm(idx, field, val),
    onSelectFmChip: (idx, playerNum, ansText, pts) =>
      hostSelectFmChip(idx, playerNum, ansText, pts),
    canUndo: () => undoStack.length > 0
  };

  function renderActiveView() {
    if (activeRole === "tv" || activeRole === "solo") {
      Feud.renderTvView(roomState, activeRole, viewHandlers);
    } else if (activeRole === "host") {
      Feud.renderTvView(roomState, "tv", viewHandlers);
      Feud.renderHostView(roomState, viewHandlers);
      updateEmbeddedTvScale();
    } else if (activeRole === "buzzer1" || activeRole === "buzzer2") {
      Feud.renderBuzzerView(roomState, activeRole);
    } else if (activeRole === "buzzer_combo") {
      Feud.renderComboBuzzerView(roomState);
    }
  }

  function stopLocalTurnTimerInterval() {
    if (hostTurnTimerInterval) {
      clearInterval(hostTurnTimerInterval);
      hostTurnTimerInterval = null;
    }
  }

  function getTeamNameByNum(teamNum) {
    if (teamNum === 1) return roomState.team1Name || "Team 1";
    if (teamNum === 2) return roomState.team2Name || "Team 2";
    return "Team";
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
        Feud.playTimeUpBell();
        Feud.showToast(
          "⏰ Time's Up! You can still tap a board answer, tap ❌ Wrong (X), or Restart Timer (R)."
        );
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
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");

    if (phase === "faceoff-ready" || !roomState.questionRevealed) {
      pushUndoSnapshot();
      Feud.playTick(false);
      if (roomState.buzzerWinner) {
        await pushRoomPatch({
          questionRevealed: true,
          roundPhase: "faceoff-p1",
          turnTimerRemaining: dur,
          turnTimerRunning: true
        });
        startLocalTurnTimerLoop();
        Feud.showToast("📺 Question Revealed & Face-Off Timer Started!");
      } else {
        await pushRoomPatch({
          questionRevealed: true,
          roundPhase: "faceoff-buzz",
          turnTimerRemaining: dur,
          turnTimerRunning: false
        });
        Feud.showToast(
          "📺 Question Revealed on TV! Players have unlimited time until the first person buzzes."
        );
      }
      return;
    }

    if (phase === "faceoff-buzz" && !roomState.buzzerWinner) {
      Feud.showToast(
        "🔔 Unlimited time until the first player buzzes in (or click a team's Buzz button)!"
      );
      return;
    }

    await hostRestartTurnTimer();
  }

  async function hostToggleQuestionVisibility() {
    Feud.unlockAudio();
    const nextShown = !roomState.questionRevealed;
    if (!nextShown) {
      if (Array.isArray(roomState.revealed) && roomState.revealed.length > 0) {
        Feud.showToast("Cannot hide the question after an answer has been revealed!");
        return;
      }
      pushUndoSnapshot();
      stopLocalTurnTimerInterval();
      const dur = Number(roomState.turnTimerDuration) || 10;
      await pushRoomPatch({
        questionRevealed: false,
        turnTimerRunning: false,
        turnTimerRemaining: dur
      });
    } else {
      await pushRoomPatch({
        questionRevealed: true,
        roundPhase:
          roomState.roundPhase === "faceoff-ready" ? "faceoff-buzz" : roomState.roundPhase
      });
    }
  }

  async function hostRestartTurnTimer() {
    Feud.unlockAudio();
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    if (phase === "steal") {
      await hostStartStealTimer();
      return;
    }
    if (phase === "pass-or-play") {
      await hostChoosePlayOrPass("play");
      return;
    }
    const dur = Number(roomState.turnTimerDuration) || 10;
    Feud.playTick(false);
    await pushRoomPatch({
      questionRevealed: true,
      turnTimerRemaining: dur,
      turnTimerRunning: true
    });
    startLocalTurnTimerLoop();
  }

  async function hostStartStealTimer() {
    Feud.unlockAudio();
    Feud.playTick(false);
    await pushRoomPatch({
      questionRevealed: true,
      roundPhase: "steal",
      turnTimerRemaining: 30,
      turnTimerRunning: true
    });
    startLocalTurnTimerLoop();
  }

  async function hostChoosePlayOrPass(decision) {
    Feud.unlockAudio();
    pushUndoSnapshot();
    stopLocalTurnTimerInterval();
    const winTeam = roomState.faceoffWinnerTeam || roomState.controllingTeam || 1;
    const passTeam = winTeam === 1 ? 2 : 1;
    const playingTeam = decision === "pass" ? passTeam : winTeam;
    const playingName = getTeamNameByNum(playingTeam);
    const dur = Number(roomState.turnTimerDuration) || 10;

    await pushRoomPatch({
      questionRevealed: true,
      roundPhase: "playing",
      controllingTeam: playingTeam,
      originalPlayingTeam: playingTeam,
      buzzerWinner: 0,
      strikes: 0,
      turnTimerRemaining: dur,
      turnTimerRunning: false
    });
    Feud.showToast(
      decision === "pass"
        ? `🔀 Passed! 🎯 ${playingName} is now playing the board. Press R (or Start Timer) when ready.`
        : `▶️ ${playingName} is playing the board! Press R (or Start Timer) when ready.`
    );
  }

  async function hostToggleTurnTimer() {
    Feud.unlockAudio();
    const dur =
      roomState.roundPhase === "steal" ? 30 : Number(roomState.turnTimerDuration) || 10;
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
    const dur =
      roomState.roundPhase === "steal" ? 30 : Number(roomState.turnTimerDuration) || 10;
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

  async function hostToggleAutoStartTimerOnStrike(enabled) {
    const clean = Boolean(enabled);
    await pushRoomPatch({ autoStartTimerOnStrike: clean });
    Feud.showToast(
      clean
        ? "⏱️ Auto-start timer on 'X' is now ON."
        : "⏱️ Auto-start timer on 'X' is now OFF."
    );
  }

  async function hostSetFaceOffWinner(teamNum) {
    Feud.unlockAudio();
    pushUndoSnapshot();
    const cleanTeam = Number(teamNum) === 2 ? 2 : 1;
    const teamName = getTeamNameByNum(cleanTeam);
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");

    if (phase === "pass-or-play") {
      await pushRoomPatch({
        faceoffWinnerTeam: cleanTeam,
        controllingTeam: cleanTeam,
        buzzerWinner: cleanTeam
      });
      Feud.showToast(`🏆 ${teamName} selected as Face-Off Winner — choose Play or Pass!`);
      return;
    }

    if (phase === "faceoff-p2") {
      const dur = Number(roomState.turnTimerDuration) || 10;
      await pushRoomPatch({
        controllingTeam: cleanTeam,
        buzzerWinner: cleanTeam,
        turnTimerRemaining: dur,
        turnTimerRunning: true
      });
      startLocalTurnTimerLoop();
      Feud.showToast(`🎤 ${teamName} answering Face-Off Turn 2!`);
      return;
    }

    const dur = Number(roomState.turnTimerDuration) || 10;
    Feud.playFaceOffTone(cleanTeam);
    await pushRoomPatch({
      questionRevealed: true,
      roundPhase: "faceoff-p1",
      faceoffFirstTeam: cleanTeam,
      controllingTeam: cleanTeam,
      buzzerWinner: cleanTeam,
      buzzerArmedTeam: 0,
      turnTimerRemaining: dur,
      turnTimerRunning: true
    });
    startLocalTurnTimerLoop();
    Feud.showToast(`🔔 ${teamName} answering Face-Off! Click their answer below or tap ❌ Wrong.`);
  }

  async function hostSetControllingTeam(teamNum) {
    pushUndoSnapshot();
    stopLocalTurnTimerInterval();
    const cleanTeam = [0, 1, 2].includes(Number(teamNum)) ? Number(teamNum) : 0;
    const dur = Number(roomState.turnTimerDuration) || 10;
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    const revCount = (roomState.revealed || []).length;

    if (cleanTeam === 0) {
      await pushRoomPatch({
        controllingTeam: 0,
        roundPhase: roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready",
        buzzerWinner: 0,
        buzzerArmedTeam: 0,
        turnTimerRunning: false,
        turnTimerRemaining: dur
      });
      Feud.showToast("⚡ Face-Off Mode");
    } else if (phase === "pass-or-play") {
      await hostSetFaceOffWinner(cleanTeam);
    } else if (String(phase).startsWith("faceoff") && revCount === 0) {
      await hostSetFaceOffWinner(cleanTeam);
    } else {
      await pushRoomPatch({
        controllingTeam: cleanTeam,
        originalPlayingTeam: cleanTeam,
        roundPhase: "playing",
        buzzerWinner: 0,
        buzzerArmedTeam: 0,
        turnTimerRunning: false,
        turnTimerRemaining: dur
      });
      Feud.showToast(`🎯 ${getTeamNameByNum(cleanTeam)} has control of the board!`);
    }
  }

  let lastLocalBuzzAt = 0;

  async function pressTeamBuzzer(ev) {
    if (ev && ev.cancelable) ev.preventDefault();
    const now = Date.now();
    if (now - lastLocalBuzzAt < 250) return;
    lastLocalBuzzAt = now;

    Feud.unlockAudio();
    const myTeam = activeRole === "buzzer1" ? 1 : 2;
    // Local first-tap guard (the Host re-validates authoritatively in sync.js#buildBuzzPatch)
    if (Feud.buildBuzzPatch && !Feud.buildBuzzPatch(roomState, myTeam)) return;
    Feud.playFaceOffTone(myTeam);
    if (navigator.vibrate) navigator.vibrate(120);
    await Feud.syncSendTeamBuzz(myTeam);
  }

  async function pressComboBuzzer(teamNum, ev) {
    if (ev && ev.cancelable) ev.preventDefault();
    const now = Date.now();
    if (now - lastLocalBuzzAt < 250) return;
    lastLocalBuzzAt = now;

    Feud.unlockAudio();
    const cleanTeam = teamNum === 2 ? 2 : 1;
    if (Feud.buildBuzzPatch && !Feud.buildBuzzPatch(roomState, cleanTeam)) return;
    Feud.playFaceOffTone(cleanTeam);
    if (navigator.vibrate) navigator.vibrate(120);
    await Feud.syncSendTeamBuzz(cleanTeam);
  }

  async function hostToggleAnswer(slotIdx) {
    Feud.unlockAudio();
    const round = Feud.getRoundData(roomState, roomState.roundIdx);
    const ans = round.answers[slotIdx];
    if (!ans) return;

    const dur = Number(roomState.turnTimerDuration) || 10;
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");

    if (phase === "faceoff-ready" || phase === "faceoff-buzz") {
      Feud.showToast("Tap which team buzzed first before revealing answers!");
      return;
    }
    if (phase === "pass-or-play") {
      Feud.showToast("Choose Play or Pass before revealing answers!");
      return;
    }

    const revSet = new Set(roomState.revealed || []);
    if (revSet.has(slotIdx)) {
      Feud.showToast("Already revealed — use ↩️ Undo if you tapped by mistake.");
      return;
    }

    pushUndoSnapshot();
    stopLocalTurnTimerInterval();
    const pts = ans.points * round.multiplier;
    let newPot = roomState.pot || 0;

    // Revealing a tile!
    revSet.add(slotIdx);
    Feud.playDing();

    // If the round is already over (pot already awarded), reveal tile without adding points to pot!
    if (phase === "round-over") {
      await pushRoomPatch({
        questionRevealed: true,
        revealed: Array.from(revSet),
        turnTimerRunning: false
      });
      return;
    }

    newPot += pts;
    const allBoardRevealed = revSet.size >= round.answers.length;
    const isTieBreaker = Feud.isTieBreakerRound && Feud.isTieBreakerRound(round);
    const regCount = Feud.getRegularRoundCount
      ? Feud.getRegularRoundCount(roomState)
      : Feud.getRoundCount(roomState);
    const isFinalRegularRound = !isTieBreaker && roomState.roundIdx === regCount - 1;

    // 0. SUDDEN-DEATH TIE-BREAKER ROUND: Only ends when a team picks the #1 answer!
    if (isTieBreaker) {
      const activeTeam =
        roomState.controllingTeam ||
        roomState.buzzerWinner ||
        roomState.faceoffFirstTeam ||
        roomState.faceoffWinnerTeam ||
        1;
      if (slotIdx === 0) {
        const winName = getTeamNameByNum(activeTeam);
        const awardPts = Math.max(pts, 10);
        const nextT1 =
          activeTeam === 1 ? (roomState.team1Score || 0) + awardPts : roomState.team1Score || 0;
        const nextT2 =
          activeTeam === 2 ? (roomState.team2Score || 0) + awardPts : roomState.team2Score || 0;
        const nextFanfare = (roomState.fanfareSeq || 0) + 1;
        setTimeout(() => Feud.playFanfare(), 400);

        await pushRoomPatch({
          stage: roomState.stage || "main",
          questionRevealed: true,
          revealed: Array.from(revSet),
          pot: 0,
          team1Score: nextT1,
          team2Score: nextT2,
          roundPhase: "round-over",
          roundWinnerTeam: activeTeam,
          controllingTeam: activeTeam,
          buzzerWinner: 0,
          buzzerArmedTeam: 0,
          turnTimerRemaining: dur,
          turnTimerRunning: false,
          fanfareSeq: nextFanfare
        });
        Feud.showToast(
          `🏆 Tie-Breaker #1 Answer! ${winName} Wins the Match! Reveal any remaining answers, then click "🏆 Show Winner Screen"!`
        );
        return;
      }

      const otherTeam = activeTeam === 1 ? 2 : 1;
      const otherName = getTeamNameByNum(otherTeam);
      const nextPhase = phase === "faceoff-p1" ? "faceoff-p2" : "faceoff-p1";
      await pushRoomPatch({
        questionRevealed: true,
        revealed: Array.from(revSet),
        pot: newPot,
        roundPhase: nextPhase,
        faceoffFirstTeam: phase === "faceoff-p1" ? activeTeam : otherTeam,
        controllingTeam: otherTeam,
        buzzerWinner: 0,
        buzzerArmedTeam: 0,
        turnTimerRemaining: dur,
        turnTimerRunning: false
      });
      Feud.showToast(
        `#${slotIdx + 1} revealed — must find the #1 answer to win! ${otherName}'s turn.`
      );
      return;
    }

    // 1. FACE-OFF TURN 1 (or if host clicked an answer right from faceoff-ready/buzz)
    // #1 answer wins immediately -> "pass-or-play".
    // Any lower-ranked answer (#2-#8) gives the other team a chance to beat it in "faceoff-p2".
    if (phase === "faceoff-ready" || phase === "faceoff-buzz" || phase === "faceoff-p1") {
      const firstTeam =
        roomState.controllingTeam || roomState.buzzerWinner || roomState.faceoffFirstTeam || 1;
      const firstName = getTeamNameByNum(firstTeam);
      const secondTeam = firstTeam === 1 ? 2 : 1;
      const secondName = getTeamNameByNum(secondTeam);

      if (slotIdx === 0) {
        await pushRoomPatch({
          questionRevealed: true,
          revealed: Array.from(revSet),
          pot: newPot,
          roundPhase: "pass-or-play",
          strikes: 0,
          faceoffFirstTeam: firstTeam,
          faceoffBestRank: 0,
          faceoffWinnerTeam: firstTeam,
          controllingTeam: firstTeam,
          buzzerWinner: firstTeam,
          buzzerArmedTeam: 0,
          turnTimerRunning: false,
          turnTimerRemaining: dur
        });
        Feud.showToast(
          `🏆 #1 Answer! ${firstName} Wins the Face-Off — Choose PLAY or PASS!`
        );
        return;
      }

      await pushRoomPatch({
        questionRevealed: true,
        revealed: Array.from(revSet),
        pot: newPot,
        roundPhase: "faceoff-p2",
        faceoffFirstTeam: firstTeam,
        faceoffBestRank: slotIdx,
        faceoffWinnerTeam: 0,
        controllingTeam: secondTeam,
        buzzerWinner: 0,
        buzzerArmedTeam: 0,
        turnTimerRunning: true,
        turnTimerRemaining: dur
      });
      startLocalTurnTimerLoop();
      Feud.showToast(
        `🎤 #${slotIdx + 1} Answer! ${secondName}'s turn to try to beat #${slotIdx + 1}!`
      );
      return;
    }

    // 2. FACE-OFF TURN 2 (After Team 1 missed with a Temp X, or if Team 2 is answering to beat Team 1's rank)
    if (
      phase === "faceoff-p2" ||
      (phase === "pass-or-play" &&
        (roomState.revealed || []).length === 1 &&
        (roomState.faceoffBestRank ?? 0) > 0)
    ) {
      const firstTeam = roomState.faceoffFirstTeam || roomState.faceoffWinnerTeam || 1;
      const secondTeam =
        phase === "faceoff-p2"
          ? roomState.controllingTeam || (firstTeam === 1 ? 2 : 1)
          : firstTeam === 1
          ? 2
          : 1;
      const prevBest = roomState.faceoffBestRank ?? 999;
      const winTeam = slotIdx < prevBest ? secondTeam : firstTeam;
      const winName = getTeamNameByNum(winTeam);

      await pushRoomPatch({
        questionRevealed: true,
        revealed: Array.from(revSet),
        pot: newPot,
        roundPhase: "pass-or-play",
        strikes: 0,
        faceoffBestRank: 0,
        faceoffWinnerTeam: winTeam,
        controllingTeam: winTeam,
        buzzerWinner: winTeam,
        buzzerArmedTeam: 0,
        turnTimerRunning: false,
        turnTimerRemaining: dur
      });
      Feud.showToast(`🏆 ${winName} Wins the Face-Off! Choose PLAY or PASS.`);
      return;
    }

    // 3. STEAL MODE (Opposing team hits an unrevealed answer on the board -> STEAL SUCCEEDS!)
    if (phase === "steal") {
      const stealTeam =
        roomState.controllingTeam || (roomState.originalPlayingTeam === 1 ? 2 : 1);
      const stealName = getTeamNameByNum(stealTeam);
      const nextFanfare = (roomState.fanfareSeq || 0) + 1;
      const nextT1 =
        stealTeam === 1 ? (roomState.team1Score || 0) + newPot : roomState.team1Score || 0;
      const nextT2 =
        stealTeam === 2 ? (roomState.team2Score || 0) + newPot : roomState.team2Score || 0;
      const matchWon = isFinalRegularRound && nextT1 !== nextT2;
      const matchTied = isFinalRegularRound && nextT1 === nextT2;
      setTimeout(() => Feud.playFanfare(), 400);

      await pushRoomPatch({
        stage: roomState.stage || "main",
        questionRevealed: true,
        revealed: Array.from(revSet),
        pot: 0,
        team1Score: nextT1,
        team2Score: nextT2,
        roundPhase: "round-over",
        roundWinnerTeam: stealTeam,
        controllingTeam: stealTeam,
        buzzerWinner: 0,
        buzzerArmedTeam: 0,
        turnTimerRemaining: dur,
        turnTimerRunning: false,
        fanfareSeq: nextFanfare
      });
      if (matchWon) {
        Feud.showToast(
          `🚨 STEAL SUCCESSFUL! 🏆 ${getTeamNameByNum(
            nextT1 > nextT2 ? 1 : 2
          )} Wins the Match! Reveal any remaining answers, then click "🏆 Show Winner Screen"!`
        );
      } else if (matchTied) {
        Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
        Feud.showToast(
          `⚡ TIE SCORE (${nextT1} – ${nextT2})! Sudden-Death Tie-Breaker Round Unlocked!`
        );
      } else {
        Feud.showToast(`🚨 STEAL SUCCESSFUL! 🏆 ${stealName} Steals ${newPot} pts!`);
      }
      return;
    }

    // 4. PLAYING THE BOARD (or implicit Play from pass-or-play)
    const playTeam =
      roomState.controllingTeam ||
      roomState.originalPlayingTeam ||
      roomState.faceoffWinnerTeam ||
      1;
    const playName = getTeamNameByNum(playTeam);

    if (allBoardRevealed) {
      // Board swept! Auto-award pot to playing team!
      const nextFanfare = (roomState.fanfareSeq || 0) + 1;
      const nextT1 =
        playTeam === 1 ? (roomState.team1Score || 0) + newPot : roomState.team1Score || 0;
      const nextT2 =
        playTeam === 2 ? (roomState.team2Score || 0) + newPot : roomState.team2Score || 0;
      const matchWon = isFinalRegularRound && nextT1 !== nextT2;
      const matchTied = isFinalRegularRound && nextT1 === nextT2;
      setTimeout(() => Feud.playFanfare(), 400);
      await pushRoomPatch({
        stage: roomState.stage || "main",
        questionRevealed: true,
        revealed: Array.from(revSet),
        pot: 0,
        team1Score: nextT1,
        team2Score: nextT2,
        roundPhase: "round-over",
        roundWinnerTeam: playTeam,
        controllingTeam: playTeam,
        originalPlayingTeam: playTeam,
        buzzerWinner: 0,
        buzzerArmedTeam: 0,
        turnTimerRemaining: dur,
        turnTimerRunning: false,
        fanfareSeq: nextFanfare
      });
      if (matchWon) {
        Feud.showToast(
          `🧹 Board Swept! 🏆 ${getTeamNameByNum(
            nextT1 > nextT2 ? 1 : 2
          )} Wins the Match! Click "🏆 Show Winner Screen" when ready!`
        );
      } else if (matchTied) {
        Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
        Feud.showToast(
          `⚡ TIE SCORE (${nextT1} – ${nextT2})! Sudden-Death Tie-Breaker Round Unlocked!`
        );
      } else {
        Feud.showToast(`🧹 Board Swept! 🏆 ${playName} Wins ${newPot} pts!`);
      }
    } else {
      // Correct answer during regular play -> reset timer to full duration (do NOT auto-start outside Face-Off)
      await pushRoomPatch({
        questionRevealed: true,
        revealed: Array.from(revSet),
        pot: newPot,
        roundPhase: "playing",
        controllingTeam: playTeam,
        originalPlayingTeam: playTeam,
        buzzerWinner: 0,
        buzzerArmedTeam: 0,
        turnTimerRemaining: dur,
        turnTimerRunning: false
      });
      Feud.showToast(`✅ Correct! Press R (or Start Timer) when ready for the next ${playName} player.`);
    }
  }

  // Dedicated Face-Off wrong guess: flashes 1 temporary X + buzzer WITHOUT touching the round's 3-strike counter,
  // then passes the Face-Off turn to the other team (podium buzzers stay locked until the next round).
  async function hostFaceOffWrongGuess() {
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    const canSecondGuessInPassPlay =
      phase === "pass-or-play" &&
      (roomState.revealed || []).length === 1 &&
      (roomState.faceoffBestRank ?? 0) > 0;
    if (!String(phase).startsWith("faceoff") && !canSecondGuessInPassPlay) {
      Feud.showToast("Face-Off is over — use the regular ❌ Strike buttons for round strikes.");
      return;
    }
    await hostHandleWrongAnswer({ fromTimer: false, forceFaceOff: true });
  }

  async function hostBeSpecificBuzz() {
    Feud.unlockAudio();
    Feud.showBeSpecificOverlay();
    const nextSeq = (roomState.beSpecificSeq || 0) + 1;
    const patch = { beSpecificSeq: nextSeq };
    if (roomState.turnTimerRunning) {
      patch.turnTimerRemaining = (Number(roomState.turnTimerRemaining) || 0) + 5;
    }
    await pushRoomPatch(patch);
    Feud.showToast(
      roomState.turnTimerRunning
        ? "🔍 Be More Specific! (+5s added to timer)"
        : "🔍 Be More Specific!"
    );
  }

  async function hostHandleWrongAnswer(opts = {}) {
    Feud.unlockAudio();
    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;
    const autoStartOnX = Boolean(roomState.autoStartTimerOnStrike);
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    const nextSeq = (roomState.strikeSeq || 0) + 1;
    const prefix = opts.fromTimer ? "⏰ Time's Up! " : "";

    if (phase === "round-over") {
      Feud.showToast("Round already complete — tap a tile to reveal it (0 pts) or go to the next round.");
      return;
    }
    if (phase === "faceoff-ready" || phase === "faceoff-buzz") {
      Feud.showToast("Tap which team buzzed first before marking a wrong guess!");
      return;
    }
    if (phase === "pass-or-play") {
      Feud.showToast("Choose Play or Pass first!");
      return;
    }

    pushUndoSnapshot();
    stopLocalTurnTimerInterval();

    // 1. FACE-OFF TURN 1 MISS -> 1 temp X (round strikes untouched), turn passes to the other team (buzzers stay locked; do NOT auto-start timer on X)
    if (phase === "faceoff-ready" || phase === "faceoff-buzz" || phase === "faceoff-p1") {
      const firstTeam =
        roomState.faceoffFirstTeam || roomState.buzzerWinner || roomState.controllingTeam || 1;
      const secondTeam = firstTeam === 1 ? 2 : 1;
      const secondName = getTeamNameByNum(secondTeam);

      Feud.showBigRedXOverlay(1);
      await pushRoomPatch({
        questionRevealed: true,
        roundPhase: "faceoff-p2",
        faceoffFirstTeam: firstTeam,
        faceoffBestRank: 999,
        controllingTeam: secondTeam,
        buzzerWinner: 0,
        buzzerArmedTeam: 0,
        lastOverlayXCount: 1,
        strikeSeq: nextSeq,
        turnTimerRemaining: dur,
        turnTimerRunning: true
      });
      startLocalTurnTimerLoop();
      Feud.showToast(
        `${prefix}❌ Face-Off Miss (temp X — no round strike)! ${secondName}'s turn (${dur}s timer started).`
      );
      return;
    }

    // 2. FACE-OFF TURN 2 MISS (or 2nd Face-Off player miss after Player 1 hit a non-#1 answer) -> 1 temp X!
    if (
      phase === "faceoff-p2" ||
      (phase === "pass-or-play" &&
        opts.forceFaceOff &&
        (roomState.revealed || []).length === 1 &&
        (roomState.faceoffBestRank ?? 0) > 0)
    ) {
      const firstTeam = roomState.faceoffFirstTeam || roomState.faceoffWinnerTeam || 1;
      const firstName = getTeamNameByNum(firstTeam);
      const bestRank = roomState.faceoffBestRank ?? 999;
      const curRoundForTie = Feud.getRoundData(roomState, roomState.roundIdx);
      const isTieBreakerRound = Feud.isTieBreakerRound && Feud.isTieBreakerRound(curRoundForTie);

      Feud.showBigRedXOverlay(1);
      if (isTieBreakerRound) {
        await pushRoomPatch({
          questionRevealed: true,
          roundPhase: "faceoff-p1",
          controllingTeam: firstTeam,
          buzzerWinner: 0,
          buzzerArmedTeam: 0,
          lastOverlayXCount: 1,
          strikeSeq: nextSeq,
          turnTimerRemaining: dur,
          turnTimerRunning: false
        });
        Feud.showToast(
          `${prefix}❌ Tie-Breaker Miss! Back to ${firstName} — find the #1 answer to win!`
        );
        return;
      }
      if (bestRank < 999) {
        await pushRoomPatch({
          questionRevealed: true,
          roundPhase: "pass-or-play",
          faceoffBestRank: 0,
          faceoffWinnerTeam: firstTeam,
          controllingTeam: firstTeam,
          buzzerWinner: firstTeam,
          buzzerArmedTeam: 0,
          lastOverlayXCount: 1,
          strikeSeq: nextSeq,
          turnTimerRunning: false,
          turnTimerRemaining: dur
        });
        Feud.showToast(`${prefix}❌ Miss! 🏆 ${firstName} Wins the Face-Off — Play or Pass?`);
      } else {
        // Both missed! Back to the first team for another Face-Off guess (buzzers stay locked; do NOT auto-start timer on X)
        await pushRoomPatch({
          questionRevealed: true,
          roundPhase: "faceoff-p1",
          controllingTeam: firstTeam,
          buzzerWinner: 0,
          buzzerArmedTeam: 0,
          lastOverlayXCount: 1,
          strikeSeq: nextSeq,
          turnTimerRemaining: dur,
          turnTimerRunning: false
        });
        Feud.showToast(`${prefix}❌ Both missed! Back to ${firstName} for the next Face-Off turn.`);
      }
      return;
    }

    // 3. STEAL MODE MISS -> Show 1 X, automatically award pot to original playing team!
    if (phase === "steal") {
      const origTeam =
        roomState.originalPlayingTeam || (roomState.controllingTeam === 1 ? 2 : 1);
      const origName = getTeamNameByNum(origTeam);
      const pot = roomState.pot || 0;
      const nextFanfare = (roomState.fanfareSeq || 0) + 1;
      const curRound = Feud.getRoundData(roomState, roomState.roundIdx);
      const isTieBreaker = Feud.isTieBreakerRound && Feud.isTieBreakerRound(curRound);
      const regCount = Feud.getRegularRoundCount
        ? Feud.getRegularRoundCount(roomState)
        : Feud.getRoundCount(roomState);
      const isFinalRegularRound = !isTieBreaker && roomState.roundIdx === regCount - 1;
      const nextT1 =
        origTeam === 1 ? (roomState.team1Score || 0) + pot : roomState.team1Score || 0;
      const nextT2 =
        origTeam === 2 ? (roomState.team2Score || 0) + pot : roomState.team2Score || 0;
      const matchWon = (isFinalRegularRound || isTieBreaker) && nextT1 !== nextT2;
      const matchTied = isFinalRegularRound && nextT1 === nextT2;

      Feud.showBigRedXOverlay(1);
      setTimeout(() => Feud.playFanfare(), 750);

      await pushRoomPatch({
        stage: roomState.stage || "main",
        pot: 0,
        team1Score: nextT1,
        team2Score: nextT2,
        roundPhase: "round-over",
        roundWinnerTeam: origTeam,
        controllingTeam: origTeam,
        buzzerWinner: 0,
        lastOverlayXCount: 1,
        strikeSeq: nextSeq,
        fanfareSeq: nextFanfare,
        turnTimerRunning: false,
        turnTimerRemaining: dur
      });
      if (matchWon) {
        Feud.showToast(
          `${prefix}❌ Steal Missed! 🏆 ${getTeamNameByNum(
            nextT1 > nextT2 ? 1 : 2
          )} Wins the Match! Reveal any remaining answers, then click "🏆 Show Winner Screen"!`
        );
      } else if (matchTied) {
        Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
        Feud.showToast(
          `⚡ TIE SCORE (${nextT1} – ${nextT2})! Sudden-Death Tie-Breaker Round Unlocked!`
        );
      } else {
        Feud.showToast(`${prefix}❌ Steal Missed! 🏆 ${origName} keeps the ${pot} pts!`);
      }
      return;
    }

    if (phase === "pass-or-play" && !opts.forceFaceOff) {
      Feud.showToast("Choose PLAY or PASS first before giving a strike!");
      return;
    }

    // 4. PLAYING THE BOARD -> Increment Strikes (1 -> 2 -> 3)!
    const playTeam =
      roomState.controllingTeam ||
      roomState.originalPlayingTeam ||
      roomState.faceoffWinnerTeam ||
      1;
    const oppTeam = playTeam === 1 ? 2 : 1;
    const oppName = getTeamNameByNum(oppTeam);
    const nextStrikes = Math.min(3, (roomState.strikes || 0) + 1);

    Feud.showBigRedXOverlay(nextStrikes);

    if (nextStrikes >= 3) {
      // 3rd Strike (XXX)! Automatically switch teams to Steal Mode and pre-load 30s timer!
      await pushRoomPatch({
        roundPhase: "steal",
        strikes: 3,
        originalPlayingTeam: playTeam,
        controllingTeam: oppTeam,
        buzzerWinner: 0,
        lastOverlayXCount: 3,
        strikeSeq: nextSeq,
        turnTimerRunning: false,
        turnTimerRemaining: 30
      });
      Feud.showToast(
        `${prefix}🚨 3 Strikes (XXX)! Automatic switch to ${oppName} for the Steal! Press R to start 30s Steal Timer.`
      );
    } else {
      // Strike 1 or 2 -> reset clock for the next player; do NOT auto-start timer outside of Face-Off mode
      await pushRoomPatch({
        roundPhase: "playing",
        controllingTeam: playTeam,
        originalPlayingTeam: playTeam,
        strikes: nextStrikes,
        lastOverlayXCount: nextStrikes,
        strikeSeq: nextSeq,
        turnTimerRemaining: dur,
        turnTimerRunning: false
      });
      Feud.showToast(
        `${prefix}❌ Strike ${nextStrikes} of 3! Press R (or Start Timer) when ready for the next player.`
      );
    }
  }

  async function hostRevealNextAnswer() {
    Feud.unlockAudio();
    const phase = roomState.roundPhase || "faceoff-ready";
    if (
      phase !== "round-over" &&
      (roomState.pot || 0) > 0 &&
      !window.confirm(
        "The round pot hasn't been awarded yet. Reveal the next unflipped answer on the TV for 0 points anyway?"
      )
    ) {
      return;
    }
    stopLocalTurnTimerInterval();
    const round = Feud.getRoundData(roomState, roomState.roundIdx);
    const cleanExisting = Array.isArray(roomState.revealed)
      ? roomState.revealed
          .map((n) => Number(n))
          .filter((n) => Number.isInteger(n) && n >= 0 && n < round.answers.length)
      : [];
    const revSet = new Set(cleanExisting);
    let nextIdx = -1;
    for (let i = 0; i < round.answers.length; i++) {
      if (!revSet.has(i)) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx === -1) {
      Feud.showToast("✅ All answers on the board are already revealed!");
      return;
    }
    pushUndoSnapshot();
    revSet.add(nextIdx);
    Feud.playDing();
    await pushRoomPatch({
      questionRevealed: true,
      revealed: Array.from(revSet),
      turnTimerRunning: false
    });
    const remaining = round.answers.length - revSet.size;
    Feud.showToast(
      remaining > 0
        ? `👁️ Revealed #${nextIdx + 1}: "${round.answers[nextIdx].text}" (${remaining} remaining)`
        : "✅ All answers on the board revealed!"
    );
  }

  async function hostRevealAll() {
    await hostRevealNextAnswer();
  }

  async function hostResetRound() {
    pushUndoSnapshot();
    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      stage: "main",
      roundPhase: "faceoff-ready",
      questionRevealed: false,
      controllingTeam: 0,
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      faceoffWinnerTeam: 0,
      originalPlayingTeam: 0,
      roundWinnerTeam: 0,
      lastOverlayXCount: 1,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0
    });
  }

  async function hostSelectRound(idx) {
    pushUndoSnapshot();
    stopLocalTurnTimerInterval();
    const total = Feud.getRoundCount(roomState);
    const cleanIdx = Math.max(0, Math.min(total - 1, Number(idx) || 0));
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      stage: "main",
      roundIdx: cleanIdx,
      roundPhase: "faceoff-ready",
      questionRevealed: false,
      controllingTeam: 0,
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      faceoffWinnerTeam: 0,
      originalPlayingTeam: 0,
      roundWinnerTeam: 0,
      lastOverlayXCount: 1,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0
    });
  }

  async function hostPrevRound() {
    const unlockedTotal = Feud.isTieBreakerUnlocked(roomState)
      ? Feud.getRoundCount(roomState)
      : Feud.getRegularRoundCount(roomState);
    const prev = (roomState.roundIdx - 1 + unlockedTotal) % Math.max(1, unlockedTotal);
    await hostSelectRound(prev);
  }

  async function hostNextRound() {
    const regCount = Feud.getRegularRoundCount(roomState);
    const total = Feud.getRoundCount(roomState);
    const next = roomState.roundIdx + 1;

    if (next < regCount) {
      await hostSelectRound(next);
      return;
    }

    // If next round is the Sudden-Death Tie-Breaker round:
    if (next < total && Feud.isTieBreakerUnlocked(roomState)) {
      await hostSelectRound(next);
      Feud.showToast("⚡ Sudden-Death Tie-Breaker Round Started! First team to answer wins!");
      return;
    }

    // Regular rounds finished and scores are not tied -> crown winner & open Next Match Setup!
    if ((roomState.team1Score || 0) !== (roomState.team2Score || 0)) {
      await openNextMatchModal();
      return;
    }

    await hostSelectRound(0);
  }

  async function hostRandomizeCurrentRound() {
    Feud.unlockAudio();
    stopLocalTurnTimerInterval();
    const res = Feud.pickRandomUnplayedRoundForLevel(roomState, roomState.roundIdx);
    if (!res) {
      Feud.showToast("No other questions at this multiplier level were found in the current deck.");
      return;
    }
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      stage: "main",
      matchRounds: res.matchRounds,
      matchSourceIndices: res.matchSourceIndices,
      usedRoundIndices: res.usedRoundIndices,
      roundPhase: "faceoff-ready",
      questionRevealed: false,
      controllingTeam: 0,
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      faceoffWinnerTeam: 0,
      originalPlayingTeam: 0,
      roundWinnerTeam: 0,
      lastOverlayXCount: 1,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0,
      buzzerArmedTeam: 0
    });
    Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
    Feud.showToast(
      `🎲 Randomized Round ${roomState.roundIdx + 1} (${res.targetMult}x) → Deck #${
        res.chosenSourceIdx + 1
      }!`
    );
  }

  async function hostPickDeckRoundForSlot(sourceIdx, targetSlotIdx) {
    Feud.unlockAudio();
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    if (roomState.questionRevealed && phase !== "faceoff-ready") {
      Feud.showToast("Round can only be swapped while the question is still hidden on TV!");
      Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
      return;
    }
    const slot =
      targetSlotIdx !== undefined && !Number.isNaN(Number(targetSlotIdx))
        ? Number(targetSlotIdx)
        : roomState.roundIdx || 0;
    const res = Feud.selectDeckRoundForSlot(roomState, slot, sourceIdx);
    if (!res) {
      Feud.showToast("Could not load that deck round.");
      return;
    }
    pushUndoSnapshot();
    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      stage: "main",
      roundIdx: res.slotIdx,
      matchRounds: res.matchRounds,
      matchSourceIndices: res.matchSourceIndices,
      usedRoundIndices: res.usedRoundIndices,
      roundPhase: "faceoff-ready",
      questionRevealed: false,
      controllingTeam: 0,
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      faceoffWinnerTeam: 0,
      originalPlayingTeam: 0,
      roundWinnerTeam: 0,
      lastOverlayXCount: 1,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      revealed: [],
      pot: 0,
      strikes: 0,
      buzzerWinner: 0,
      buzzerArmedTeam: 0
    });
    Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
    Feud.showToast(
      `📋 Loaded Deck #${res.chosenSourceIdx + 1} into Round ${res.slotIdx + 1} (${res.targetMult}x)!`
    );
  }

  async function hostOnRoundSelectChange(val) {
    const str = String(val || "");
    if (str.startsWith("deck:")) {
      const sourceIdx = Number(str.slice(5));
      await hostPickDeckRoundForSlot(sourceIdx, roomState.roundIdx || 0);
      return;
    }
    await hostSelectRound(Number(str));
  }

  async function hostManualBuzz(team) {
    Feud.unlockAudio();
    const dur = Number(roomState.turnTimerDuration) || 10;
    const teamName = getTeamNameByNum(team);

    // Same rules as the remote podium buzzers (sync.js#buildBuzzPatch); the Host may also
    // record a buzz before the question is shown on TV.
    const evalState =
      (roomState.roundPhase || "faceoff-ready") === "faceoff-ready"
        ? { ...roomState, roundPhase: "faceoff-buzz", questionRevealed: true }
        : roomState;
    const patch = Feud.buildBuzzPatch(evalState, team);
    if (!patch) {
      if (roomState.buzzerWinner) {
        Feud.showToast(`🔒 ${getTeamNameByNum(roomState.buzzerWinner)} already buzzed in.`);
      } else {
        Feud.showToast("🔒 Buzzers are locked — the Face-Off is already decided this round.");
      }
      return;
    }

    Feud.playFaceOffTone(team);
    await pushRoomPatch(patch);
    startLocalTurnTimerLoop();
    Feud.showToast(`🔔 ${teamName} Buzzed In! ${dur}s Face-Off Timer Started.`);
  }

  async function hostResetBuzzers() {
    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      buzzerWinner: 0,
      controllingTeam: 0,
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      roundPhase: roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready",
      turnTimerRunning: false,
      turnTimerRemaining: dur
    });
    Feud.showToast("🔓 Podium buzzers reset for Face-Off!");
  }

  async function hostTriggerStrike(count) {
    const curPhase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    // During a Face-Off, a strike is only ever a single temporary X (round strikes stay at 0)
    if (!count || String(curPhase).startsWith("faceoff")) {
      await hostHandleWrongAnswer({ fromTimer: false });
      return;
    }
    if (curPhase === "round-over") {
      Feud.showToast("Round already complete — strikes are disabled.");
      return;
    }
    Feud.unlockAudio();
    stopLocalTurnTimerInterval();
    const num = Math.min(3, Math.max(1, Number(count) || 1));
    const nextSeq = (roomState.strikeSeq || 0) + 1;
    Feud.showBigRedXOverlay(num);

    const playTeam =
      roomState.controllingTeam ||
      roomState.originalPlayingTeam ||
      roomState.faceoffWinnerTeam ||
      1;
    const oppTeam = playTeam === 1 ? 2 : 1;
    const oppName = getTeamNameByNum(oppTeam);
    const nextDur = num >= 3 ? 30 : Number(roomState.turnTimerDuration) || 10;

    if (num >= 3) {
      await pushRoomPatch({
        roundPhase: "steal",
        strikes: 3,
        originalPlayingTeam: playTeam,
        controllingTeam: oppTeam,
        buzzerWinner: 0,
        lastOverlayXCount: 3,
        strikeSeq: nextSeq,
        turnTimerRunning: false,
        turnTimerRemaining: 30
      });
      Feud.showToast(
        `🚨 3 Strikes! Automatic switch to ${oppName} for the Steal! Press R to start 30s Steal Timer.`
      );
    } else {
      await pushRoomPatch({
        roundPhase: "playing",
        controllingTeam: playTeam,
        originalPlayingTeam: playTeam,
        strikes: num,
        lastOverlayXCount: num,
        strikeSeq: nextSeq,
        turnTimerRunning: false,
        turnTimerRemaining: nextDur
      });
    }
  }

  async function hostClearStrikes() {
    const wasSteal = roomState.roundPhase === "steal";
    await pushRoomPatch({
      strikes: 0,
      roundPhase: wasSteal ? "playing" : roomState.roundPhase,
      controllingTeam:
        wasSteal && roomState.originalPlayingTeam
          ? roomState.originalPlayingTeam
          : roomState.controllingTeam
    });
  }

  async function hostCyclePresets() {
    const presets = Feud.getActiveTeamPresets(roomState);
    presetIdx = (presetIdx + 1) % presets.length;
    const [t1, t2] = presets[presetIdx];
    await pushRoomPatch({ team1Name: t1, team2Name: t2 });
    Feud.showToast(`Teams updated: ${t1} vs. ${t2}`);
  }

  async function hostRenameTeam(team, val) {
    pushUndoSnapshot();
    const clean = val.trim() || `Team ${team}`;
    await pushRoomPatch(team === 1 ? { team1Name: clean } : { team2Name: clean });
    Feud.showToast(`✏️ Renamed Team ${team} to "${clean}"`);
  }

  async function hostAdjustScore(team, delta) {
    pushUndoSnapshot();
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
    pushUndoSnapshot();
    const dur = Number(roomState.turnTimerDuration) || 10;
    const curRound = Feud.getRoundData(roomState, roomState.roundIdx);
    const isTieBreaker = Feud.isTieBreakerRound && Feud.isTieBreakerRound(curRound);
    const regCount = Feud.getRegularRoundCount
      ? Feud.getRegularRoundCount(roomState)
      : Feud.getRoundCount(roomState);
    const isFinalRegularRound = !isTieBreaker && roomState.roundIdx === regCount - 1;
    const nextT1 = team === 1 ? (roomState.team1Score || 0) + pot : roomState.team1Score || 0;
    const nextT2 = team === 2 ? (roomState.team2Score || 0) + pot : roomState.team2Score || 0;
    const matchWon = (isFinalRegularRound || isTieBreaker) && nextT1 !== nextT2;
    const matchTied = isFinalRegularRound && nextT1 === nextT2;

    Feud.playFanfare();
    const nextFanfare = (roomState.fanfareSeq || 0) + 1;
    await pushRoomPatch({
      stage: roomState.stage || "main",
      team1Score: nextT1,
      team2Score: nextT2,
      pot: 0,
      roundPhase: "round-over",
      roundWinnerTeam: team === 1 ? 1 : 2,
      controllingTeam: team === 1 ? 1 : 2,
      buzzerWinner: 0,
      buzzerArmedTeam: 0,
      turnTimerRemaining: dur,
      turnTimerRunning: false,
      fanfareSeq: nextFanfare
    });
    if (matchWon) {
      Feud.showToast(
        `🏆 ${getTeamNameByNum(
          nextT1 > nextT2 ? 1 : 2
        )} Wins the Match! Reveal any remaining answers, then click "🏆 Show Winner Screen"!`
      );
    } else if (matchTied) {
      Feud.populateRoundDropdowns(roomState);
    syncSetupModalInputsFromState();
      Feud.showToast(
        `⚡ TIE SCORE (${nextT1} – ${nextT2})! Sudden-Death Tie-Breaker Round Unlocked!`
      );
    } else {
      Feud.showToast(
        `🏆 Awarded ${pot} pts to ${team === 1 ? roomState.team1Name : roomState.team2Name}!`
      );
    }
  }

  async function hostShowWinnerScreen() {
    Feud.unlockAudio();
    pushUndoSnapshot();
    stopLocalTurnTimerInterval();
    await pushRoomPatch({
      stage: "winner",
      turnTimerRunning: false
    });
    populateAndShowNextMatchModal();
  }

  // =====================================================================
  // 8. FAST MONEY CONTROLS & 1-TAP SCORING CHIPS
  // =====================================================================
  async function hostSwitchStage(stage) {
    pushUndoSnapshot();
    if (stage === "fast" && !roomState.enableFastMoney) {
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
          Feud.playTimeUpBell();
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
    syncSetupModalInputsFromState();
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
    syncSetupModalInputsFromState();
    Feud.showToast("Restored default question & answers for this round.");
  }

  function openDeckManagerModal() {
    openNewGameModal("host");
  }

  function closeDeckManagerModal() {
    closeNewGameModal();
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
    syncSetupModalInputsFromState();
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

    const nextTitle = customDeck.name || parsed.gameTitle || "Party Feud";
    const nextIcon = parsed.gameIcon || "🎉";
    Feud.saveCustomDeck(customDeck);
    Feud.saveCustomRounds({});
    Feud.saveGameTitle(nextTitle);
    Feud.saveGameIcon(nextIcon);

    const presets = Feud.getActiveTeamPresets({ customDeck });
    const [t1, t2] = presets[0] || [roomState.team1Name, roomState.team2Name];

    const slice = Feud.buildMatchSlice(
      { ...roomState, customDeck, usedRoundIndices: [] },
      {
        roundsPerMatch: roomState.roundsPerMatch ?? 4,
        roundOrder: roomState.roundOrder || "shuffle-by-level",
        enableFastMoney: Boolean(roomState.enableFastMoney)
      }
    );
    const fmList =
      slice.matchFastMoney && slice.matchFastMoney.length > 0
        ? slice.matchFastMoney
        : (customDeck.fastMoney || Feud.getFastMoneyList({ customDeck })).slice(0, 5);
    stopLocalTurnTimerInterval();
    const dur = Number(roomState.turnTimerDuration) || 10;
    await pushRoomPatch({
      gameTitle: nextTitle,
      gameIcon: nextIcon,
      team1Name: t1,
      team2Name: t2,
      customDeck,
      customRounds: {},
      matchRounds: slice.matchRounds,
      matchSourceIndices: slice.matchSourceIndices,
      usedRoundIndices: slice.usedRoundIndices || [],
      matchFastMoney: fmList,
      roundIdx: 0,
      roundPhase: "faceoff-ready",
      questionRevealed: false,
      controllingTeam: 0,
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      faceoffWinnerTeam: 0,
      originalPlayingTeam: 0,
      roundWinnerTeam: 0,
      lastOverlayXCount: 1,
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
    const defTitle =
      (Feud.DEFAULT_DECK && (Feud.DEFAULT_DECK.deckName || Feud.DEFAULT_DECK.gameTitle)) ||
      "Starter Party Deck";
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
      roundPhase: "faceoff-ready",
      questionRevealed: false,
      controllingTeam: 0,
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      faceoffWinnerTeam: 0,
      originalPlayingTeam: 0,
      roundWinnerTeam: 0,
      lastOverlayXCount: 1,
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
  function syncMuteButtonLabels(muted) {
    const topBtn = document.getElementById("btnMute");
    const menuBtn = document.getElementById("hostMenuMuteBtn");
    const tvBtn = document.getElementById("tvMuteBtn");
    if (topBtn) topBtn.textContent = muted ? "🔇 Muted" : "🔊 Sound";
    if (menuBtn) menuBtn.textContent = muted ? "🔇 Muted" : "🔊 Sound";
    if (tvBtn) tvBtn.textContent = muted ? "🔇" : "🔊";
  }

  function toggleMute() {
    const muted = Feud.toggleAudioMute();
    syncMuteButtonLabels(muted);
    if (activeRole === "host" && roomState && currentRoomCode) {
      pushRoomPatch({ soundMuted: muted });
    }
    Feud.showToast(muted ? "Sound Muted" : "Sound Enabled");
  }

  function syncFullscreenBodyClass() {
    const isFs = Boolean(
      document.fullscreenElement ||
        document.webkitFullscreenElement ||
        (window.innerHeight >= window.screen.height - 2 &&
          window.innerWidth >= window.screen.width - 2)
    );
    document.body.classList.toggle("is-fullscreen", isFs);
  }

  document.addEventListener("fullscreenchange", syncFullscreenBodyClass);
  document.addEventListener("webkitfullscreenchange", syncFullscreenBodyClass);
  window.addEventListener("resize", syncFullscreenBodyClass);

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
      hostHandleWrongAnswer({ fromTimer: false });
    } else if (e.key === "c" || e.key === "C") {
      hostClearStrikes();
    } else if (e.key === "Escape") {
      closeHostPopover();
    } else if (e.key === "ArrowRight") {
      hostNextRound();
    } else if (e.key === "ArrowLeft") {
      hostPrevRound();
    }
  });

  function applyHostScriptCollapsed(collapsed) {
    const wrap = document.getElementById("hostScriptCollapseWrap");
    const btn = document.getElementById("hostScriptToggleBtn");
    if (wrap) wrap.classList.toggle("hidden", collapsed);
    if (btn) btn.textContent = collapsed ? "🎙️ Script" : "🎙️ Hide";
  }

  function toggleHostScript(forceCollapsed) {
    const wrap = document.getElementById("hostScriptCollapseWrap");
    const currentlyCollapsed = wrap ? wrap.classList.contains("hidden") : false;
    const next = typeof forceCollapsed === "boolean" ? forceCollapsed : !currentlyCollapsed;
    try {
      localStorage.setItem("feud_host_script_collapsed", next ? "1" : "0");
    } catch (e) {}
    applyHostScriptCollapsed(next);
  }

  function setHostMobileTab(tab) {
    const cleanTab = tab === "tv" || tab === "overrides" ? tab : "board";
    const hostView = document.getElementById("hostView");
    if (hostView) hostView.dataset.mobileTab = cleanTab;
    document.querySelectorAll(".host-mobile-tab").forEach((btn) => {
      const isActive = btn.dataset.tab === cleanTab;
      btn.classList.toggle("active", isActive);
      btn.classList.toggle("gold", isActive);
    });
    if (cleanTab === "overrides") {
      const drawer = document.querySelector(".host-overrides-drawer");
      if (drawer) drawer.open = true;
    }
  }

  function closeHostMoreMenu() {
    const menu = document.getElementById("hostMoreMenu");
    if (menu) menu.open = false;
  }

  let activePopoverKind = "";

  async function hostSetExactScore(team, val) {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    pushUndoSnapshot();
    await pushRoomPatch(team === 1 ? { team1Score: parsed } : { team2Score: parsed });
    if (activePopoverKind === "team1" || activePopoverKind === "team2") {
      renderHostPopoverBody(activePopoverKind);
    }
  }

  function escapePopoverHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderHostPopoverBody(kind) {
    const titleEl = document.getElementById("hostPopoverTitle");
    const bodyEl = document.getElementById("hostPopoverBody");
    if (!titleEl || !bodyEl) return;

    const t1 = roomState.team1Name || "Team 1";
    const t2 = roomState.team2Name || "Team 2";
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");

    if (kind === "team1" || kind === "team2") {
      const teamNum = kind === "team1" ? 1 : 2;
      const name = teamNum === 1 ? t1 : t2;
      const score = teamNum === 1 ? roomState.team1Score || 0 : roomState.team2Score || 0;
      const pot = roomState.pot || 0;
      const isCtrl = roomState.controllingTeam === teamNum;
      titleEl.textContent = `👥 ${name}`;
      bodyEl.innerHTML = `
        <div class="host-popover-section">
          <label class="field-label" for="popoverTeamNameInput">Team Name</label>
          <input id="popoverTeamNameInput" class="host-team-input" type="text" value="${escapePopoverHtml(
            name
          )}" onchange="hostRenameTeam(${teamNum}, this.value)" onkeydown="if(event.key==='Enter'){this.blur();}" />
        </div>
        <div class="host-popover-section">
          <label class="field-label" for="popoverTeamScoreInput">Score Override</label>
          <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
            <button type="button" class="top-btn" onclick="hostAdjustScore(${teamNum}, -10).then(()=>renderHostPopoverBody('${kind}'))">-10</button>
            <button type="button" class="top-btn" onclick="hostAdjustScore(${teamNum}, -1).then(()=>renderHostPopoverBody('${kind}'))">-1</button>
            <input id="popoverTeamScoreInput" class="host-team-input" style="width:90px; text-align:center;" type="number" min="0" value="${score}" onchange="hostSetExactScore(${teamNum}, this.value)" onkeydown="if(event.key==='Enter'){this.blur();}" />
            <button type="button" class="top-btn" onclick="hostAdjustScore(${teamNum}, 1).then(()=>renderHostPopoverBody('${kind}'))">+1</button>
            <button type="button" class="top-btn" onclick="hostAdjustScore(${teamNum}, 10).then(()=>renderHostPopoverBody('${kind}'))">+10</button>
          </div>
        </div>
        <div class="host-popover-section">
          <span class="field-label">Turn &amp; Pot Controls</span>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <button type="button" class="action-btn ${
              isCtrl ? "btn-gold" : "btn-blue"
            } display-font" onclick="hostSetControllingTeam(${teamNum}); closeHostPopover();">
              ${isCtrl ? "✅ Currently Active Team" : `🎯 Make ${escapePopoverHtml(name)} Active Team`}
            </button>
            <button type="button" class="action-btn btn-gold display-font" ${
              pot <= 0 ? "disabled" : ""
            } onclick="hostAwardPot(${teamNum}); closeHostPopover();">
              🏆 Award Round Pot (${pot} pts)
            </button>
          </div>
        </div>
      `;
      return;
    }

    if (kind === "round") {
      const isHidden = !roomState.questionRevealed || phase === "faceoff-ready";
      const curRound = Feud.getRoundData(roomState, roomState.roundIdx);
      const src = Feud.getSourceRoundsList ? Feud.getSourceRoundsList(roomState) : [];
      const used = Feud.getAllPlayedSourceIndices
        ? Feud.getAllPlayedSourceIndices(roomState)
        : new Set();
      const curMult = Number(curRound.multiplier) || 1;
      const isCurTie = Feud.isTieBreakerRound ? Feud.isTieBreakerRound(curRound) : false;
      const treeGroups = [
        { key: "1", label: "1x Single Points", match: (r, tie) => !tie && (Number(r.multiplier) || 1) === 1, open: !isCurTie && curMult === 1 },
        { key: "2", label: "2x Double Points", match: (r, tie) => !tie && (Number(r.multiplier) || 1) === 2, open: !isCurTie && curMult === 2 },
        { key: "3", label: "3x Triple Points", match: (r, tie) => !tie && (Number(r.multiplier) || 1) >= 3, open: !isCurTie && curMult >= 3 }
      ];
      const treeHtml = treeGroups
        .map((grp) => {
          const items = [];
          src.forEach((sr, sIdx) => {
            const tie = Feud.isTieBreakerRound ? Feud.isTieBreakerRound(sr) : false;
            if (grp.match(sr, tie)) items.push({ sr, sIdx });
          });
          if (items.length === 0) return "";
          const unusedCount = items.filter(({ sIdx }) => !used.has(sIdx)).length;
          return `
            <details class="round-tree-group"${grp.open ? " open" : ""}>
              <summary class="round-tree-summary">
                <span>${grp.label}</span>
                <span class="round-tree-count">${unusedCount} unused / ${items.length}</span>
              </summary>
              <div class="round-tree-list">
                ${items
                  .map(({ sr, sIdx }) => {
                    const isUsed = used.has(sIdx);
                    const isCurrent = curRound && curRound.sourceIdx === sIdx;
                    return `
                      <button type="button" class="round-tree-item${isUsed ? " is-used" : ""}${
                        isCurrent ? " is-current" : ""
                      }" onclick="hostPickDeckRoundForSlot(${sIdx}, ${
                        roomState.roundIdx
                      }); closeHostPopover();">
                        <span class="round-tree-q">#${sIdx + 1}: ${escapePopoverHtml(sr.prompt || "")}</span>
                        <span class="round-tree-badge">${isCurrent ? "Current" : isUsed ? "✓ Used" : "Unused"}</span>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </details>
          `;
        })
        .join("");

      titleEl.textContent = `🎯 ${curRound.title || `Round ${roomState.roundIdx + 1}`}`;
      bodyEl.innerHTML = `
        <div class="host-popover-section">
          <button type="button" class="action-btn btn-gold display-font" onclick="hostRandomizeCurrentRound(); closeHostPopover();">🎲 Randomize (Same Level)</button>
        </div>
        <div class="host-popover-section">
          <span class="field-label">📚 Choose a Round from Deck</span>
          ${
            isHidden
              ? `<div class="round-tree-wrap">${treeHtml}</div>`
              : `<p style="font-size:12px; color:#fde68a; margin:0;">Question is already revealed on TV. Reset Round or advance to the next round to swap from the deck.</p>`
          }
        </div>
      `;
      return;
    }

    if (kind === "phase") {
      const ctrl = roomState.controllingTeam || 0;
      titleEl.textContent = "⚡ Phase, Control & Strikes";
      bodyEl.innerHTML = `
        <div class="host-popover-section">
          <span class="field-label">Board Control / Phase Override</span>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
            <button type="button" class="top-btn ${ctrl === 0 ? "gold" : ""}" onclick="hostSetControllingTeam(0); closeHostPopover();">⚡ Face-Off</button>
            <button type="button" class="top-btn ${ctrl === 1 ? "gold" : ""}" onclick="hostSetControllingTeam(1); closeHostPopover();">🎯 ${escapePopoverHtml(t1)}</button>
            <button type="button" class="top-btn ${ctrl === 2 ? "gold" : ""}" onclick="hostSetControllingTeam(2); closeHostPopover();">🎯 ${escapePopoverHtml(t2)}</button>
          </div>
        </div>
        <div class="host-popover-section">
          <span class="field-label">Manual Strike Overrides</span>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:6px;">
            <button type="button" class="action-btn btn-red display-font" style="min-height:38px;" onclick="hostTriggerStrike(1); closeHostPopover();">X</button>
            <button type="button" class="action-btn btn-red display-font" style="min-height:38px;" onclick="hostTriggerStrike(2); closeHostPopover();">XX</button>
            <button type="button" class="action-btn btn-red display-font" style="min-height:38px;" onclick="hostTriggerStrike(3); closeHostPopover();">XXX</button>
            <button type="button" class="top-btn" onclick="hostClearStrikes(); closeHostPopover();">Clear</button>
          </div>
        </div>
        ${
          !(Array.isArray(roomState.revealed) && roomState.revealed.length > 0)
            ? `<div class="host-popover-section">
                <button type="button" class="top-btn" onclick="hostToggleQuestionVisibility(); closeHostPopover();">
                  ${roomState.questionRevealed ? "🙈 Hide Question on TV" : "👁️ Show Question Only on TV"}
                </button>
              </div>`
            : ""
        }
      `;
      return;
    }

    if (kind === "timer") {
      const dur = Number(roomState.turnTimerDuration) || 10;
      titleEl.textContent = "⏱️ Timer Settings";
      bodyEl.innerHTML = `
        <div class="host-popover-section">
          <span class="field-label">Shot-Clock Duration</span>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${[5, 7, 10, 15, 30]
              .map(
                (s) =>
                  `<button type="button" class="top-btn ${dur === s ? "gold" : ""}" onclick="hostSetTurnTimerDuration(${s}); closeHostPopover();">${s}s${
                    s === 30 ? " (Steal)" : ""
                  }</button>`
              )
              .join("")}
          </div>
        </div>
        <div class="host-popover-section">
          <button type="button" class="top-btn" onclick="hostStopResetTurnTimer(); closeHostPopover();">⏹️ Stop &amp; Reset Timer</button>
        </div>
      `;
    }
  }

  function openHostPopover(kind) {
    activePopoverKind = kind;
    renderHostPopoverBody(kind);
    document.getElementById("hostContextPopover")?.classList.remove("hidden");
  }

  function closeHostPopover() {
    activePopoverKind = "";
    document.getElementById("hostContextPopover")?.classList.add("hidden");
  }

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
    returnToBoardFromWinnerModal,
    setNextMatchContenderMode,
    cycleNextMatchChallengerPreset,
    confirmStartNextMatch,
    openQrModal,
    selectQrForTv,
    chooseTvSetupOption,
    closeRemoteTvQrModal,
    applyRemoteTvLanHost,
    applyQrLanHost,
    reopenTvWindow,
    closeQrModal,
    createHostRoom,
    joinHostRoom,
    joinTvDisplay,
    joinTeamBuzzer,
    joinComboBuzzer,
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
    pressComboBuzzer,
    hostRevealQuestionAndStartTimer,
    hostToggleQuestionVisibility,
    hostRestartTurnTimer,
    hostStartStealTimer,
    hostChoosePlayOrPass,
    hostHandleWrongAnswer,
    hostBeSpecificBuzz,
    hostFaceOffWrongGuess,
    buzzerExitHoldStart,
    buzzerExitHoldCancel,
    hostToggleTurnTimer,
    hostStopResetTurnTimer,
    hostSetTurnTimerDuration,
    hostToggleAutoStartTimerOnStrike,
    hostSetFaceOffWinner,
    hostSetControllingTeam,
    hostToggleAnswer,
    hostRevealNextAnswer,
    hostRevealAll,
    hostResetRound,
    hostSelectRound,
    hostOnRoundSelectChange,
    hostPickDeckRoundForSlot,
    hostPrevRound,
    hostNextRound,
    hostRandomizeCurrentRound,
    hostManualBuzz,
    hostResetBuzzers,
    hostTriggerStrike,
    hostClearStrikes,
    hostCyclePresets,
    hostRenameTeam,
    hostAdjustScore,
    hostSetExactScore,
    hostAwardPot,
    openHostPopover,
    closeHostPopover,
    hostShowWinnerScreen,
    hostUndo,
    hostSwitchStage,
    hostUpdateFm,
    hostSelectFmChip,
    hostSetFmClock,
    hostToggleFmClock,
    hostFmDuplicateBuzz,
    hostToggleFmHideP1,
    hostResetFm,
    toggleHostScript,
    setHostMobileTab,
    closeHostMoreMenu
  });

  function initOnLoad() {
    requestWakeLock();
    const buildBadge = document.getElementById("appBuildBadge");
    if (buildBadge) {
      const appScript = document.querySelector('script[src*="js/app.js"]');
      const match = appScript && appScript.src ? appScript.src.match(/[?&]v=([^&]+)/) : null;
      if (match && match[1]) {
        buildBadge.textContent = `Build v${match[1]}`;
      }
    }
    populateDeckCatalogSelect();
    discoverGitHubDecksFolder();
    try {
      const savedScriptPref = localStorage.getItem("feud_host_script_collapsed");
      const defaultCollapsed =
        savedScriptPref !== null ? savedScriptPref === "1" : window.innerWidth < 960;
      applyHostScriptCollapsed(defaultCollapsed);
    } catch (e) {}
    window.addEventListener("feud-client-connected", (e) => {
      const joinedRole = e && e.detail ? e.detail.role : "";
      if (
        activeRole === "host" &&
        roomState &&
        roomState.tvQrOverlay &&
        (!joinedRole || roomState.tvQrOverlay.role === joinedRole)
      ) {
        pushRoomPatch({ tvQrOverlay: null });
        refreshQrGridCards();
        applyBuzzerButtonLocks();
        Feud.showToast("📱 Device connected — QR cleared from TV screen.");
      }
    });
    window.addEventListener("feud-tv-connected", () => {
      const modal = document.getElementById("remoteTvQrModal");
      if (modal && !modal.classList.contains("hidden")) {
        closeRemoteTvQrModal();
        Feud.showToast("📺 Remote TV connected!");
      }
    });
    window.addEventListener("feud-peer-status", (e) => {
      const detail = (e && e.detail) || {};
      const buzzerStatusPill = document.getElementById("hostBuzzerStatusPill");
      if (buzzerStatusPill && detail.buzzers) {
        const bz = detail.buzzers;
        const count = (bz.t1 ? 1 : 0) + (bz.t2 ? 1 : 0);
        buzzerStatusPill.textContent =
          count === 0
            ? "🔔 Buzzers: 0/2"
            : `🔔 ${bz.t1 ? "T1✓" : "T1–"} • ${bz.t2 ? "T2✓" : "T2–"}`;
        buzzerStatusPill.className = `pill-badge ${count === 2 ? "awake-ok" : ""}`;
        applyBuzzerButtonLocks(bz);
      }
      ["buzzerConnStatusPill", "comboConnStatusPill"].forEach((id) => {
        const connPill = document.getElementById(id);
        if (connPill) {
          const ok = Boolean(detail.ok);
          if (id === "comboConnStatusPill") {
            connPill.textContent = ok ? "🟢" : "🟡";
            connPill.title = ok ? "Connected" : "Reconnecting…";
          } else {
            connPill.textContent = ok ? "🟢 Connected" : "🟡 Reconnecting…";
          }
          connPill.className = `pill-badge ${ok ? "awake-ok" : "awake-warn"}`;
        }
      });
    });
    const buzzerInputEl = document.getElementById("buzzerRoomInput");
    if (buzzerInputEl) {
      buzzerInputEl.addEventListener("input", () => {
        clearTimeout(lobbyProbeTimer);
        lobbyProbeTimer = setTimeout(() => refreshLobbyBuzzerLocks(true), 120);
      });
      buzzerInputEl.addEventListener("focus", () => refreshLobbyBuzzerLocks(true));
    }
    window.addEventListener("focus", () => {
      if (activeRole === "lobby") refreshLobbyBuzzerLocks(true);
    });
    setInterval(() => {
      const lobbyEl = document.getElementById("lobbyView");
      if (activeRole === "lobby" && lobbyEl && !lobbyEl.classList.contains("hidden")) {
        const hadPopup = Object.values(openedBuzzerPopups).some(Boolean);
        if (hadPopup) {
          const curPop = getOpenedPopupBuzzers();
          applyBuzzerButtonLocks(curPop);
        }
      }
    }, 1500);

    window.addEventListener("storage", (e) => {
      if (e.key && e.key.startsWith("party_feud_active_buzzers_")) {
        if (activeRole === "lobby") refreshLobbyBuzzerLocks(false);
      } else if (e.key === "party_feud_played_history_v1") {
        Feud.renderBranding(roomState);
        Feud.populateRoundDropdowns(roomState);
      } else if (e.key === "party_feud_custom_deck_v1") {
        roomState.customDeck = Feud.loadSavedCustomDeck ? Feud.loadSavedCustomDeck() : null;
        roomState.gameTitle = Feud.loadSavedGameTitle ? Feud.loadSavedGameTitle() : "Party Feud";
        roomState.gameIcon = Feud.loadSavedGameIcon ? Feud.loadSavedGameIcon() : "🎉";
        const presets = Feud.getActiveTeamPresets(roomState);
        if (presets && presets[0]) {
          roomState.team1Name = presets[0][0];
          roomState.team2Name = presets[0][1];
        }
        syncSetupModalInputsFromState();
      }
    });
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("hostMoreMenu");
      if (menu && menu.open && !menu.contains(e.target)) {
        menu.open = false;
      }
      if (activeRole === "host") {
        const tvDock = document.getElementById("hostTvMonitorDock");
        if (tvDock && tvDock.contains(e.target)) {
          if (e.target.closest("#tvTeam1Card")) {
            openHostPopover("team1");
          } else if (e.target.closest("#tvTeam2Card")) {
            openHostPopover("team2");
          } else if (e.target.closest("#tvQuestionOverlay")) {
            openHostPopover("round");
          } else if (e.target.closest("#tvStrikesPill")) {
            openHostPopover("phase");
          }
        }
      }
    });
    Feud.renderBranding(roomState);
    document.getElementById("roleSubtitle").textContent = "Live Party Multiplayer";

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
    const urlRole = (params.get("role") || "").trim().toLowerCase();
    const returnTo = (params.get("returnTo") || "").trim().toLowerCase();
    if (returnTo === "setup") {
      openNewGameModal("host");
    }
    if (urlRoom) {
      ["hostJoinCode", "tvRoomInput", "buzzerRoomInput"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = urlRoom;
      });
      if (!urlRole) {
        setTimeout(() => refreshLobbyBuzzerLocks(true), 200);
      }
      if (urlRole === "tv") {
        // Auto-launched TV window: join immediately; unlock audio on the first click (browser autoplay policy)
        document.addEventListener("pointerdown", () => Feud.unlockAudio(), { once: true });
        joinTvDisplay({ autoLaunched: true });
      } else if (urlRole === "buzzer1" || urlRole === "buzzer2") {
        const teamNum = urlRole === "buzzer1" ? 1 : 2;
        document.addEventListener("pointerdown", () => Feud.unlockAudio(), { once: true });
        joinTeamBuzzer(teamNum, { autoLaunched: true });
      } else if (urlRole === "buzzer_combo") {
        document.addEventListener("pointerdown", () => Feud.unlockAudio(), { once: true });
        joinComboBuzzer({ autoLaunched: true });
      } else if (urlRole === "host") {
        const last = Feud.loadLastSession();
        const stored = Feud.loadRoomStateFromStorage ? Feud.loadRoomStateFromStorage(urlRoom) : null;
        const pin =
          (last && last.code === urlRoom && last.pin) || (stored && stored.pin) || "";
        if (stored && pin && String(stored.pin) === String(pin)) {
          roomState = { ...roomState, ...stored };
          currentRoomCode = urlRoom;
          syncSequenceCounters(roomState);
          document.addEventListener("pointerdown", () => Feud.unlockAudio(), { once: true });
          Feud.startHostRoomSync(urlRoom, roomState);
          enterRole("host", urlRoom);
        } else if (pin) {
          const pinEl = document.getElementById("hostJoinPin");
          if (pinEl) pinEl.value = pin;
          document.addEventListener("pointerdown", () => Feud.unlockAudio(), { once: true });
          joinHostRoom();
        }
      }
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
      setTimeout(() => refreshLobbyBuzzerLocks(true), 200);
    }
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initOnLoad);
  } else {
    initOnLoad();
  }
})(window.Feud);
