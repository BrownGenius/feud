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

  function showBeSpecificOverlay() {
    Feud.playBeSpecificBuzz();
    const overlay = document.getElementById("strikeOverlay");
    if (!overlay) return;
    overlay.innerHTML =
      '<div class="be-specific-banner display-font">🔍 BE MORE SPECIFIC!</div>';
    overlay.classList.remove("hidden");
    clearTimeout(window._xTimer);
    window._xTimer = setTimeout(() => {
      overlay.classList.add("hidden");
    }, 1500);
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

    const activeDeckNameText = document.getElementById("activeDeckNameText");
    if (activeDeckNameText) {
      activeDeckNameText.textContent = `${deckName} (${totalDeckRounds} Rds)`;
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
    const phase =
      roomState.roundPhase || (roomState.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    const dur = phase === "steal" ? 30 : Number(roomState.turnTimerDuration) || 10;
    const isUnlimitedBuzzWait =
      phase === "faceoff-ready" ||
      (phase === "faceoff-buzz" && !roomState.turnTimerRunning && !roomState.buzzerWinner);
    const isInactiveTimerPhase =
      isUnlimitedBuzzWait || phase === "pass-or-play" || phase === "round-over";
    const rawRem =
      roomState.turnTimerRemaining !== undefined && roomState.turnTimerRemaining !== null
        ? Number(roomState.turnTimerRemaining)
        : dur;
    const rem = isInactiveTimerPhase && rawRem <= 0 ? dur : rawRem;
    const running = !isInactiveTimerPhase && Boolean(roomState.turnTimerRunning);
    const isExpired = !isInactiveTimerPhase && rem <= 0;
    const isUrgent = running && rem > 0 && rem <= 3;

    const labelText = isUnlimitedBuzzWait ? "READY" : isExpired ? "TIME!" : `${rem}s`;

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
        ? "⏸️ Pause"
        : canResume
        ? "▶️ Resume"
        : "▶️ Start";
    }

    const autoStartOnXCheck = document.getElementById("hostAutoStartOnStrikeCheckbox");
    if (autoStartOnXCheck) {
      autoStartOnXCheck.checked = Boolean(roomState.autoStartTimerOnStrike);
    }
  }

  function populateRoundDropdowns(roomState) {
    const selectors = [
      document.getElementById("hostRoundSelect"),
      document.getElementById("soloRoundSelect")
    ];

    const totalRounds = Feud.getRoundCount(roomState);
    const tieBreakerUnlocked = Feud.isTieBreakerUnlocked
      ? Feud.isTieBreakerUnlocked(roomState)
      : false;

    selectors.forEach((sel) => {
      if (!sel) return;
      sel.innerHTML = "";
      const groups = new Map();
      for (let idx = 0; idx < totalRounds; idx++) {
        const r = Feud.getRoundData(roomState, idx);
        if (
          Feud.isTieBreakerRound &&
          Feud.isTieBreakerRound(r) &&
          !tieBreakerUnlocked &&
          idx !== roomState.roundIdx
        ) {
          continue;
        }
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
    const revSet = new Set(roomState.revealed || []);
    let nextUnrevealedIdx = -1;
    for (let i = 0; i < round.answers.length; i++) {
      if (!revSet.has(i)) {
        nextUnrevealedIdx = i;
        break;
      }
    }
    const remainingUnrevealedCount = Math.max(0, round.answers.length - revSet.size);
    const allRevealed = remainingUnrevealedCount === 0;
    const isTieBreaker = Feud.isTieBreakerRound ? Feud.isTieBreakerRound(round) : false;
    const regCount = Feud.getRegularRoundCount
      ? Feud.getRegularRoundCount(roomState)
      : Feud.getRoundCount(roomState);
    const tieBreakerUnlocked = Feud.isTieBreakerUnlocked
      ? Feud.isTieBreakerUnlocked(roomState)
      : false;
    const isLastRegularRound = !isTieBreaker && roomState.roundIdx + 1 >= regCount;
    const isLastRound = isTieBreaker || (isLastRegularRound && !tieBreakerUnlocked);

    const steps = isTieBreaker
      ? [
          { id: "faceoff", label: "⚡ Sudden-Death Tie-Breaker (First Answer Wins!)" },
          { id: "round-over", label: "🏆 Match Complete" }
        ]
      : [
          { id: "faceoff", label: "1. Face-Off" },
          { id: "pass-or-play", label: "2. Play or Pass" },
          { id: "playing", label: `3. Team Play (${roomState.strikes || 0}/3 X)` },
          { id: "steal", label: "4. Steal (30s)" },
          { id: "round-over", label: "5. Round Complete" }
        ];

    const phaseOrder = isTieBreaker
      ? {
          "faceoff-ready": 0,
          "faceoff-buzz": 0,
          "faceoff-p1": 0,
          "faceoff-p2": 0,
          "pass-or-play": 0,
          playing: 0,
          steal: 0,
          "round-over": 1
        }
      : {
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
    let sayScript = "";
    let doGuide = "";
    let actionsHtml = "";
    const multWord =
      round.multiplier === 1 ? "Single" : round.multiplier === 2 ? "Double" : "Triple";

    if (phase === "faceoff-ready") {
      headline = isTieBreaker
        ? "⚡ Sudden-Death Tie-Breaker: First Correct Answer Wins the Match!"
        : "🔔 Step 1: Ready for the Face-Off";
      sayScript = isTieBreaker
        ? `“We are TIED! Welcome to the Sudden-Death Tie-Breaker! Give me one player from ${t1} and one player from ${t2} at the buzzers—whoever answers this question on the board wins the entire match!”`
        : `“Welcome to ${round.title} (${multWord} Points)! Give me one player from ${t1} and one player from ${t2} at the buzzer podiums—hands ready!”`;
      doGuide = `Click “👁️ Show Question on TV” below (or press Space), then read the survey question out loud. There is NO timer until the first player buzzes in!`;
      subtext = `Unlimited time until the first player buzzes (${round.answers.length} answers on the board).`;
      actionsHtml = `
        <button type="button" class="action-btn btn-gold display-font" onclick="hostRevealQuestionAndStartTimer()">
          👁️ Show Question on TV (Space)
        </button>
        <button type="button" class="top-btn" onclick="hostManualBuzz(1)">🔔 ${escapeHtml(t1)} Buzzed</button>
        <button type="button" class="top-btn" onclick="hostManualBuzz(2)">🔔 ${escapeHtml(t2)} Buzzed</button>
      `;
    } else if (phase === "faceoff-buzz") {
      headline = isTieBreaker
        ? "⚡ Tie-Breaker Live: Waiting for First Buzzer!"
        : "🔔 Face-Off: Waiting for First Buzzer (Unlimited Time)";
      sayScript = isTieBreaker
        ? `“Sudden-Death Tie-Breaker! First team to give a survey answer on the board wins the game! Survey says: ‘${round.prompt}’ — Buzz in!”`
        : `“Top ${round.answers.length} answers are on the board! Survey says: ‘${round.prompt}’ — Buzz in!”`;
      doGuide = `Players have unlimited time until the first person buzzes in on their phone, OR click the button below for whichever team buzzed first (starts their ${dur}s answer timer).`;
      subtext =
        "No timer is running yet — timer starts automatically as soon as the first player buzzes in.";
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
      headline = isTieBreaker
        ? `⚡ Tie-Breaker: ${firstName} Answering for the Win!`
        : `🎤 Face-Off (1st Turn): ${firstName} Answering!`;
      sayScript = `“${firstName}, you buzzed in first! What is your answer for: ‘${round.prompt}’?”`;
      doGuide = isTieBreaker
        ? `If ${firstName}'s answer is on the list below, click it—they immediately WIN the match! If NOT on the list, click “⚡ Wrong Guess (1 Temp X)” to pass the chance to ${secondName}.`
        : `If their answer is on the list below, click it to reveal it and go to Play or Pass. If it's NOT on the list, click “⚡ Face-Off Wrong Guess (1 Temp X)” to pass the Face-Off turn to ${secondName}.`;
      subtext = isTieBreaker
        ? `Sudden-Death Tie-Breaker: any answer on the board immediately wins the match!`
        : `1st Face-Off guess does NOT add a round strike if wrong.`;
      actionsHtml = `
        <button type="button" class="action-btn btn-red display-font" onclick="hostFaceOffWrongGuess()">
          ⚡ Face-Off Wrong Guess (1 Temp X) → ${escapeHtml(secondName)}'s Turn (X)
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

      if (bestRank < 999 && !isTieBreaker) {
        headline = `🎤 Face-Off (2nd Turn): ${secondName} Must Beat Answer #${bestRank + 1}!`;
        sayScript = `“${firstName} is on the board with the #${bestRank + 1} answer! ${secondName}, can you beat #${bestRank + 1} to take control? What's your answer?”`;
        doGuide = `Click ${secondName}'s answer below if it's on the board, or click “⚡ Face-Off Wrong Guess (1 Temp X)” if it's not.`;
        subtext = `${firstName} hit #${bestRank + 1}. Higher rank wins the Face-Off.`;
      } else {
        headline = isTieBreaker
          ? `⚡ Tie-Breaker: ${secondName} Can Win the Match Right Here!`
          : `🎤 Face-Off (2nd Turn): ${secondName} Can Win the Face-Off!`;
        sayScript = isTieBreaker
          ? `“Show me that answer… ❌ Survey says NO! ${secondName}, you can win the ENTIRE MATCH right here if your answer is anywhere on the board: ‘${round.prompt}’!”`
          : `“Show me that answer… ❌ Survey says NO! ${secondName}, you can win the Face-Off right here if your answer is anywhere on the board: ‘${round.prompt}’!”`;
        doGuide = `Click ${secondName}'s answer below if it's on the board, or click “⚡ Face-Off Wrong Guess (1 Temp X)” if they also miss.`;
        subtext = isTieBreaker
          ? `${firstName} missed! Any answer on the board wins the match for ${secondName}.`
          : `${firstName} missed! Any answer on the board wins the Face-Off for ${secondName}.`;
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
      sayScript = `“Show me that answer… 🔔 DING! ${winName}, you won the Face-Off! With ${remainingUnrevealedCount} answer${
        remainingUnrevealedCount === 1 ? "" : "s"
      } left on the board, do you want to PLAY the board or PASS it to ${passName}?”`;
      doGuide = `Ask ${winName} for their choice, then click “▶️ PLAY” or “🔀 PASS” below (or use the Winner buttons if the other team answered).`;
      subtext = `Timer is paused while ${winName} decides whether to Play or Pass.`;
      actionsHtml = `
        <button type="button" class="action-btn btn-gold display-font" onclick="hostChoosePlayOrPass('play')">
          ▶️ PLAY — ${escapeHtml(winName)} Plays Board
        </button>
        <button type="button" class="action-btn btn-blue display-font" onclick="hostChoosePlayOrPass('pass')">
          🔀 PASS — ${escapeHtml(passName)} Plays Board
        </button>
        <button type="button" class="top-btn ${winTeam === 1 ? "gold" : ""}" onclick="hostSetFaceOffWinner(1)">
          Winner: ${escapeHtml(t1)}
        </button>
        <button type="button" class="top-btn ${winTeam === 2 ? "gold" : ""}" onclick="hostSetFaceOffWinner(2)">
          Winner: ${escapeHtml(t2)}
        </button>
      `;
    } else if (phase === "playing") {
      const playTeam = roomState.controllingTeam || roomState.originalPlayingTeam || 1;
      const oppTeam = playTeam === 1 ? 2 : 1;
      const playName = getTeamLabel(roomState, playTeam);
      const oppName = getTeamLabel(roomState, oppTeam);
      const curStrikes = Number(roomState.strikes) || 0;
      headline = `🎯 ${playName} Playing the Board (${curStrikes} of 3 Strikes)`;
      sayScript = `“${playName}, you have ${curStrikes} strike${
        curStrikes === 1 ? "" : "s"
      } and ${roomState.pot || 0} points in the pot! Next player in line: ‘${
        round.prompt
      }’ — what is your answer?”`;
      doGuide = `1) Click “🔄 Start ${dur}s Timer (R)” if you want the countdown running. 2) Click their answer below if right, OR click “❌ Wrong Answer → Strike ${
        curStrikes + 1
      }/3 (X)” if wrong!`;
      subtext = `If ${playName} gets 3 Strikes (XXX), control automatically switches to ${oppName} for the 30s Steal.`;
      actionsHtml = `
        <button type="button" class="action-btn btn-gold display-font" onclick="hostRestartTurnTimer()">
          🔄 Start ${dur}s Timer for Next Player (R)
        </button>
        <button type="button" class="action-btn btn-red display-font" onclick="hostHandleWrongAnswer()">
          ❌ Wrong Answer (+1 Strike → ${curStrikes + 1}/3) (X)
        </button>
      `;
    } else if (phase === "steal") {
      const origTeam =
        roomState.originalPlayingTeam || (roomState.controllingTeam === 1 ? 2 : 1);
      const stealTeam = roomState.controllingTeam || (origTeam === 1 ? 2 : 1);
      const origName = getTeamLabel(roomState, origTeam);
      const stealName = getTeamLabel(roomState, stealTeam);
      headline = `🚨 STEAL MODE: ${stealName} Can Steal ${roomState.pot || 0} Points!`;
      sayScript = `“That's 3 Strikes (XXX)! 🚨 ${stealName}, huddle up! You have 30 seconds and one chance to steal all ${
        roomState.pot || 0
      } points! Team captain, give me your ONE final answer for: ‘${round.prompt}’!”`;
      doGuide = `1) Click “⏱️ Start 30s Steal Timer” while ${stealName} huddles. 2) If their captain's answer is on the board, click that tile below (auto-awards pot to ${stealName})! If not on the board, click “❌ Steal Missed” (auto-awards pot to ${origName})!`;
      subtext = `One guess only (30s timer) for ${stealName} to steal ${roomState.pot || 0} points!`;
      actionsHtml = `
        <button type="button" class="action-btn btn-gold display-font" onclick="hostStartStealTimer()">
          ⏱️ Start 30s Steal Timer (R)
        </button>
        <button type="button" class="action-btn btn-red display-font" onclick="hostHandleWrongAnswer()">
          ❌ Steal Missed → Award Pot to ${escapeHtml(origName)} (X)
        </button>
      `;
    } else if (phase === "round-over") {
      const winTeam = roomState.roundWinnerTeam || roomState.controllingTeam || 1;
      const winName = getTeamLabel(roomState, winTeam);
      headline =
        isLastRegularRound && tieBreakerUnlocked
          ? `⚡ TIE SCORE (${roomState.team1Score || 0} – ${
              roomState.team2Score || 0
            })! Sudden-Death Tie-Breaker Unlocked!`
          : `🎉 Round Complete — ${winName} Won the Round!`;
      if (!allRevealed) {
        sayScript = `“🎉 ${winName} takes the round! Before we move on, let's see the remaining answers on the board — Audience, what was #${
          nextUnrevealedIdx + 1
        }?”`;
        doGuide = `Click “👁️ Reveal Answer #${
          nextUnrevealedIdx + 1
        }” below to flip each unrevealed answer one at a time (${remainingUnrevealedCount} left, 0 pts), then advance to the next round.`;
      } else if (isLastRegularRound && tieBreakerUnlocked) {
        sayScript = `“We have a TIE GAME at ${
          roomState.team1Score || 0
        } points apiece! It's time for the Sudden-Death Tie-Breaker round—whoever answers first wins the match!”`;
        doGuide = `Click “⚡ Start Sudden-Death Tie-Breaker ▶” below!`;
      } else {
        sayScript = `“That clears the board! The score is now ${t1}: ${
          roomState.team1Score || 0
        } points, ${t2}: ${roomState.team2Score || 0} points! Let's move on!”`;
        doGuide = !isLastRound
          ? `Click “⏭️ Next Round ▶” to start Round ${roomState.roundIdx + 2}.`
          : `Click “🏆 Show Winner & Next Match Setup” to crown the match winner!`;
      }
      subtext = allRevealed
        ? "All answers on the board have been revealed!"
        : `${remainingUnrevealedCount} unrevealed answer${
            remainingUnrevealedCount === 1 ? "" : "s"
          } remaining (revealing adds 0 pts).`;
      actionsHtml = `
        ${
          !allRevealed
            ? `<button type="button" class="action-btn btn-gold display-font" onclick="hostRevealNextAnswer()">👁️ Reveal Answer #${
                nextUnrevealedIdx + 1
              } (${remainingUnrevealedCount} Left — No Points)</button>`
            : ""
        }
        ${
          isLastRegularRound && tieBreakerUnlocked
            ? `<button type="button" class="action-btn btn-red display-font" onclick="hostNextRound()">⚡ Start Sudden-Death Tie-Breaker ▶</button>`
            : !isLastRound
            ? `<button type="button" class="action-btn btn-blue display-font" onclick="hostNextRound()">⏭️ Next Round ▶</button>`
            : Boolean(roomState.enableFastMoney)
            ? `<button type="button" class="action-btn btn-gold display-font" onclick="hostSwitchStage('fast')">⚡ Start Fast Money Bonus Round</button>`
            : ""
        }
        <button type="button" class="top-btn gold" onclick="openNextMatchModal()">🏆 Winner &amp; Next Match Setup</button>
      `;
    }

    const headEl = document.getElementById("hostFlowHeadline");
    const scriptEl = document.getElementById("hostFlowScriptBox");
    const subEl = document.getElementById("hostFlowSubtext");
    const inlineBarEl = document.getElementById("hostFaceOffDecisionBar");

    if (headEl) headEl.textContent = headline;
    if (scriptEl) {
      scriptEl.innerHTML = `
        <div class="script-row say-row">
          <span class="script-badge say-badge">🎙️ SAY</span>
          <span class="script-text say-text">${escapeHtml(sayScript)}</span>
        </div>
        <div class="script-row do-row">
          <span class="script-badge do-badge">👉 DO</span>
          <span class="script-text do-text">${escapeHtml(doGuide)}</span>
        </div>
      `;
    }
    if (subEl) subEl.textContent = subtext;

    if (inlineBarEl) {
      if (phase === "pass-or-play") {
        const winTeam = roomState.faceoffWinnerTeam || roomState.controllingTeam || 1;
        const passTeam = winTeam === 1 ? 2 : 1;
        const winName = getTeamLabel(roomState, winTeam);
        const passName = getTeamLabel(roomState, passTeam);
        const canSecondGuess =
          (roomState.revealed || []).length === 1 && (roomState.faceoffBestRank ?? 0) > 0;
        const rankNum = (roomState.faceoffBestRank ?? 0) + 1;

        inlineBarEl.className = "faceoff-decision-bar pass-play-highlight";
        inlineBarEl.innerHTML = `
          <div class="fodb-actions">
            <button type="button" class="action-btn btn-gold display-font" style="flex:1; min-width:190px; min-height:42px; font-size:13px;" onclick="hostChoosePlayOrPass('play')">
              ▶️ PLAY — ${escapeHtml(winName)} Plays
            </button>
            <button type="button" class="action-btn btn-blue display-font" style="flex:1; min-width:190px; min-height:42px; font-size:13px;" onclick="hostChoosePlayOrPass('pass')">
              🔀 PASS — ${escapeHtml(passName)} Plays
            </button>
          </div>
          <div class="fodb-winner-switch" style="justify-content:flex-end;">
            <span style="font-size:11px; color:#fde68a; font-weight:700;">Winner:</span>
            <button type="button" class="top-btn ${winTeam === 1 ? "gold" : ""}" style="min-height:26px; padding:2px 8px; font-size:11px;" onclick="hostSetFaceOffWinner(1)">
              ${escapeHtml(t1)}
            </button>
            <button type="button" class="top-btn ${winTeam === 2 ? "gold" : ""}" style="min-height:26px; padding:2px 8px; font-size:11px;" onclick="hostSetFaceOffWinner(2)">
              ${escapeHtml(t2)}
            </button>
          </div>
          ${
            canSecondGuess
              ? `<div class="fodb-subnote">
                  <span>🎤 Answer #${rankNum} wasn't #1 — if <strong>${escapeHtml(
                  passName
                )}</strong> beats #${rankNum}, click their answer below or tap:</span>
                  <button type="button" class="top-btn" style="background:#991b1b; border-color:#fca5a5; min-height:26px; padding:2px 8px; font-size:11px;" onclick="hostFaceOffWrongGuess()">
                    ⚡ ${escapeHtml(passName)} Wrong (Temp X)
                  </button>
                </div>`
              : ""
          }
        `;
      } else if (phase === "faceoff-ready") {
        inlineBarEl.className = "faceoff-decision-bar";
        inlineBarEl.innerHTML = `<div class="fodb-actions">${actionsHtml}</div>`;
      } else if (String(phase).startsWith("faceoff")) {
        const activeTeam =
          roomState.controllingTeam || roomState.buzzerWinner || roomState.faceoffFirstTeam || 0;
        inlineBarEl.className = "faceoff-decision-bar";
        inlineBarEl.innerHTML = `
          <div class="fodb-actions">
            <button type="button" class="top-btn ${activeTeam === 1 ? "gold" : ""}" style="flex:1; min-width:130px;" onclick="hostSetFaceOffWinner(1)">
              🔔 ${escapeHtml(t1)} ${activeTeam === 1 ? "✓ (Answering)" : "Buzzed"}
            </button>
            <button type="button" class="top-btn ${activeTeam === 2 ? "gold" : ""}" style="flex:1; min-width:130px;" onclick="hostSetFaceOffWinner(2)">
              🔔 ${escapeHtml(t2)} ${activeTeam === 2 ? "✓ (Answering)" : "Buzzed"}
            </button>
          </div>
        `;
      } else if (phase === "steal") {
        inlineBarEl.className = "faceoff-decision-bar steal-highlight";
        inlineBarEl.innerHTML = `
          <div class="fodb-actions">
            <button type="button" class="action-btn btn-gold display-font" style="flex:1; min-width:180px; min-height:40px; font-size:13px;" onclick="hostStartStealTimer()">
              ⏱️ Start 30s Steal Timer (R)
            </button>
          </div>
        `;
      } else if (phase === "round-over") {
        inlineBarEl.className = "faceoff-decision-bar pass-play-highlight";
        inlineBarEl.innerHTML = `<div class="fodb-actions">${actionsHtml}</div>`;
      } else if (phase === "playing") {
        inlineBarEl.className = "faceoff-decision-bar";
        inlineBarEl.innerHTML = `
          <div class="fodb-actions">
            <button type="button" class="action-btn btn-gold display-font" onclick="hostRestartTurnTimer()">
              🔄 Start ${dur}s Timer for Next Player (R)
            </button>
          </div>
        `;
      } else {
        inlineBarEl.className = "faceoff-decision-bar hidden";
        inlineBarEl.innerHTML = "";
      }
    }

    const wrongBarEl = document.getElementById("hostAnswersWrongBar");
    if (wrongBarEl) {
      const specificBtnHtml = `<button type="button" class="action-btn btn-blue display-font host-specific-btn" onclick="hostBeSpecificBuzz()" title="Gentle double-buzz asking the player to be more specific">🔍 Be More Specific</button>`;
      if (phase === "playing") {
        const curStrikes = Number(roomState.strikes) || 0;
        wrongBarEl.className = "host-answers-wrong-bar";
        wrongBarEl.innerHTML = `
          <button type="button" class="action-btn btn-red display-font" onclick="hostHandleWrongAnswer()">
            ❌ Wrong Answer (+1 Strike → ${curStrikes + 1}/3) (X)
          </button>
          ${specificBtnHtml}
        `;
      } else if (phase === "steal") {
        const origTeam =
          roomState.originalPlayingTeam || (roomState.controllingTeam === 1 ? 2 : 1);
        const origName = getTeamLabel(roomState, origTeam);
        wrongBarEl.className = "host-answers-wrong-bar";
        wrongBarEl.innerHTML = `
          <button type="button" class="action-btn btn-red display-font" onclick="hostHandleWrongAnswer()">
            ❌ Steal Missed → ${escapeHtml(origName)} Keeps ${roomState.pot || 0} Pts (X)
          </button>
          ${specificBtnHtml}
        `;
      } else if (String(phase).startsWith("faceoff") && phase !== "faceoff-ready") {
        const activeTeam =
          roomState.controllingTeam || roomState.buzzerWinner || roomState.faceoffFirstTeam || 0;
        if (activeTeam > 0) {
          wrongBarEl.className = "host-answers-wrong-bar";
          wrongBarEl.innerHTML = `
            <button type="button" class="action-btn btn-red display-font" onclick="hostFaceOffWrongGuess()">
              ❌ Wrong Guess
            </button>
            ${specificBtnHtml}
          `;
        } else {
          wrongBarEl.className = "host-answers-wrong-bar hidden";
          wrongBarEl.innerHTML = "";
        }
      } else {
        wrongBarEl.className = "host-answers-wrong-bar hidden";
        wrongBarEl.innerHTML = "";
      }
    }
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

    const strikesBadgeEl = document.getElementById("tvStrikesBadge");
    if (strikesBadgeEl) {
      if (phase === "round-over") {
        strikesBadgeEl.textContent = "🏆 Round Complete";
      } else if (phase === "steal") {
        strikesBadgeEl.textContent = "🚨 Steal Mode (3 / 3 X)";
      } else if (String(phase).startsWith("faceoff") || phase === "pass-or-play") {
        strikesBadgeEl.textContent = "⚡ Face-Off";
      } else {
        strikesBadgeEl.textContent = `Strikes: ${roomState.strikes || 0} / 3`;
      }
    }

    document.getElementById("tvTeam1Name").textContent = roomState.team1Name;
    document.getElementById("tvTeam1Score").textContent = String(roomState.team1Score || 0);
    document.getElementById("tvTeam2Name").textContent = roomState.team2Name;
    document.getElementById("tvTeam2Score").textContent = String(roomState.team2Score || 0);

    const activeWinnerTeam =
      phase === "round-over"
        ? roomState.roundWinnerTeam || roomState.controllingTeam || 0
        : phase === "pass-or-play"
        ? roomState.faceoffWinnerTeam || roomState.controllingTeam || 0
        : String(phase).startsWith("faceoff")
        ? roomState.buzzerWinner || 0
        : 0;
    const activeControllingTeam =
      phase === "round-over"
        ? roomState.roundWinnerTeam || roomState.controllingTeam || 0
        : phase === "pass-or-play"
        ? roomState.faceoffWinnerTeam || roomState.controllingTeam || 0
        : roomState.controllingTeam || 0;
    const isStealPhase = phase === "steal";
    const isPlayingPhase =
      phase === "playing" || phase === "faceoff-p1" || phase === "faceoff-p2";

    const t1Card = document.getElementById("tvTeam1Card");
    const t2Card = document.getElementById("tvTeam2Card");
    const turnTeam = activeControllingTeam || activeWinnerTeam || 0;
    const tvViewEl = document.getElementById("tvView");
    if (tvViewEl) {
      tvViewEl.classList.toggle("tv-turn-team1", turnTeam === 1);
      tvViewEl.classList.toggle("tv-turn-team2", turnTeam === 2);
    }
    t1Card.classList.toggle("tv-team1-pod", true);
    t2Card.classList.toggle("tv-team2-pod", true);
    t1Card.classList.toggle("is-inactive-turn", turnTeam === 2);
    t2Card.classList.toggle("is-inactive-turn", turnTeam === 1);
    t1Card.classList.toggle("winner-glow", activeWinnerTeam === 1);
    t2Card.classList.toggle("winner-glow", activeWinnerTeam === 2);
    t1Card.classList.toggle("playing-glow", isPlayingPhase && activeControllingTeam === 1);
    t2Card.classList.toggle("playing-glow", isPlayingPhase && activeControllingTeam === 2);
    t1Card.classList.toggle("steal-glow", isStealPhase && activeControllingTeam === 1);
    t2Card.classList.toggle("steal-glow", isStealPhase && activeControllingTeam === 2);

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
      t1Ctrl.classList.toggle("hidden", activeControllingTeam !== 1);
      t1Ctrl.classList.toggle("active-control", activeControllingTeam === 1);
    }
    if (t2Ctrl) {
      t2Ctrl.textContent = badgeLabel;
      t2Ctrl.classList.toggle("hidden", activeControllingTeam !== 2);
      t2Ctrl.classList.toggle("active-control", activeControllingTeam === 2);
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

    const regRounds = Feud.getRegularRoundCount
      ? Feud.getRegularRoundCount(roomState)
      : totalRounds;
    const isTieBreaker = Feud.isTieBreakerRound ? Feud.isTieBreakerRound(round) : false;
    document.getElementById("tvRoundCounter").textContent = isTieBreaker
      ? `⚡ ${round.title} (Sudden Death)`
      : `${round.title} (${roomState.roundIdx + 1} of ${regRounds})`;

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
    const unrevealedLeft = Math.max(0, round.answers.length - revSet.size);

    if (phase === "round-over") {
      const winName = getTeamLabel(
        roomState,
        roomState.roundWinnerTeam || roomState.controllingTeam || 1
      );
      buzzBanner.textContent =
        unrevealedLeft > 0
          ? `🏆 ${winName} Wins the Round! • ${unrevealedLeft} Survey Answer${
              unrevealedLeft === 1 ? "" : "s"
            } Left`
          : `🏆 ${winName} Wins the Round!`;
      buzzBanner.classList.add("active");
    } else if (phase === "steal") {
      const stealTeamName = getTeamLabel(
        roomState,
        roomState.controllingTeam ||
          (roomState.originalPlayingTeam === 1 ? 2 : 1)
      );
      buzzBanner.textContent = `🚨 ${stealTeamName}: CHANCE TO STEAL ${roomState.pot || 0} PTS!`;
      buzzBanner.classList.add("steal-alert");
    } else if (phase === "pass-or-play") {
      const winName = getTeamLabel(
        roomState,
        roomState.faceoffWinnerTeam || roomState.controllingTeam || 1
      );
      buzzBanner.textContent = `🏆 ${winName} Won the Face-Off — Play or Pass?`;
      buzzBanner.classList.add("active");
    } else if (phase === "playing" && roomState.controllingTeam) {
      // Active team card already displays the glowing control badge; keep banner minimal
      buzzBanner.textContent = `Strikes: ${roomState.strikes || 0} / 3`;
    } else if (phase === "faceoff-p2" && roomState.controllingTeam) {
      const p2Name = getTeamLabel(roomState, roomState.controllingTeam);
      const bestRank = roomState.faceoffBestRank ?? 999;
      buzzBanner.textContent =
        bestRank < 999
          ? `⚡ Face-Off: ${p2Name} Can Steal Control by Beating Answer #${bestRank + 1}!`
          : `🎤 Face-Off: ${p2Name}'s Turn to Answer!`;
      buzzBanner.classList.add("active");
    } else if (phase === "faceoff-p1" && (roomState.controllingTeam || roomState.buzzerWinner)) {
      const p1Name = getTeamLabel(roomState, roomState.controllingTeam || roomState.buzzerWinner);
      buzzBanner.textContent = `🚨 ${p1Name} Buzzed In First!`;
      buzzBanner.classList.add("active");
    } else if (roomState.buzzerWinner === 1) {
      buzzBanner.textContent = `🚨 ${roomState.team1Name} Buzzed In First!`;
      buzzBanner.classList.add("active");
    } else if (roomState.buzzerWinner === 2) {
      buzzBanner.textContent = `🚨 ${roomState.team2Name} Buzzed In First!`;
      buzzBanner.classList.add("active");
    } else {
      buzzBanner.textContent = roomState.questionRevealed
        ? "🔔 Face-Off: Buzz In Now!"
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
      fmTab.classList.toggle("hidden", !roomState.enableFastMoney);
      fmTab.classList.toggle("gold", roomState.stage === "fast");
    }
    document.getElementById("hostTabMain").classList.toggle("gold", roomState.stage === "main");

    const coachCard = document.getElementById("hostFlowCoachCard");
    if (coachCard) {
      coachCard.classList.toggle("hidden", roomState.stage === "fast");
    }

    if (roomState.stage === "fast") {
      document.getElementById("hostMainControls").classList.add("hidden");
      document.getElementById("hostFmControls").classList.remove("hidden");
      renderHostFastMoney(roomState, handlers);
      return;
    } else {
      document.getElementById("hostMainControls").classList.remove("hidden");
      document.getElementById("hostFmControls").classList.add("hidden");
    }

    document.getElementById("hostPromptText").textContent = round.prompt;

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

    // Match the TV screen's column-major layout (1..half in left col, half+1..N in right col)
    const halfCount = Math.ceil(Math.max(6, round.answers.length) / 2);
    const colL = document.createElement("div");
    colL.className = "host-answer-col";
    colL.style.setProperty("--rows-per-col", String(halfCount));
    const colR = document.createElement("div");
    colR.className = "host-answer-col";
    colR.style.setProperty("--rows-per-col", String(halfCount));

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
      (idx < halfCount ? colL : colR).appendChild(btn);
    });

    list.appendChild(colL);
    if (colR.children.length > 0) list.appendChild(colR);

    const revRemBtn = document.getElementById("hostBtnRevealRemaining");
    if (revRemBtn) {
      let nextIdx = -1;
      for (let i = 0; i < round.answers.length; i++) {
        if (!revSet.has(i)) {
          nextIdx = i;
          break;
        }
      }
      const remCount = Math.max(0, round.answers.length - revSet.size);
      revRemBtn.disabled = remCount === 0;
      revRemBtn.textContent =
        remCount > 0
          ? `👁️ Reveal Answer #${nextIdx + 1} (${remCount} Left • 0 pts)`
          : "✅ All Answers Revealed";
    }

    // Phase-aware strike controls: disable round strikes during Face-Off / Round Over
    const isFaceOff = String(phase).startsWith("faceoff");
    const strikeRow = document.getElementById("hostRoundStrikeRow");
    if (strikeRow) {
      strikeRow.querySelectorAll("button.action-btn").forEach((b) => {
        b.disabled = isFaceOff || isRoundOver;
      });
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

    const fmScriptEl = document.getElementById("hostFmScriptBox");
    if (fmScriptEl) {
      const p1Done = entries.some((e) => e && (e.p1Ans || Number(e.p1Pts) > 0));
      const p2Done = entries.some((e) => e && (e.p2Ans || Number(e.p2Pts) > 0));
      let fmSay = "";
      let fmDo = "";
      if (total >= 200) {
        fmSay = `“🎉 ${total} POINTS! You broke 200 points and won Fast Money!”`;
        fmDo = `Celebrate the victory, then click “🏁 End Match / Next Game” in the top bar!`;
      } else if (!p1Done) {
        fmSay = `“Welcome to Fast Money! Player 2, head backstage or cover your ears so you can't hear Player 1's answers! Player 1, you have 20 seconds to answer 5 survey questions—if you get stuck, say ‘Pass’!”`;
        fmDo = `1) Click “20s” then “Start” when you begin reading Question #1. 2) Tap the matching answer chips below (or type their answer & points) to reveal them on the TV.`;
      } else if (!roomState.fmHideP1 && !p2Done) {
        fmSay = `“Great job Player 1! Before we bring Player 2 back out, let's hide Player 1's answers on the TV!”`;
        fmDo = `Click “🙈 Hide/Show P1” above so Player 2 can't see Player 1's answers, then set the clock to “25s” for Player 2!`;
      } else {
        fmSay = `“Welcome back Player 2! You have 25 seconds to answer the same 5 questions. You cannot repeat any of Player 1's answers—if you hear the duplicate buzzer, give me another answer immediately! Together you need 200 points!”`;
        fmDo = `Click “25s” then “Start”. If Player 2 repeats an answer from Player 1, click “Dup ❌” and ask for a different answer! Then tap the chips for Player 2's answers.`;
      }
      fmScriptEl.innerHTML = `
        <div class="script-row say-row">
          <span class="script-badge say-badge">🎙️ SAY</span>
          <span class="script-text say-text">${escapeHtml(fmSay)}</span>
        </div>
        <div class="script-row do-row">
          <span class="script-badge do-badge">👉 DO</span>
          <span class="script-text do-text">${escapeHtml(fmDo)}</span>
        </div>
      `;
    }

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

    // Buzzers are only live at the start of each Face-Off. Afterwards, show who buzzed first
    // (faceoffFirstTeam) until the next round's Face-Off begins.
    const firstBuzzTeam =
      roomState.buzzerWinner && String(phase).startsWith("faceoff")
        ? roomState.buzzerWinner
        : roomState.faceoffFirstTeam || 0;
    const isFaceOffUnderway = String(phase).startsWith("faceoff") && phase !== "faceoff-ready" && phase !== "faceoff-buzz";

    if (canBuzz) {
      btn.disabled = false;
      icon.textContent = "🔔";
      text.textContent = "BUZZ IN!";
      sub.textContent = "Tap anywhere on this pad first";
    } else if (!roomState.questionRevealed || phase === "faceoff-ready") {
      btn.disabled = true;
      btn.classList.add("locked-out-state");
      icon.textContent = "⏳";
      text.textContent = "GET READY…";
      sub.textContent = "Buzzer unlocks when the Host shows the Face-Off question";
    } else if (isFaceOffUnderway && firstBuzzTeam === myTeam) {
      btn.disabled = true;
      btn.classList.add("won-state");
      icon.textContent = "🚨";
      text.textContent = "YOU BUZZED FIRST!";
      sub.textContent = "Give your answer to the Host!";
    } else if (isFaceOffUnderway && firstBuzzTeam === otherTeam) {
      btn.disabled = true;
      btn.classList.add("locked-out-state");
      icon.textContent = "🔒";
      text.textContent = "LOCKED OUT";
      sub.textContent = `${otherName} buzzed in first`;
    } else {
      btn.disabled = true;
      btn.classList.add("locked-out-state");
      icon.textContent = "🔒";
      text.textContent = "BUZZERS LOCKED";
      sub.textContent = "Buzzers re-open at the next round's Face-Off — watch the TV!";
    }
  }

  Object.assign(Feud, {
    escapeHtml,
    showToast,
    showBigRedXOverlay,
    showBeSpecificOverlay,
    renderBranding,
    renderTurnTimerUI,
    populateRoundDropdowns,
    renderTvView,
    renderHostView,
    renderBuzzerView
  });
})(window.Feud);
