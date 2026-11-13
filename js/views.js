// =====================================================================
// VIEW RENDERING ENGINE (TV, SOLO BOARD, HOST REMOTE, PODIUM BUZZERS)
// Supports dynamic deck sizes, match slicing, unplayed round tracking,
// 1-tap Fast Money answer/score chips, 3-strike Steal banner, and
// Winner celebration screen.
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  let lastRenderedRoundIdx = -1;
  let lastRenderedRevealed = new Set();
  let fmHostSignature = "";

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    const el = document.getElementById("toastBanner");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      el.classList.add("hidden");
    }, 2600);
  }

  function showBigRedXOverlay(count) {
    Feud.playBuzzerHonk();
    const overlay = document.getElementById("strikeOverlay");
    if (!overlay) return;
    overlay.innerHTML = "";
    const num = Math.max(1, Math.min(3, Number(count) || 1));
    for (let i = 0; i < num; i++) {
      const box = document.createElement("div");
      box.className = "big-red-x display-font";
      box.textContent = "X";
      overlay.appendChild(box);
    }
    overlay.classList.remove("hidden");
    clearTimeout(window._xTimer);
    window._xTimer = setTimeout(() => {
      overlay.classList.add("hidden");
    }, 1400);
  }

  function renderBranding(roomState) {
    const title = (roomState && roomState.gameTitle) || "Party Feud";
    const icon = (roomState && roomState.gameIcon) || "🎉";
    const matchCount = Feud.getRoundCount(roomState);
    const stats = Feud.getDeckPlayStats ? Feud.getDeckPlayStats(roomState) : null;
    const totalDeckRounds = stats ? stats.totalRounds : matchCount;
    const defaultDeckName =
      (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.deckName) || "Starter Party Deck";
    const deckName =
      roomState && roomState.customDeck && roomState.customDeck.name
        ? roomState.customDeck.name
        : defaultDeckName;

    const topIcon = document.getElementById("topBrandIcon");
    if (topIcon) topIcon.textContent = icon;

    const lobbyBadge = document.getElementById("lobbyBadgeText");
    if (lobbyBadge) lobbyBadge.textContent = `${icon} 4-Phone Live Party Setup`;

    const topTitle = document.getElementById("topBrandTitle");
    if (topTitle) topTitle.textContent = title;

    const lobbyTitle = document.getElementById("lobbyHeroTitle");
    if (lobbyTitle) lobbyTitle.textContent = title;

    const deckBadge = document.getElementById("activeDeckSummary");
    if (deckBadge) {
      deckBadge.textContent = `📚 Active Deck: ${deckName} (${totalDeckRounds} Total Rds)`;
    }

    const setupDeckBadge = document.getElementById("setupActiveDeckBadge");
    if (setupDeckBadge) {
      setupDeckBadge.textContent = `${deckName} (${totalDeckRounds} Rds)`;
    }

    const usageBadge = document.getElementById("setupDeckUsageBadge");
    if (usageBadge && stats) {
      usageBadge.textContent = `📊 ${stats.remainingRoundsCount} of ${stats.totalRounds} Rounds Unused`;
      usageBadge.className =
        stats.remainingRoundsCount > 0 ? "pill-badge awake-ok" : "pill-badge awake-warn";
    }
  }

  function renderTurnTimerUI(roomState) {
    const dur = Number(roomState.turnTimerDuration) || 10;
    const rem =
      roomState.turnTimerRemaining !== undefined && roomState.turnTimerRemaining !== null
        ? Number(roomState.turnTimerRemaining)
        : dur;
    const running = Boolean(roomState.turnTimerRunning);
    const isExpired = rem <= 0;
    const isUrgent = running && rem > 0 && rem <= 3;

    const labelText = isExpired ? "TIME!" : `${rem}s`;

    const tvBadge = document.getElementById("tvTurnTimerBadge");
    const tvVal = document.getElementById("tvTurnTimerValue");
    if (tvBadge && tvVal) {
      tvVal.textContent = labelText;
      tvBadge.className = `turn-timer-pill display-font${running ? " running" : ""}${
        isUrgent ? " urgent" : ""
      }${isExpired ? " expired" : ""}`;
    }

    const hostPill = document.getElementById("hostTurnTimerPill");
    const hostVal = document.getElementById("hostTurnTimerDisplay");
    if (hostPill && hostVal) {
      hostVal.textContent = labelText;
      hostPill.className = `turn-timer-pill display-font${running ? " running" : ""}${
        isUrgent ? " urgent" : ""
      }${isExpired ? " expired" : ""}`;
    }

    const hostToggleBtn = document.getElementById("hostBtnTurnTimerToggle");
    const canResume = !running && rem > 0 && rem < dur;
    if (hostToggleBtn) {
      hostToggleBtn.textContent = running
        ? "⏸️ Pause Timer (T)"
        : canResume
        ? `▶️ Resume Timer — ${rem}s (T)`
        : "▶️ Start Timer (T)";
    }

    const soloToggleBtn = document.getElementById("soloBtnTimerToggle");
    if (soloToggleBtn) {
      soloToggleBtn.textContent = running ? "⏸️ Pause (T)" : canResume ? "▶️ Resume (T)" : "▶️ Start (T)";
    }
  }

  function populateRoundDropdowns(roomState) {
    const selectors = [
      document.getElementById("hostRoundSelect"),
      document.getElementById("soloRoundSelect")
    ];

    const totalRounds = Feud.getRoundCount(roomState);

    selectors.forEach((sel) => {
      if (!sel) return;
      sel.innerHTML = "";
      const groups = new Map();
      for (let idx = 0; idx < totalRounds; idx++) {
        const r = Feud.getRoundData(roomState, idx);
        const theme = r.theme || "🎉 Rounds";
        if (!groups.has(theme)) groups.set(theme, []);
        groups.get(theme).push({ r, idx });
      }

      groups.forEach((items, theme) => {
        const og = document.createElement("optgroup");
        og.label = theme;
        items.forEach(({ r, idx }) => {
          const opt = document.createElement("option");
          opt.value = String(idx);
          opt.textContent = `${r.title} (${r.multiplier}x): ${r.prompt.slice(0, 44)}…`;
          if (idx === roomState.roundIdx) opt.selected = true;
          og.appendChild(opt);
        });
        sel.appendChild(og);
      });
    });
  }

  function renderTvWinnerScreen(roomState) {
    const t1 = roomState.team1Name || "Team 1";
    const t2 = roomState.team2Name || "Team 2";
    const s1 = Number(roomState.team1Score) || 0;
    const s2 = Number(roomState.team2Score) || 0;

    const winTitle = document.getElementById("tvWinnerTitle");
    const winSub = document.getElementById("tvWinnerSubtitle");
    if (winTitle && winSub) {
      if (s1 > s2) {
        winTitle.textContent = `👑 ${t1} Wins!`;
        winSub.textContent = `Victory by ${s1 - s2} points!`;
      } else if (s2 > s1) {
        winTitle.textContent = `👑 ${t2} Wins!`;
        winSub.textContent = `Victory by ${s2 - s1} points!`;
      } else {
        winTitle.textContent = "⚡ It's a Tie Match!";
        winSub.textContent = "Play the Sudden-Death Tie-Breaker round to crown a champion!";
      }
    }

    const n1 = document.getElementById("tvWinT1Name");
    const v1 = document.getElementById("tvWinT1Score");
    const n2 = document.getElementById("tvWinT2Name");
    const v2 = document.getElementById("tvWinT2Score");
    if (n1) n1.textContent = t1;
    if (v1) v1.textContent = String(s1);
    if (n2) n2.textContent = t2;
    if (v2) v2.textContent = String(s2);
  }

  function getTeamLabel(roomState, teamNum) {
    if (teamNum === 1) return roomState.team1Name || "Team 1";
    if (teamNum === 2) return roomState.team2Name || "Team 2";
    return "Team";
  }

  function renderGuidedFlowUI(roomState) {
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    const t1 = roomState.team1Name || "Team 1";
    const t2 = roomState.team2Name || "Team 2";
    const dur = Number(roomState.turnTimerDuration) || 10;
    const round = Feud.getRoundData(roomState, roomState.roundIdx);
    const allRevealed = (roomState.revealed || []).length >= round.answers.length;
    const isLastRound = roomState.roundIdx + 1 >= Feud.getRoundCount(roomState);

    const steps = [
      { id: "faceoff", label: "1. Face-Off" },
      { id: "pass-or-play", label: "2. Play or Pass" },
      { id: "playing", label: `3. Team Play (${roomState.strikes || 0}/3 X)` },
      { id: "steal", label: "4. Steal" },
      { id: "round-over", label: "5. Round Complete" }
    ];

    const phaseOrder = {
      "faceoff-ready": 0,
      "faceoff-buzz": 0,
      "faceoff-p1": 0,
      "faceoff-p2": 0,
      "pass-or-play": 1,
      playing: 2,
      steal: 3,
      "round-over": 4
    };
    const activeStepIdx = phaseOrder[phase] ?? 0;

    const stepperEl = document.getElementById("hostFlowStepper");
    if (stepperEl) {
      stepperEl.innerHTML = steps
        .map((s, idx) => {
          const cls = idx === activeStepIdx ? "active" : idx < activeStepIdx ? "done" : "";
          return `<span class="flow-step-pill ${cls}">${escapeHtml(s.label)}</span>`;
        })
        .join("");
    }

    const cardEl = document.getElementById("hostFlowCoachCard");
    if (cardEl) {
      cardEl.classList.toggle("steal-phase", phase === "steal");
      cardEl.classList.toggle("win-phase", phase === "round-over");
    }

    let headline = "";
    let subtext = "";
    let actionsHtml = "";

    if (phase === "faceoff-ready") {
      headline = "🔔 Step 1: Ready for the Face-Off";
      subtext = `Call one player from ${t1} and ${t2} to the podium. Reveal the question to unlock the buzzers!`;
      actionsHtml = `
        <button type="button" class="action-btn btn-gold display-font" onclick="hostRevealQuestionAndStartTimer()">
          👁️ Show Question &amp; Start Face-Off (Space)
        </button>
        <button type="button" class="top-btn" onclick="hostManualBuzz(1)">🔔 ${escapeHtml(t1)} Buzzed</button>
        <button type="button" class="top-btn" onclick="hostManualBuzz(2)">🔔 ${escapeHtml(t2)} Buzzed</button>
      `;
    } else if (phase === "faceoff-buzz") {
      headline = "🔔 Face-Off: Which Team Buzzed In First?";
      subtext =
        "Waiting for a player to buzz in on their phone—or tap the team that buzzed first below to select them and start their timer:";
      actionsHtml = `
        <button type="button" class="action-btn btn-red display-font" onclick="hostManualBuzz(1)">
          🔔 ${escapeHtml(t1)} Buzzed First
        </button>
        <button type="button" class="action-btn btn-blue display-font" onclick="hostManualBuzz(2)">
          🔔 ${escapeHtml(t2)} Buzzed First
        </button>
      `;
    } else if (phase === "faceoff-p1") {
      const firstTeam = roomState.faceoffFirstTeam || roomState.controllingTeam || 1;
      const secondTeam = firstTeam === 1 ? 2 : 1;
      const firstName = getTeamLabel(roomState, firstTeam);
      const secondName = getTeamLabel(roomState, secondTeam);
      headline = `🎤 Face-Off (1st Turn): ${firstName} Answering!`;
      subtext = `Tap their answer on the board below! (#1 answer wins Face-Off immediately; #2–#8 or tapping '❌ Wrong Answer' automatically switches to ${secondName}!)`;
      actionsHtml = `
        <button type="button" class="action-btn btn-red display-font" onclick="hostFaceOffWrongGuess()">
          ⚡ Face-Off Wrong Guess (1 Temp X) → Re-arm ${escapeHtml(secondName)} (X)
        </button>
        <button type="button" class="top-btn gold" onclick="hostRestartTurnTimer()">
          🔄 Restart ${dur}s Timer (R)
        </button>
      `;
    } else if (phase === "faceoff-p2") {
      const firstTeam = roomState.faceoffFirstTeam || 1;
      const secondTeam = roomState.controllingTeam || (firstTeam === 1 ? 2 : 1);
      const firstName = getTeamLabel(roomState, firstTeam);
      const secondName = getTeamLabel(roomState, secondTeam);
      const bestRank = roomState.faceoffBestRank ?? 999;

      if (bestRank < 999) {
        headline = `🎤 Face-Off (2nd Turn): ${secondName} Must Beat Answer #${bestRank + 1}!`;
        subtext = `${firstName} hit #${bestRank + 1}. Tap ${secondName}'s answer if on the board, or tap '❌ Wrong Answer' (${firstName} wins Face-Off).`;
      } else {
        headline = `🎤 Face-Off (2nd Turn): ${secondName} Can Win the Face-Off!`;
        subtext = `${firstName} missed! If ${secondName} hits ANY answer on the board, they win the Face-Off!`;
      }
      actionsHtml = `
        <button type="button" class="action-btn btn-red display-font" onclick="hostFaceOffWrongGuess()">
          ⚡ Face-Off Wrong Guess (1 Temp X)
        </button>
        <button type="button" class="top-btn gold" onclick="hostRestartTurnTimer()">
          🔄 Restart ${dur}s Timer (R)
        </button>
      `;
    } else if (phase === "pass-or-play") {
      const winTeam = roomState.faceoffWinnerTeam || roomState.controllingTeam || 1;
      const passTeam = winTeam === 1 ? 2 : 1;
      const winName = getTeamLabel(roomState, winTeam);
      const passName = getTeamLabel(roomState, passTeam);
      headline = `🏆 ${winName} Won the Face-Off! Play or Pass?`;
      subtext = `Ask ${winName} whether they want to PLAY the board or PASS control to ${passName}. Choosing either option starts the timer for the next player!`;
      actionsHtml = `
        <button type="button" class="action-btn btn-gold display-font" onclick="hostChoosePlayOrPass('play')">
          ▶️ ${escapeHtml(winName)} PLAYS Board (Start Timer)
        </button>
        <button type="button" class="action-btn btn-slate display-font" onclick="hostChoosePlayOrPass('pass')">
          🔀 PASS Board to ${escapeHtml(passName)}
        </button>
      `;
    } else if (phase === "playing") {
      const playTeam = roomState.controllingTeam || roomState.originalPlayingTeam || 1;
      const oppTeam = playTeam === 1 ? 2 : 1;
      const playName = getTeamLabel(roomState, playTeam);
      const oppName = getTeamLabel(roomState, oppTeam);
      const curStrikes = Number(roomState.strikes) || 0;
      headline = `🎯 ${playName} Playing the Board (${curStrikes} of 3 Strikes)`;
      subtext = `Ask the next team member! Tap their answer below if right (even after timer expires), or tap '❌ Wrong Answer' for Strike ${
        curStrikes + 1
      }/3. (On 3rd X, control automatically switches to ${oppName} for the Steal!)`;
      actionsHtml = `
        <button type="button" class="action-btn btn-gold display-font" onclick="hostRestartTurnTimer()">
          🔄 Ask Next Player / Start ${dur}s Timer (R)
        </button>
        <button type="button" class="action-btn btn-red display-font" onclick="hostHandleWrongAnswer()">
          ❌ Wrong Answer → Strike ${curStrikes + 1}/3 (X)
        </button>
      `;
    } else if (phase === "steal") {
      const origTeam =
        roomState.originalPlayingTeam || (roomState.controllingTeam === 1 ? 2 : 1);
      const stealTeam = roomState.controllingTeam || (origTeam === 1 ? 2 : 1);
      const origName = getTeamLabel(roomState, origTeam);
      const stealName = getTeamLabel(roomState, stealTeam);
      headline = `🚨 STEAL MODE: ${stealName} Can Steal ${roomState.pot || 0} Points!`;
      subtext = `${origName} got 3 Strikes (XXX)! Start the 15s Steal Timer for ${stealName}. Tap an unflipped board answer if they steal it (auto-awards pot to ${stealName}), or tap '❌ Steal Missed' (auto-awards pot to ${origName})!`;
      actionsHtml = `
        <button type="button" class="action-btn btn-gold display-font" onclick="hostStartStealTimer()">
          ⏱️ Start 15s Steal Timer (R)
        </button>
        <button type="button" class="action-btn btn-red display-font" onclick="hostHandleWrongAnswer()">
          ❌ Steal Missed → Award Pot to ${escapeHtml(origName)} (X)
        </button>
      `;
    } else if (phase === "round-over") {
      const winTeam = roomState.roundWinnerTeam || roomState.controllingTeam || 1;
      const winName = getTeamLabel(roomState, winTeam);
      headline = `🎉 Round Complete — ${winName} Won the Round!`;
      subtext = allRevealed
        ? "All answers on the board have been revealed! Advance to the next round when ready."
        : "Reveal the remaining unflipped answers on the TV (without adding points), then advance to the next round!";
      actionsHtml = `
        ${
          !allRevealed
            ? `<button type="button" class="action-btn btn-gold display-font" onclick="hostRevealAll()">👁️ Reveal Remaining Answers (No Points)</button>`
            : ""
        }
        ${
          !isLastRound
            ? `<button type="button" class="action-btn btn-blue display-font" onclick="hostNextRound()">⏭️ Next Round ▶</button>`
            : roomState.enableFastMoney !== false
            ? `<button type="button" class="action-btn btn-gold display-font" onclick="hostSwitchStage('fast')">⚡ Start Fast Money Bonus Round</button>`
            : ""
        }
        <button type="button" class="top-btn gold" onclick="openNextMatchModal()">🏁 End Match / Next Game</button>
      `;
    }

    const headEl = document.getElementById("hostFlowHeadline");
    const subEl = document.getElementById("hostFlowSubtext");
    const actEl = document.getElementById("hostFlowActions");
    const soloActEl = document.getElementById("soloGuidedActions");

    if (headEl) headEl.textContent = headline;
    if (subEl) subEl.textContent = subtext;
    if (actEl) actEl.innerHTML = actionsHtml;
    if (soloActEl) soloActEl.innerHTML = actionsHtml;
  }

  function renderTvView(roomState, activeRole, handlers) {
    renderBranding(roomState);
    renderTurnTimerUI(roomState);
    renderGuidedFlowUI(roomState);
    const totalRounds = Feud.getRoundCount(roomState);
    const round = Feud.getRoundData(roomState, roomState.roundIdx);
    const multText =
      round.multiplier === 1 ? "1x Single" : round.multiplier === 2 ? "2x Double" : "3x Triple";
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");

    document.getElementById("tvThemeBadge").textContent = round.theme;
    document.getElementById("tvPotValue").textContent = String(roomState.pot || 0);
    document.getElementById("tvMultBadge").textContent = `${multText} Points`;
    document.getElementById("tvStrikesBadge").textContent = `Strikes: ${roomState.strikes || 0} / 3`;

    document.getElementById("tvTeam1Name").textContent = roomState.team1Name;
    document.getElementById("tvTeam1Score").textContent = String(roomState.team1Score || 0);
    document.getElementById("tvTeam2Name").textContent = roomState.team2Name;
    document.getElementById("tvTeam2Score").textContent = String(roomState.team2Score || 0);

    const t1Card = document.getElementById("tvTeam1Card");
    const t2Card = document.getElementById("tvTeam2Card");
    t1Card.classList.toggle("winner-glow", roomState.buzzerWinner === 1 || (phase === "round-over" && roomState.roundWinnerTeam === 1));
    t2Card.classList.toggle("winner-glow", roomState.buzzerWinner === 2 || (phase === "round-over" && roomState.roundWinnerTeam === 2));
    t1Card.classList.toggle("playing-glow", roomState.controllingTeam === 1);
    t2Card.classList.toggle("playing-glow", roomState.controllingTeam === 2);
    const isStealPhase = phase === "steal";
    t1Card.classList.toggle("steal-glow", isStealPhase && roomState.controllingTeam === 1);
    t2Card.classList.toggle("steal-glow", isStealPhase && roomState.controllingTeam === 2);

    const badgeLabel =
      phase === "faceoff-p1" || phase === "faceoff-p2"
        ? "🎤 Face-Off Turn"
        : phase === "pass-or-play"
        ? "🏆 Won Face-Off!"
        : phase === "steal"
        ? `🚨 CHANCE TO STEAL ${roomState.pot || 0}!`
        : phase === "round-over"
        ? "🏆 Won Round!"
        : "🎯 Playing Board";

    const t1Ctrl = document.getElementById("tvTeam1ControlBadge");
    const t2Ctrl = document.getElementById("tvTeam2ControlBadge");
    if (t1Ctrl) {
      t1Ctrl.textContent = badgeLabel;
      t1Ctrl.classList.toggle("hidden", roomState.controllingTeam !== 1);
      t1Ctrl.classList.toggle("active-control", roomState.controllingTeam === 1);
    }
    if (t2Ctrl) {
      t2Ctrl.textContent = badgeLabel;
      t2Ctrl.classList.toggle("hidden", roomState.controllingTeam !== 2);
      t2Ctrl.classList.toggle("active-control", roomState.controllingTeam === 2);
    }

    const soloBar = document.getElementById("soloControlsBar");
    if (soloBar) {
      soloBar.classList.toggle("hidden", activeRole !== "solo");
      const soloSel = document.getElementById("soloRoundSelect");
      if (soloSel) soloSel.value = String(roomState.roundIdx);
    }

    const topHud = document.querySelector(".tv-top-hud");
    const mainWrap = document.getElementById("tvMainBoardWrap");
    const fmWrap = document.getElementById("tvFastMoneyWrap");
    const winWrap = document.getElementById("tvWinnerWrap");

    if (roomState.stage === "winner") {
      if (topHud) topHud.classList.add("hidden");
      mainWrap.classList.add("hidden");
      fmWrap.classList.add("hidden");
      if (winWrap) winWrap.classList.remove("hidden");
      renderTvWinnerScreen(roomState);
      return;
    } else if (roomState.stage === "fast") {
      if (topHud) topHud.classList.add("hidden");
      mainWrap.classList.add("hidden");
      fmWrap.classList.remove("hidden");
      if (winWrap) winWrap.classList.add("hidden");
      renderTvFastMoney(roomState);
      return;
    } else {
      if (topHud) topHud.classList.remove("hidden");
      mainWrap.classList.remove("hidden");
      fmWrap.classList.add("hidden");
      if (winWrap) winWrap.classList.add("hidden");
    }

    document.getElementById("tvRoundCounter").textContent = `${round.title} (${
      roomState.roundIdx + 1
    } of ${totalRounds})`;

    const promptBanner = document.getElementById("tvPromptBanner");
    const promptText = document.getElementById("tvPromptText");
    if (roomState.questionRevealed) {
      if (promptBanner) promptBanner.classList.remove("question-hidden");
      promptText.textContent = round.prompt;
    } else {
      if (promptBanner) promptBanner.classList.add("question-hidden");
      promptText.textContent =
        activeRole === "solo"
          ? "🔒 Question Hidden — Click 'Show Q & Start Timer' (or press Space) when ready!"
          : "🔒 Question Hidden — Get Ready for the Face-Off!";
    }

    const grid = document.getElementById("tvAnswerGrid");
    grid.innerHTML = "";
    const colL = document.createElement("div");
    colL.className = "answer-col";
    const colR = document.createElement("div");
    colR.className = "answer-col";

    const revSet = new Set(roomState.revealed || []);
    const isSameRound = lastRenderedRoundIdx === roomState.roundIdx;

    const halfCount = Math.ceil(Math.max(6, round.answers.length) / 2);
    const slotCount = halfCount * 2;
    colL.style.setProperty("--rows-per-col", String(halfCount));
    colR.style.setProperty("--rows-per-col", String(halfCount));

    for (let i = 0; i < slotCount; i++) {
      const ans = round.answers[i];
      const target = i < halfCount ? colL : colR;
      if (!ans) {
        const empty = document.createElement("div");
        empty.className = "feud-tile-empty";
        target.appendChild(empty);
        continue;
      }

      const tile = document.createElement("div");
      const isRevealed = revSet.has(i);
      const justFlipped = isRevealed && (!isSameRound || !lastRenderedRevealed.has(i));

      if (isRevealed) {
        tile.className = `feud-tile revealed-state${justFlipped ? " just-revealed" : ""}${
          activeRole === "solo" ? " interactive-tile" : ""
        }`;
        tile.innerHTML = `
          <span class="tile-ans-text">${escapeHtml(ans.text)}</span>
          <span class="tile-pts-box display-font">${ans.points * round.multiplier}</span>
        `;
      } else {
        tile.className = `feud-tile hidden-state${activeRole === "solo" ? " interactive-tile" : ""}`;
        tile.innerHTML = `<span class="tile-num-badge display-font">${i + 1}</span>`;
      }

      if (activeRole === "solo" && handlers && handlers.onToggleAnswer) {
        tile.title = isRevealed ? "Click to hide answer" : `Click or press ${i + 1} to reveal answer`;
        tile.addEventListener("click", () => handlers.onToggleAnswer(i));
      }

      target.appendChild(tile);
    }

    lastRenderedRoundIdx = roomState.roundIdx;
    lastRenderedRevealed = new Set(revSet);

    grid.appendChild(colL);
    grid.appendChild(colR);

    const buzzBanner = document.getElementById("tvBuzzerBanner");
    buzzBanner.classList.remove("active", "steal-alert");

    if (phase === "steal" || (roomState.strikes || 0) >= 3) {
      const stealTeamName = getTeamLabel(
        roomState,
        roomState.controllingTeam ||
          (roomState.originalPlayingTeam === 1 ? 2 : 1)
      );
      buzzBanner.textContent = `🚨 ${stealTeamName}: CHANCE TO STEAL ${roomState.pot || 0} PTS!`;
      buzzBanner.classList.add("steal-alert");
    } else if (phase === "round-over") {
      const winName = getTeamLabel(
        roomState,
        roomState.roundWinnerTeam || roomState.controllingTeam || 1
      );
      buzzBanner.textContent = `🏆 ${winName} Wins the Round!`;
      buzzBanner.classList.add("active");
    } else if (phase === "pass-or-play") {
      const winName = getTeamLabel(
        roomState,
        roomState.faceoffWinnerTeam || roomState.controllingTeam || 1
      );
      buzzBanner.textContent = `🏆 ${winName} Won the Face-Off — Play or Pass?`;
      buzzBanner.classList.add("active");
    } else if (phase === "playing" && roomState.controllingTeam) {
      const playName = getTeamLabel(roomState, roomState.controllingTeam);
      buzzBanner.textContent = `🎯 ${playName} Playing the Board (${
        roomState.strikes || 0
      } / 3 Strikes)`;
    } else if (phase === "faceoff-p2" && roomState.controllingTeam) {
      const p2Name = getTeamLabel(roomState, roomState.controllingTeam);
      buzzBanner.textContent = `🎤 Face-Off: ${p2Name}'s Turn to Answer!`;
      buzzBanner.classList.add("active");
    } else if (roomState.buzzerWinner === 1) {
      buzzBanner.textContent = `🚨 ${roomState.team1Name} Buzzed In First!`;
      buzzBanner.classList.add("active");
    } else if (roomState.buzzerWinner === 2) {
      buzzBanner.textContent = `🚨 ${roomState.team2Name} Buzzed In First!`;
      buzzBanner.classList.add("active");
    } else {
      buzzBanner.textContent =
        activeRole === "solo"
          ? "💡 Follow the Guided Bar below (or press Space / 1–8 / X / R)!"
          : "🔔 Podium Buzzers Ready!";
    }
  }

  function renderTvFastMoney(roomState) {
    const fmQuestions = Feud.getFastMoneyList(roomState);
    document.getElementById("tvFmClock").textContent = String(roomState.fmClock ?? 20);
    const entries = roomState.fmEntries || [];
    const total = entries.reduce(
      (s, r) => s + (Number(r.p1Pts) || 0) + (Number(r.p2Pts) || 0),
      0
    );
    document.getElementById("tvFmTotal").textContent = String(total);

    const box = document.getElementById("tvFmRows");
    box.innerHTML = fmQuestions
      .map((q, i) => {
        const e = entries[i] || {};
        const p1Shown = roomState.fmHideP1 ? "HIDDEN" : e.p1Ans || "—";
        const p1PtsShown = roomState.fmHideP1 ? "-" : e.p1Pts || 0;
        return `
        <div class="fm-row tv-fm-row">
          <div class="tv-fm-prompt">${i + 1}. ${escapeHtml(q.prompt)}</div>
          <div class="tv-fm-ans-box">
            <span class="tv-fm-ans-text">${escapeHtml(p1Shown)}</span>
            <span class="tv-fm-pts-text display-font">${p1PtsShown}</span>
          </div>
          <div class="tv-fm-ans-box">
            <span class="tv-fm-ans-text">${escapeHtml(e.p2Ans || "—")}</span>
            <span class="tv-fm-pts-text display-font">${e.p2Pts || 0}</span>
          </div>
        </div>
      `;
      })
      .join("");
  }

  function parseFmHintIntoChips(hintStr) {
    if (!hintStr) return [];
    const parts = String(hintStr)
      .replace(/^Top\s*Answers:\s*/i, "")
      .split(",");
    const chips = [];
    parts.forEach((part) => {
      const m = part.trim().match(/^(.+?)\s*\((\d+)\)\s*$/);
      if (m) {
        chips.push({ text: m[1].trim(), pts: parseInt(m[2], 10) || 0 });
      }
    });
    return chips;
  }

  function renderHostView(roomState, handlers) {
    renderBranding(roomState);
    renderTurnTimerUI(roomState);
    renderGuidedFlowUI(roomState);
    const round = Feud.getRoundData(roomState, roomState.roundIdx);
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    const sel = document.getElementById("hostRoundSelect");
    if (sel) sel.value = String(roomState.roundIdx);

    const fmTab = document.getElementById("hostTabFm");
    if (fmTab) {
      fmTab.classList.toggle("hidden", roomState.enableFastMoney === false);
      fmTab.classList.toggle("gold", roomState.stage === "fast");
    }
    document.getElementById("hostTabMain").classList.toggle("gold", roomState.stage === "main");

    if (roomState.stage === "fast") {
      document.getElementById("hostMainControls").classList.add("hidden");
      document.getElementById("hostFmControls").classList.remove("hidden");
      renderHostFastMoney(roomState, handlers);
      return;
    } else {
      document.getElementById("hostMainControls").classList.remove("hidden");
      document.getElementById("hostFmControls").classList.add("hidden");
    }

    document.getElementById("hostRoundBadge").textContent = `${round.title} • ${round.multiplier}x • ${round.theme}`;
    document.getElementById("hostPotDisplay").textContent = String(roomState.pot || 0);
    document.getElementById("hostPromptText").textContent = round.prompt;

    const qStatusBadge = document.getElementById("hostQuestionStatusBadge");
    if (qStatusBadge) {
      if (roomState.questionRevealed) {
        qStatusBadge.textContent = "📺 Question Shown on TV";
        qStatusBadge.className = "pill-badge awake-ok";
      } else {
        qStatusBadge.textContent = "🙈 Question Hidden on TV";
        qStatusBadge.className = "pill-badge awake-warn";
      }
    }

    const revealBtn = document.getElementById("hostBtnRevealQuestion");
    if (revealBtn) {
      revealBtn.textContent = roomState.questionRevealed
        ? "🔄 Question Live — Restart Timer (Space / R)"
        : "👁️ Show Question & Start Timer (Space)";
    }

    const toggleOnlyBtn = document.getElementById("hostBtnToggleQuestionOnly");
    if (toggleOnlyBtn) {
      toggleOnlyBtn.textContent = roomState.questionRevealed
        ? "🙈 Hide Question on TV"
        : "👁️ Show Question (No Timer)";
    }

    const ctrl0 = document.getElementById("hostCtrlBtn0");
    const ctrl1 = document.getElementById("hostCtrlBtn1");
    const ctrl2 = document.getElementById("hostCtrlBtn2");
    if (ctrl0) ctrl0.classList.toggle("gold", !roomState.controllingTeam);
    if (ctrl1) {
      ctrl1.textContent = `🎯 ${roomState.team1Name} Playing`;
      ctrl1.classList.toggle("gold", roomState.controllingTeam === 1);
    }
    if (ctrl2) {
      ctrl2.textContent = `🎯 ${roomState.team2Name} Playing`;
      ctrl2.classList.toggle("gold", roomState.controllingTeam === 2);
    }

    const list = document.getElementById("hostAnswersList");
    const revSet = new Set(roomState.revealed || []);
    const isRoundOver = phase === "round-over";
    list.innerHTML = "";

    round.answers.forEach((ans, idx) => {
      const isRev = revSet.has(idx);
      const pts = ans.points * round.multiplier;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `host-answer-btn ${isRev ? "is-revealed" : ""}${
        isRoundOver && !isRev ? " is-missed-reveal" : ""
      }`;
      btn.title = isRoundOver && !isRev ? "Pot already awarded — reveals on TV for 0 pts" : "";
      btn.addEventListener("click", () => handlers.onToggleAnswer(idx));
      btn.innerHTML = `
        <span class="host-ans-left">
          <span class="host-rank-circle">${idx + 1}</span>
          <span>${escapeHtml(ans.text)}</span>
        </span>
        <span class="host-pts-pill">${
          isRev ? `✅ ${pts}` : isRoundOver ? `👁️ Reveal (0 pts)` : pts
        }</span>
      `;
      list.appendChild(btn);
    });

    // Phase-aware strike controls: Face-Off temp X vs. round strikes
    const isFaceOff = String(phase).startsWith("faceoff");
    const foBtn = document.getElementById("hostBtnFaceOffWrong");
    const strikeRow = document.getElementById("hostRoundStrikeRow");
    const strikeHint = document.getElementById("hostStrikeHint");
    if (foBtn) {
      foBtn.disabled = !isFaceOff;
      foBtn.classList.toggle("hidden", !isFaceOff);
    }
    if (strikeRow) {
      strikeRow.querySelectorAll("button.action-btn").forEach((b) => {
        b.disabled = isFaceOff || isRoundOver;
      });
    }
    if (strikeHint) {
      strikeHint.textContent = isFaceOff
        ? "Face-Off: a wrong guess shows 1 temporary X and does NOT count toward the round's 3 strikes."
        : isRoundOver
        ? "Round complete — strikes disabled."
        : `Round strikes: ${roomState.strikes || 0} / 3 (3rd strike switches to the Steal automatically).`;
    }

    // Award Pot buttons: pre-highlight the stealing team; disable once the pot is awarded
    const stealTeamNum = phase === "steal" ? roomState.controllingTeam || 0 : 0;
    const origTeamNum = phase === "steal" ? roomState.originalPlayingTeam || 0 : 0;
    [1, 2].forEach((n) => {
      const ab = document.getElementById(`hostAwardPotBtn${n}`);
      if (!ab) return;
      ab.classList.toggle("steal-award-highlight", stealTeamNum === n);
      ab.disabled = isRoundOver || !(roomState.pot > 0);
      ab.textContent =
        stealTeamNum === n
          ? `🚨 Steal! Award ${roomState.pot || 0}`
          : origTeamNum === n
          ? `Steal Failed → Award ${roomState.pot || 0}`
          : isRoundOver
          ? "✅ Pot Awarded"
          : `Award Pot (${roomState.pot || 0})`;
    });

    const buzzReadout = document.getElementById("hostBuzzerReadout");
    buzzReadout.classList.remove("active", "steal-alert");
    if (phase === "steal" || (roomState.strikes || 0) >= 3) {
      const stealTeam = getTeamLabel(
        roomState,
        roomState.controllingTeam ||
          (roomState.originalPlayingTeam === 1 ? 2 : 1)
      );
      buzzReadout.textContent = `🚨 3 Strikes! Steal Mode: ${stealTeam}'s Turn (15s Timer Ready)`;
      buzzReadout.classList.add("steal-alert");
    } else if (phase === "pass-or-play") {
      const winTeam = getTeamLabel(
        roomState,
        roomState.faceoffWinnerTeam || roomState.controllingTeam || 1
      );
      buzzReadout.textContent = `🏆 ${winTeam} Won Face-Off — Choose Play or Pass`;
      buzzReadout.classList.add("active");
    } else if (phase === "faceoff-p2") {
      const p2Team = getTeamLabel(roomState, roomState.controllingTeam || 2);
      buzzReadout.textContent = `🎤 Face-Off 2nd Turn: ${p2Team} Answering`;
      buzzReadout.classList.add("active");
    } else if (roomState.buzzerWinner === 1) {
      buzzReadout.textContent = `🚨 ${roomState.team1Name} Buzzed First!`;
      buzzReadout.classList.add("active");
    } else if (roomState.buzzerWinner === 2) {
      buzzReadout.textContent = `🚨 ${roomState.team2Name} Buzzed First!`;
      buzzReadout.classList.add("active");
    } else {
      buzzReadout.textContent = "Ready — Waiting for Team Buzzers";
    }

    const t1In = document.getElementById("hostT1Name");
    const t2In = document.getElementById("hostT2Name");
    if (document.activeElement !== t1In) t1In.value = roomState.team1Name;
    if (document.activeElement !== t2In) t2In.value = roomState.team2Name;
    document.getElementById("hostT1Score").textContent = String(roomState.team1Score || 0);
    document.getElementById("hostT2Score").textContent = String(roomState.team2Score || 0);
  }

  function renderHostFastMoney(roomState, handlers) {
    const fmQuestions = Feud.getFastMoneyList(roomState);
    document.getElementById("hostFmClock").textContent = `${roomState.fmClock ?? 20}s`;
    const entries = roomState.fmEntries || [];
    const total = entries.reduce(
      (s, r) => s + (Number(r.p1Pts) || 0) + (Number(r.p2Pts) || 0),
      0
    );
    document.getElementById("hostFmTotal").textContent = String(total);

    const wrap = document.getElementById("hostFmRows");
    const currentSig = fmQuestions.map((q) => `${q.prompt}::${q.hint}`).join("|");
    if (fmHostSignature !== currentSig || wrap.children.length !== fmQuestions.length) {
      wrap.innerHTML = "";
      fmQuestions.forEach((q, i) => {
        const chips = parseFmHintIntoChips(q.hint);
        const row = document.createElement("div");
        row.className = "fm-row";
        row.innerHTML = `
          <div>
            <div style="font-weight:800; color:#fde68a; font-size:13px;">${i + 1}. ${escapeHtml(
              q.prompt
            )}</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:3px;">Tap chip below to auto-fill answer &amp; score:</div>
          </div>
          <div>
            <div class="fm-in-pair">
              <input id="fmHostP1Ans_${i}" class="fm-txt" type="text" placeholder="P1 Answer" />
              <input id="fmHostP1Pts_${i}" class="fm-num display-font" type="number" min="0" max="100" placeholder="Pts" />
            </div>
            <div id="fmP1Chips_${i}" class="fm-chips-wrap"></div>
          </div>
          <div>
            <div class="fm-in-pair">
              <input id="fmHostP2Ans_${i}" class="fm-txt" type="text" placeholder="P2 Answer" />
              <input id="fmHostP2Pts_${i}" class="fm-num display-font" type="number" min="0" max="100" placeholder="Pts" />
            </div>
            <div id="fmP2Chips_${i}" class="fm-chips-wrap"></div>
          </div>
        `;
        wrap.appendChild(row);

        const p1AnsEl = row.querySelector(`#fmHostP1Ans_${i}`);
        const p1PtsEl = row.querySelector(`#fmHostP1Pts_${i}`);
        const p2AnsEl = row.querySelector(`#fmHostP2Ans_${i}`);
        const p2PtsEl = row.querySelector(`#fmHostP2Pts_${i}`);

        p1AnsEl.addEventListener("input", (e) => handlers.onUpdateFm(i, "p1Ans", e.target.value));
        p1PtsEl.addEventListener("change", (e) => handlers.onUpdateFm(i, "p1Pts", e.target.value));
        p2AnsEl.addEventListener("input", (e) => handlers.onUpdateFm(i, "p2Ans", e.target.value));
        p2PtsEl.addEventListener("change", (e) => handlers.onUpdateFm(i, "p2Pts", e.target.value));

        [1, 2].forEach((playerNum) => {
          const chipBox = row.querySelector(`#fmP${playerNum}Chips_${i}`);
          if (!chipBox) return;
          chips.forEach((c) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "fm-chip-btn";
            b.textContent = `${c.text} • ${c.pts}`;
            b.addEventListener("click", () => {
              if (handlers.onSelectFmChip) {
                handlers.onSelectFmChip(i, playerNum, c.text, c.pts);
              }
            });
            chipBox.appendChild(b);
          });
          const zeroBtn = document.createElement("button");
          zeroBtn.type = "button";
          zeroBtn.className = "fm-chip-btn zero-chip";
          zeroBtn.textContent = "❌ 0 Pts";
          zeroBtn.addEventListener("click", () => {
            if (handlers.onSelectFmChip) {
              handlers.onSelectFmChip(i, playerNum, null, 0);
            }
          });
          chipBox.appendChild(zeroBtn);
        });
      });
      fmHostSignature = currentSig;
    }

    fmQuestions.forEach((_, i) => {
      const e = entries[i] || { p1Ans: "", p1Pts: 0, p2Ans: "", p2Pts: 0 };
      const p1AnsEl = document.getElementById(`fmHostP1Ans_${i}`);
      const p1PtsEl = document.getElementById(`fmHostP1Pts_${i}`);
      const p2AnsEl = document.getElementById(`fmHostP2Ans_${i}`);
      const p2PtsEl = document.getElementById(`fmHostP2Pts_${i}`);

      if (p1AnsEl && document.activeElement !== p1AnsEl) p1AnsEl.value = e.p1Ans || "";
      if (p1PtsEl && document.activeElement !== p1PtsEl)
        p1PtsEl.value = e.p1Pts !== undefined && e.p1Pts !== "" ? String(e.p1Pts) : "";
      if (p2AnsEl && document.activeElement !== p2AnsEl) p2AnsEl.value = e.p2Ans || "";
      if (p2PtsEl && document.activeElement !== p2PtsEl)
        p2PtsEl.value = e.p2Pts !== undefined && e.p2Pts !== "" ? String(e.p2Pts) : "";
    });
  }

  function renderBuzzerView(roomState, activeRole) {
    renderBranding(roomState);
    const myTeam = activeRole === "buzzer1" ? 1 : 2;
    const myName = myTeam === 1 ? roomState.team1Name : roomState.team2Name;
    const round = Feud.getRoundData(roomState, roomState.roundIdx);

    document.getElementById("buzzerTeamLabel").textContent = `Team ${myTeam} Podium Buzzer`;
    document.getElementById("buzzerTeamTitle").textContent = myName;
    document.getElementById("buzzerRoundPrompt").textContent = roomState.questionRevealed
      ? round.prompt
      : "🔒 Waiting for Host to Reveal Question…";

    document.getElementById("buzzFootT1Name").textContent = roomState.team1Name;
    document.getElementById("buzzFootT1Score").textContent = String(roomState.team1Score || 0);
    document.getElementById("buzzFootT2Name").textContent = roomState.team2Name;
    document.getElementById("buzzFootT2Score").textContent = String(roomState.team2Score || 0);

    const btn = document.getElementById("giantBuzzerBtn");
    const icon = document.getElementById("giantBuzzIcon");
    const text = document.getElementById("giantBuzzText");
    const sub = document.getElementById("giantBuzzSub");

    btn.className = `giant-buzzer-btn ${myTeam === 1 ? "team-1-theme" : "team-2-theme"}`;

    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    const canBuzz = Feud.buildBuzzPatch ? Boolean(Feud.buildBuzzPatch(roomState, myTeam)) : roomState.buzzerWinner === 0;
    const otherTeam = myTeam === 1 ? 2 : 1;
    const otherName = otherTeam === 1 ? roomState.team1Name : roomState.team2Name;

    if (canBuzz && roomState.buzzerArmedTeam === myTeam) {
      // Re-armed after the opponent's Face-Off miss / non-#1 answer
      btn.disabled = false;
      icon.textContent = "⚡";
      text.textContent = "YOUR TURN — BUZZ!";
      sub.textContent = "Opponent missed — tap to lock in your answer";
    } else if (canBuzz) {
      btn.disabled = false;
      icon.textContent = "🔔";
      text.textContent = "BUZZ IN!";
      sub.textContent = "Tap anywhere on this pad first";
    } else if (roomState.buzzerWinner === myTeam) {
      btn.disabled = true;
      btn.classList.add("won-state");
      icon.textContent = "🚨";
      text.textContent = String(phase).startsWith("faceoff") ? "YOU BUZZED FIRST!" : "YOUR TEAM HAS IT!";
      sub.textContent = "Give your answer to the Host!";
    } else if (roomState.buzzerWinner === otherTeam) {
      btn.disabled = true;
      btn.classList.add("locked-out-state");
      icon.textContent = "🔒";
      text.textContent = "LOCKED OUT";
      sub.textContent = `${otherName} buzzed in first`;
    } else if (roomState.buzzerArmedTeam === otherTeam) {
      btn.disabled = true;
      btn.classList.add("locked-out-state");
      icon.textContent = "⏳";
      text.textContent = "OPPONENT'S TURN";
      sub.textContent = `${otherName} is answering the Face-Off`;
    } else if (!roomState.questionRevealed || phase === "faceoff-ready") {
      btn.disabled = true;
      btn.classList.add("locked-out-state");
      icon.textContent = "⏳";
      text.textContent = "GET READY…";
      sub.textContent = "Buzzer unlocks when the Host reveals the question";
    } else {
      btn.disabled = true;
      btn.classList.add("locked-out-state");
      icon.textContent = "🔒";
      text.textContent = "BUZZERS LOCKED";
      sub.textContent = "Face-Off decided — watch the TV!";
    }
  }

  Object.assign(Feud, {
    escapeHtml,
    showToast,
    showBigRedXOverlay,
    renderBranding,
    renderTurnTimerUI,
    populateRoundDropdowns,
    renderTvView,
    renderHostView,
    renderBuzzerView
  });
})(window.Feud);
