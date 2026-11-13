// =====================================================================
// STATE MANAGEMENT, MATCH SLICER & LOCALSTORAGE PERSISTENCE (js/state.js)
// Persists custom survey questions, imported CSV/JSON decks,
// multi-game played-round history (so 4-5 games at one party never repeat
// questions or Fast Money sets), custom Game Title & Icon, and room state.
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  const STORAGE_CUSTOM_ROUNDS_KEY = "party_feud_custom_rounds_v1";
  const STORAGE_CUSTOM_DECK_KEY = "party_feud_custom_deck_v1";
  const STORAGE_GAME_TITLE_KEY = "party_feud_game_title_v1";
  const STORAGE_GAME_ICON_KEY = "party_feud_game_icon_v1";
  const STORAGE_PLAYED_HISTORY_KEY = "party_feud_played_history_v1";
  const STORAGE_ROOM_PREFIX = "party_feud_room_state_";
  const STORAGE_LAST_SESSION_KEY = "party_feud_last_session_v1";

  function loadSavedCustomRounds() {
    try {
      const raw = localStorage.getItem(STORAGE_CUSTOM_ROUNDS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveCustomRounds(customRounds) {
    try {
      localStorage.setItem(STORAGE_CUSTOM_ROUNDS_KEY, JSON.stringify(customRounds || {}));
    } catch (e) {}
  }

  function loadSavedCustomDeck() {
    try {
      const raw = localStorage.getItem(STORAGE_CUSTOM_DECK_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && Array.isArray(parsed.rounds) && parsed.rounds.length > 0 ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function saveCustomDeck(deck) {
    try {
      if (!deck) {
        localStorage.removeItem(STORAGE_CUSTOM_DECK_KEY);
      } else {
        localStorage.setItem(STORAGE_CUSTOM_DECK_KEY, JSON.stringify(deck));
      }
    } catch (e) {}
  }

  function loadSavedGameTitle() {
    try {
      return (
        localStorage.getItem(STORAGE_GAME_TITLE_KEY) ||
        (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameTitle) ||
        "Party Feud"
      );
    } catch (e) {
      return "Party Feud";
    }
  }

  function saveGameTitle(title) {
    try {
      if (!title) localStorage.removeItem(STORAGE_GAME_TITLE_KEY);
      else localStorage.setItem(STORAGE_GAME_TITLE_KEY, String(title).trim());
    } catch (e) {}
  }

  function loadSavedGameIcon() {
    try {
      return (
        localStorage.getItem(STORAGE_GAME_ICON_KEY) ||
        (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameIcon) ||
        "🎉"
      );
    } catch (e) {
      return "🎉";
    }
  }

  function saveGameIcon(icon) {
    try {
      if (!icon) localStorage.removeItem(STORAGE_GAME_ICON_KEY);
      else localStorage.setItem(STORAGE_GAME_ICON_KEY, String(icon).trim());
    } catch (e) {}
  }

  // =====================================================================
  // MULTI-GAME PLAYED HISTORY TRACKER (ENSURES ROUNDS DON'T REPEAT)
  // =====================================================================
  function loadAllPlayedHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_PLAYED_HISTORY_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveAllPlayedHistory(map) {
    try {
      localStorage.setItem(STORAGE_PLAYED_HISTORY_KEY, JSON.stringify(map || {}));
    } catch (e) {}
  }

  function getDeckKey(roomState) {
    if (roomState && roomState.customDeck && roomState.customDeck.name) {
      return String(roomState.customDeck.name).trim();
    }
    return (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.deckName) || "Starter Party Deck";
  }

  function getSourceRoundsList(roomState) {
    if (
      roomState &&
      roomState.customDeck &&
      Array.isArray(roomState.customDeck.rounds) &&
      roomState.customDeck.rounds.length > 0
    ) {
      return roomState.customDeck.rounds;
    }
    return Feud.DEFAULT_ROUNDS;
  }

  function getSourceFastMoneyList(roomState) {
    if (
      roomState &&
      roomState.customDeck &&
      Array.isArray(roomState.customDeck.fastMoney) &&
      roomState.customDeck.fastMoney.length > 0
    ) {
      return roomState.customDeck.fastMoney;
    }
    return Feud.FAST_MONEY_QUESTIONS;
  }

  function getDeckPlayStats(roomState) {
    const deckKey = getDeckKey(roomState);
    const sourceRounds = getSourceRoundsList(roomState);
    const totalRounds = sourceRounds.length;
    const allHist = loadAllPlayedHistory();
    const entry = allHist[deckKey] || { playedRounds: [], playedFmSets: [], matchNumber: 0 };
    const validPlayed = (entry.playedRounds || []).filter(
      (idx) => Number.isInteger(idx) && idx >= 0 && idx < totalRounds
    );
    const uniquePlayed = Array.from(new Set(validPlayed));
    return {
      deckKey,
      totalRounds,
      usedRoundsCount: uniquePlayed.length,
      remainingRoundsCount: Math.max(0, totalRounds - uniquePlayed.length),
      playedRounds: uniquePlayed,
      playedFmSets: Array.isArray(entry.playedFmSets) ? entry.playedFmSets : [],
      matchNumber: Number(entry.matchNumber) || 0
    };
  }

  function resetDeckPlayedHistory(roomState) {
    const deckKey = getDeckKey(roomState);
    const allHist = loadAllPlayedHistory();
    delete allHist[deckKey];
    saveAllPlayedHistory(allHist);
  }

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function getEscalatingMultipliers(count) {
    if (count === 4) return [1, 1, 2, 3];
    if (count === 5) return [1, 1, 2, 2, 3];
    if (count === 6) return [1, 1, 2, 2, 3, 3];
    if (count === 3) return [1, 2, 3];
    return null;
  }

  function buildMatchSlice(roomState, options = {}) {
    const roundsPerMatch =
      options.roundsPerMatch !== undefined
        ? Number(options.roundsPerMatch)
        : Number(roomState.roundsPerMatch) || 0;
    const roundOrder = options.roundOrder || roomState.roundOrder || "sequential";
    const deckKey = getDeckKey(roomState);
    const sourceRounds = getSourceRoundsList(roomState);
    const sourceFm = getSourceFastMoneyList(roomState);
    const stats = getDeckPlayStats(roomState);
    const playedSet = new Set(stats.playedRounds);

    // Separate regular rounds from Sudden-Death Tie-Breakers
    const regularIndices = [];
    const tieBreakerIndices = [];
    sourceRounds.forEach((r, idx) => {
      const isTie =
        /tie-?breaker|sudden\s*death/i.test(r.title || "") ||
        /tie-?breaker|sudden\s*death/i.test(r.theme || "");
      if (isTie) tieBreakerIndices.push(idx);
      else regularIndices.push(idx);
    });

    const poolIndices = regularIndices.length > 0 ? regularIndices : sourceRounds.map((_, i) => i);

    let chosenIndices = [];
    if (!roundsPerMatch || roundsPerMatch <= 0 || roundsPerMatch >= sourceRounds.length) {
      // Use all rounds
      const allIdxs = sourceRounds.map((_, i) => i);
      chosenIndices = roundOrder === "shuffle" ? shuffleArray(allIdxs) : allIdxs;
    } else {
      let unplayedPool = poolIndices.filter((i) => !playedSet.has(i));
      // If not enough unplayed rounds remain for a full match, take what's left and wrap around!
      if (unplayedPool.length < roundsPerMatch) {
        const freshPool = poolIndices.filter((i) => !unplayedPool.includes(i));
        const orderedFresh = roundOrder === "shuffle" ? shuffleArray(freshPool) : freshPool;
        unplayedPool = unplayedPool.concat(orderedFresh);
        playedSet.clear();
      } else if (roundOrder === "shuffle") {
        unplayedPool = shuffleArray(unplayedPool);
      }

      chosenIndices = unplayedPool.slice(0, roundsPerMatch);
    }

    // Build matchRounds with escalating multipliers (1x, 1x, 2x, 3x)
    const multSchedule = getEscalatingMultipliers(chosenIndices.length);
    const matchRounds = chosenIndices.map((srcIdx, matchPos) => {
      const orig = sourceRounds[srcIdx];
      const mult = multSchedule ? multSchedule[matchPos] : orig.multiplier || 1;
      return {
        ...orig,
        sourceIdx: srcIdx,
        title:
          roundsPerMatch > 0 && roundsPerMatch < sourceRounds.length
            ? `Round ${matchPos + 1} (Deck #${srcIdx + 1})`
            : orig.title || `Round ${matchPos + 1}`,
        multiplier: mult
      };
    });

    // If slicing a match (e.g. 4 rounds) and the deck has tie-breakers, append 1 unplayed Tie-Breaker as a bonus round!
    if (
      roundsPerMatch > 0 &&
      roundsPerMatch < sourceRounds.length &&
      tieBreakerIndices.length > 0
    ) {
      const unplayedTie =
        tieBreakerIndices.find((i) => !playedSet.has(i)) ?? tieBreakerIndices[0];
      const tieRound = sourceRounds[unplayedTie];
      if (tieRound) {
        matchRounds.push({
          ...tieRound,
          sourceIdx: unplayedTie,
          title: `Tie-Breaker (Bonus)`,
          multiplier: tieRound.multiplier || 3
        });
      }
    }

    // Select a 5-question Fast Money set that hasn't been played yet
    const totalFmSets = Math.max(1, Math.floor(sourceFm.length / 5));
    const playedFmSet = new Set(stats.playedFmSets || []);
    let fmSetIdx = 0;
    for (let s = 0; s < totalFmSets; s++) {
      if (!playedFmSet.has(s)) {
        fmSetIdx = s;
        break;
      }
    }
    if (playedFmSet.has(fmSetIdx) && totalFmSets > 1) {
      playedFmSet.clear();
      fmSetIdx = 0;
    }

    let matchFastMoney = sourceFm.slice(fmSetIdx * 5, fmSetIdx * 5 + 5);
    if (matchFastMoney.length === 0) {
      matchFastMoney = sourceFm.slice(0, 5);
    }

    // Save updated played history
    chosenIndices.forEach((i) => playedSet.add(i));
    playedFmSet.add(fmSetIdx);

    const allHist = loadAllPlayedHistory();
    allHist[deckKey] = {
      playedRounds: Array.from(playedSet),
      playedFmSets: Array.from(playedFmSet),
      matchNumber: (stats.matchNumber || 0) + 1
    };
    saveAllPlayedHistory(allHist);

    return {
      matchRounds,
      matchSourceIndices: chosenIndices,
      matchFastMoney,
      activeFmSetIdx: fmSetIdx,
      matchNumber: allHist[deckKey].matchNumber
    };
  }

  function getActiveTeamPresets(roomState) {
    if (
      roomState &&
      roomState.customDeck &&
      Array.isArray(roomState.customDeck.teamPresets) &&
      roomState.customDeck.teamPresets.length > 0
    ) {
      return roomState.customDeck.teamPresets;
    }
    return Feud.TEAM_PRESETS || [["Team A", "Team B"]];
  }

  function createDefaultRoomState(pin = "1234") {
    const customDeck = loadSavedCustomDeck();
    const fmList =
      customDeck && Array.isArray(customDeck.fastMoney) && customDeck.fastMoney.length > 0
        ? customDeck.fastMoney.slice(0, 5)
        : (Feud.FAST_MONEY_QUESTIONS || []).slice(0, 5);

    const presets = getActiveTeamPresets({ customDeck });
    const [defaultT1, defaultT2] = presets[0] || ["Team A", "Team B"];

    return {
      pin: String(pin || "1234"),
      gameTitle: loadSavedGameTitle(),
      gameIcon: loadSavedGameIcon(),
      stage: "main", // 'main' | 'fast' | 'winner'
      enableFastMoney: true,
      roundsPerMatch: 4,
      roundOrder: "sequential",
      matchNumber: 1,
      matchRounds: null,
      matchSourceIndices: null,
      matchFastMoney: fmList,
      activeFmSetIdx: 0,
      roundIdx: 0,
      roundPhase: "faceoff-ready", // 'faceoff-ready' | 'faceoff-buzz' | 'faceoff-p1' | 'faceoff-p2' | 'pass-or-play' | 'playing' | 'steal' | 'round-over'
      questionRevealed: false,
      controllingTeam: 0, // 0 = Face-Off, 1 = Team 1 Playing, 2 = Team 2 Playing
      faceoffFirstTeam: 0,
      faceoffBestRank: 999,
      faceoffWinnerTeam: 0,
      originalPlayingTeam: 0,
      roundWinnerTeam: 0,
      lastOverlayXCount: 1,
      turnTimerDuration: 10,
      turnTimerRemaining: 10,
      turnTimerRunning: false,
      autoStartTimerOnStrike: false,
      timeUpSeq: 0,
      zeroPtsSeq: 0,
      revealed: [],
      pot: 0,
      team1Name: defaultT1,
      team2Name: defaultT2,
      team1Score: 0,
      team2Score: 0,
      strikes: 0,
      strikeSeq: 0,
      fanfareSeq: 0,
      dupBuzzSeq: 0,
      buzzerWinner: 0,
      customDeck: customDeck,
      customRounds: loadSavedCustomRounds(),
      fmClock: 20,
      fmHideP1: false,
      fmEntries: fmList.map(() => ({ p1Ans: "", p1Pts: 0, p2Ans: "", p2Pts: 0 })),
      updatedAt: Date.now()
    };
  }

  function getBaseRoundsList(roomState) {
    if (
      roomState &&
      Array.isArray(roomState.matchRounds) &&
      roomState.matchRounds.length > 0
    ) {
      return roomState.matchRounds;
    }
    return getSourceRoundsList(roomState);
  }

  function getRoundCount(roomState) {
    return getBaseRoundsList(roomState).length;
  }

  function getRoundData(roomState, idx) {
    const list = getBaseRoundsList(roomState);
    const safeIdx = Math.max(0, Math.min(list.length - 1, Number(idx) || 0));
    const base = list[safeIdx] || list[0];
    const customMap = (roomState && roomState.customRounds) || {};
    const customKey =
      base && base.sourceIdx !== undefined ? String(base.sourceIdx) : String(safeIdx);
    const custom = customMap[customKey] || customMap[String(safeIdx)];
    if (!custom) return base;
    return {
      ...base,
      prompt: custom.prompt || base.prompt,
      multiplier: Number(custom.multiplier) || base.multiplier,
      answers:
        Array.isArray(custom.answers) && custom.answers.length > 0 ? custom.answers : base.answers
    };
  }

  function getAllEffectiveRounds(roomState) {
    const sourceList = getSourceRoundsList(roomState);
    const customMap = (roomState && roomState.customRounds) || {};
    return sourceList.map((base, i) => {
      const custom = customMap[String(i)];
      if (!custom) return base;
      return {
        ...base,
        prompt: custom.prompt || base.prompt,
        multiplier: Number(custom.multiplier) || base.multiplier,
        answers:
          Array.isArray(custom.answers) && custom.answers.length > 0 ? custom.answers : base.answers
      };
    });
  }

  function getFastMoneyList(roomState) {
    if (
      roomState &&
      Array.isArray(roomState.matchFastMoney) &&
      roomState.matchFastMoney.length > 0
    ) {
      return roomState.matchFastMoney;
    }
    const src = getSourceFastMoneyList(roomState);
    return src.slice(0, 5);
  }

  function generateRoomCode() {
    const words = Feud.ROOM_WORDS || ["GAME", "PLAY", "QUIZ", "STAR"];
    const base = words[Math.floor(Math.random() * words.length)];
    const rand = Math.floor(10 + Math.random() * 89);
    return (base.slice(0, 2) + String(rand)).toUpperCase();
  }

  function saveRoomStateToStorage(code, state) {
    if (!code) return;
    try {
      localStorage.setItem(STORAGE_ROOM_PREFIX + code.toUpperCase(), JSON.stringify(state));
      if (state.customRounds) {
        saveCustomRounds(state.customRounds);
      }
      if (state.customDeck !== undefined) {
        saveCustomDeck(state.customDeck);
      }
      if (state.gameTitle) {
        saveGameTitle(state.gameTitle);
      }
      if (state.gameIcon) {
        saveGameIcon(state.gameIcon);
      }
    } catch (e) {}
  }

  function loadRoomStateFromStorage(code) {
    if (!code) return null;
    try {
      const raw = localStorage.getItem(STORAGE_ROOM_PREFIX + code.toUpperCase());
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveLastSession(role, code, pin = "") {
    try {
      localStorage.setItem(
        STORAGE_LAST_SESSION_KEY,
        JSON.stringify({ role, code: code.toUpperCase(), pin, ts: Date.now() })
      );
    } catch (e) {}
  }

  function loadLastSession() {
    try {
      const raw = localStorage.getItem(STORAGE_LAST_SESSION_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() - (data.ts || 0) > 12 * 60 * 60 * 1000) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function clearLastSession() {
    try {
      localStorage.removeItem(STORAGE_LAST_SESSION_KEY);
    } catch (e) {}
  }

  Object.assign(Feud, {
    loadSavedCustomRounds,
    saveCustomRounds,
    loadSavedCustomDeck,
    saveCustomDeck,
    loadSavedGameTitle,
    saveGameTitle,
    loadSavedGameIcon,
    saveGameIcon,
    getDeckKey,
    getSourceRoundsList,
    getSourceFastMoneyList,
    getDeckPlayStats,
    resetDeckPlayedHistory,
    buildMatchSlice,
    getActiveTeamPresets,
    createDefaultRoomState,
    getBaseRoundsList,
    getRoundCount,
    getRoundData,
    getAllEffectiveRounds,
    getFastMoneyList,
    generateRoomCode,
    saveRoomStateToStorage,
    loadRoomStateFromStorage,
    saveLastSession,
    loadLastSession,
    clearLastSession
  });
})(window.Feud);
