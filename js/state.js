// =====================================================================
// STATE MANAGEMENT, MATCH SLICER & LOCALSTORAGE PERSISTENCE (js/state.js)
// Persists custom survey questions, imported JSON decks,
// multi-game played-round history (so 4-5 games at one party never repeat
// questions or Fast Money sets), custom Game Title & Icon, and room state.
// =====================================================================

window.Feud = window.Feud || {};

window.Feud.DEFAULT_DECK = {
  gameTitle: "Party Feud",
  gameIcon: "🎉",
  deckName: "Starter Party Deck",
  teamPresets: [
    ["Team A", "Team B"],
    ["Team Red", "Team Blue"],
    ["Team 1", "Team 2"]
  ],
  roomWords: [
    "GAME", "PLAY", "QUIZ", "STAR", "GOLD",
    "BUZZ", "TEAM", "SHOW", "LIVE", "CLUB"
  ],
  rounds: [
    {
      theme: "🔥 Live Party Poll (Editable!)",
      title: "Round 1",
      multiplier: 1,
      prompt: "Name something people always do right after finishing a huge meal.",
      answers: [
        { text: "Take a nap on the couch", points: 40 },
        { text: "Have coffee or tea", points: 24 },
        { text: "Put on stretchy pants", points: 15 },
        { text: "Eat dessert", points: 10 },
        { text: "Watch sports or a movie", points: 6 },
        { text: "Go for a walk", points: 5 }
      ]
    },
    {
      theme: "🔥 Live Party Poll (Editable!)",
      title: "Round 2",
      multiplier: 1,
      prompt: "What is one item you will NEVER travel on an airplane without?",
      answers: [
        { text: "Headphones / Earbuds", points: 36 },
        { text: "Phone charger / Power bank", points: 24 },
        { text: "Snacks", points: 16 },
        { text: "Sweater / Jacket", points: 12 },
        { text: "Water bottle", points: 7 },
        { text: "Neck pillow", points: 5 }
      ]
    },
    {
      theme: "🎉 Everyday Life & Trivia",
      title: "Round 3",
      multiplier: 1,
      prompt: "Name a reason someone might be running 30 minutes late to a party.",
      answers: [
        { text: "Stuck in traffic / Parking", points: 38 },
        { text: "Couldn't decide what to wear", points: 25 },
        { text: "Stopped to pick up food or drinks", points: 16 },
        { text: "Lost track of time", points: 12 },
        { text: "Waiting on spouse or kids", points: 9 }
      ]
    },
    {
      theme: "🎉 Everyday Life & Trivia",
      title: "Round 4",
      multiplier: 2,
      prompt: "Name something people spend way too much money on every week.",
      answers: [
        { text: "Iced coffee / Specialty drinks", points: 38 },
        { text: "Food delivery apps", points: 26 },
        { text: "Streaming subscriptions", points: 16 },
        { text: "Rideshares / Gas", points: 12 },
        { text: "Impulse online shopping", points: 8 }
      ]
    },
    {
      theme: "🎉 Everyday Life & Trivia",
      title: "Round 5",
      multiplier: 2,
      prompt: "Name something that always happens on a long road trip.",
      answers: [
        { text: "Eating all the snacks in the first hour", points: 36 },
        { text: "Arguing over the music playlist", points: 25 },
        { text: "Missing a highway exit", points: 18 },
        { text: "Unplanned restroom stops", points: 13 },
        { text: "Passengers falling asleep", points: 8 }
      ]
    },
    {
      theme: "⚡ Sudden-Death Tie-Breaker (#1 Answer Only)",
      title: "Tie-Breaker",
      multiplier: 3,
      prompt: "SUDDEN DEATH (#1 Answer Only): Name the first thing people check the moment they wake up.",
      answers: [
        { text: "Their smartphone / notifications!", points: 100 }
      ]
    }
  ],
  fastMoney: [
    {
      prompt: "Name a pizza topping almost everyone can agree on.",
      hint: "Cheese (42), Pepperoni (30), Mushrooms (14), Olives (8), Peppers (6)"
    },
    {
      prompt: "Name something people save and reuse instead of throwing away.",
      hint: "Plastic containers (45), Grocery bags (25), Glass jars (15), Gift bags (10), Foil (5)"
    },
    {
      prompt: "Name a popular board or card game played at game nights.",
      hint: "Uno (38), Monopoly (26), Catan (16), Codenames (12), Scrabble (8)"
    },
    {
      prompt: "Name a city people always want to visit on vacation.",
      hint: "New York (35), Paris (26), Tokyo (18), London (12), Rome (9)"
    },
    {
      prompt: "Name something you hear on the TV in a living room on weekends.",
      hint: "Live sports (42), Movies (26), News (16), Video games (10), Music (6)"
    }
  ]
};

window.Feud.DEFAULT_ROUNDS = window.Feud.DEFAULT_DECK.rounds;
window.Feud.FAST_MONEY_QUESTIONS = window.Feud.DEFAULT_DECK.fastMoney;
window.Feud.TEAM_PRESETS = window.Feud.DEFAULT_DECK.teamPresets;
window.Feud.ROOM_WORDS = window.Feud.DEFAULT_DECK.roomWords;

(function (Feud) {
  const STORAGE_CUSTOM_ROUNDS_KEY = "party_feud_custom_rounds_v1";
  const STORAGE_CUSTOM_DECK_KEY = "party_feud_custom_deck_v1";
  const STORAGE_GAME_TITLE_KEY = "party_feud_game_title_v1";
  const STORAGE_GAME_ICON_KEY = "party_feud_game_icon_v1";
  const STORAGE_PLAYED_HISTORY_KEY = "party_feud_played_history_v1";
  const STORAGE_ROOM_PREFIX = "party_feud_room_state_";
  const STORAGE_LAST_SESSION_KEY = "party_feud_last_session_v1";
  const BOARD_THEME_KEY = "party_feud_board_theme_v1";
  const BOARD_THEME_CATALOG = [
    { id: "classic", label: "🎭 Classic Blue & Gold", group: "vibes" },
    { id: "classroom", label: "🏫 Classroom Clean", group: "vibes" },
    { id: "frc", label: "🤖 Cyber Neon (FRC)", group: "vibes" },
    { id: "midnight", label: "🥂 Black Tie & Champagne (NYE / Formal)", group: "vibes" },
    { id: "sunset", label: "🌅 Retro Sunset (80s / Summer)", group: "vibes" },
    { id: "holiday", label: "🎄 Evergreen & Crimson (Christmas / Winter)", group: "seasons" },
    { id: "winter", label: "❄️ Winter Frost (Snow / Hanukkah)", group: "seasons" },
    { id: "harvest", label: "🍂 Autumn Harvest (Thanksgiving / Fall)", group: "seasons" },
    { id: "spooky", label: "🎃 Midnight & Pumpkin (Halloween)", group: "seasons" },
    { id: "patriotic", label: "🎆 Red, White & Royal (July 4th / USA)", group: "seasons" },
    { id: "marigold", label: "🪔 Saffron & Royal Plum (Diwali / Bollywood)", group: "seasons" },
    { id: "crimson-gold", label: "🧧 Imperial Red & Gold (Lunar New Year)", group: "seasons" },
    { id: "emerald", label: "🍀 Emerald & Gold (St. Patrick's / Spring)", group: "seasons" },
    { id: "rose", label: "🌹 Velvet Rose (Valentine's / Bridal)", group: "seasons" }
  ];
  const VALID_BOARD_THEMES = new Set(BOARD_THEME_CATALOG.map((t) => t.id));
  const BOARD_THEME_ALIASES = {
    default: "classic",
    blue: "classic",
    gold: "classic",
    holidays: "holiday",
    christmas: "holiday",
    xmas: "holiday",
    thanksgiving: "harvest",
    autumn: "harvest",
    fall: "harvest",
    blizzard: "winter",
    snow: "winter",
    hanukkah: "winter",
    halloween: "spooky",
    pumpkin: "spooky",
    july4: "patriotic",
    july4th: "patriotic",
    usa: "patriotic",
    diwali: "marigold",
    bollywood: "marigold",
    desi: "marigold",
    saffron: "marigold",
    lunar: "crimson-gold",
    cny: "crimson-gold",
    stpatricks: "emerald",
    spring: "emerald",
    lucky: "emerald",
    valentine: "rose",
    valentines: "rose",
    bridal: "rose",
    nye: "midnight",
    formal: "midnight",
    retro: "sunset",
    summer: "sunset",
    arcade: "sunset",
    robotics: "frc",
    neon: "frc",
    "frc-neon": "frc",
    "frc-robotics": "frc",
    "frc-robotics-neon": "frc",
    school: "classroom",
    teacher: "classroom",
    clean: "classroom",
    "classroom-clean": "classroom"
  };

  function normalizeBoardTheme(theme) {
    const raw = String(theme || "").trim().toLowerCase();
    if (!raw) return "";
    if (VALID_BOARD_THEMES.has(raw)) return raw;
    return BOARD_THEME_ALIASES[raw] || "";
  }

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

  function loadSavedBoardTheme() {
    try {
      const clean = normalizeBoardTheme(localStorage.getItem(BOARD_THEME_KEY));
      return clean || "classic";
    } catch (e) {
      return "classic";
    }
  }

  function saveBoardTheme(theme) {
    const clean = normalizeBoardTheme(theme) || "classic";
    try {
      localStorage.setItem(BOARD_THEME_KEY, clean);
    } catch (e) {}
    return clean;
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

  function formatDeckOptionLabel(item) {
    if (!item) return "";
    if (item.builtin === "starter") {
      const rCount = Array.isArray(Feud.DEFAULT_ROUNDS) ? Feud.DEFAULT_ROUNDS.length : 6;
      const fmSets = Array.isArray(Feud.FAST_MONEY_QUESTIONS)
        ? Math.floor(Feud.FAST_MONEY_QUESTIONS.length / 5)
        : 0;
      const base = (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.deckName) || "Starter Party Deck";
      const icon = (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameIcon) || "🎉";
      return fmSets > 0
        ? `${icon} ${base} • ${rCount} Rounds • ${fmSets} Fast Money`
        : `${icon} ${base} • ${rCount} Rounds`;
    }
    if (item.data) {
      const d = item.data;
      const base = d.deckName || item.id.replace(/\.json$/i, "");
      const icon = d.gameIcon ? `${d.gameIcon} ` : "";
      const rCount = Array.isArray(d.rounds) ? d.rounds.length : 0;
      const fmSets = Array.isArray(d.fastMoney) ? Math.floor(d.fastMoney.length / 5) : 0;
      return fmSets > 0
        ? `${icon}${base} • ${rCount} Rounds • ${fmSets} Fast Money`
        : `${icon}${base} • ${rCount} Rounds`;
    }
    if (item.meta) {
      const m = item.meta;
      const base = m.deckName || item.id.replace(/\.json$/i, "");
      const icon = m.gameIcon ? `${m.gameIcon} ` : "";
      const rCount = Number(m.roundsCount) || 0;
      const fmSets = Number(m.fastMoneySets) || 0;
      if (rCount > 0) {
        return fmSets > 0
          ? `${icon}${base} • ${rCount} Rounds • ${fmSets} Fast Money`
          : `${icon}${base} • ${rCount} Rounds`;
      }
      return `${icon}${base}`;
    }
    return item.label || item.id || "";
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
    if (roomState && roomState.customDeck) {
      return Array.isArray(roomState.customDeck.fastMoney)
        ? roomState.customDeck.fastMoney
        : [];
    }
    return Feud.FAST_MONEY_QUESTIONS;
  }

  function hasFastMoneyRounds(roomState) {
    return getSourceFastMoneyList(roomState).length > 0;
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

  function resolveDeckKey(deckKeyOrState) {
    if (typeof deckKeyOrState === "string") return deckKeyOrState.trim();
    return getDeckKey(deckKeyOrState);
  }

  function setRoundUsed(deckKeyOrState, sourceIdx, used) {
    const key = resolveDeckKey(deckKeyOrState);
    const idx = Number(sourceIdx);
    if (!Number.isInteger(idx) || idx < 0) return;
    const allHist = loadAllPlayedHistory();
    const prevEntry = allHist[key] || { playedRounds: [], playedFmSets: [], matchNumber: 0 };
    const set = new Set(
      (Array.isArray(prevEntry.playedRounds) ? prevEntry.playedRounds : [])
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 0)
    );
    if (used) set.add(idx);
    else set.delete(idx);
    allHist[key] = {
      ...prevEntry,
      playedRounds: Array.from(set).sort((a, b) => a - b)
    };
    saveAllPlayedHistory(allHist);
  }

  function setAllRoundsUsed(deckKeyOrState, indices, used) {
    const key = resolveDeckKey(deckKeyOrState);
    const allHist = loadAllPlayedHistory();
    const prevEntry = allHist[key] || { playedRounds: [], playedFmSets: [], matchNumber: 0 };
    const set = new Set(
      (Array.isArray(prevEntry.playedRounds) ? prevEntry.playedRounds : [])
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 0)
    );
    (indices || []).forEach((n) => {
      const idx = Number(n);
      if (!Number.isInteger(idx) || idx < 0) return;
      if (used) set.add(idx);
      else set.delete(idx);
    });
    allHist[key] = {
      ...prevEntry,
      playedRounds: Array.from(set).sort((a, b) => a - b)
    };
    saveAllPlayedHistory(allHist);
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
    const playedSet = new Set([
      ...(stats.playedRounds || []),
      ...(Array.isArray(roomState && roomState.usedRoundIndices) ? roomState.usedRoundIndices : [])
    ]);

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
      // Use all rounds in the deck
      const allIdxs = sourceRounds.map((_, i) => i);
      if (roundOrder === "shuffle-by-level") {
        // Group regular rounds by multiplier (1x, 2x, 3x), shuffle within each level, keep level progression
        const levelsMap = new Map();
        poolIndices.forEach((idx) => {
          const lvl = Number(sourceRounds[idx] && sourceRounds[idx].multiplier) || 1;
          if (!levelsMap.has(lvl)) levelsMap.set(lvl, []);
          levelsMap.get(lvl).push(idx);
        });
        const sortedLevels = Array.from(levelsMap.keys()).sort((a, b) => a - b);
        sortedLevels.forEach((lvl) => {
          chosenIndices.push(...shuffleArray(levelsMap.get(lvl)));
        });
        if (tieBreakerIndices.length > 0 && regularIndices.length > 0) {
          chosenIndices.push(...shuffleArray(tieBreakerIndices));
        }
      } else if (roundOrder === "shuffle") {
        chosenIndices = shuffleArray(allIdxs);
      } else {
        chosenIndices = allIdxs;
      }
    } else if (roundOrder === "shuffle-by-level" || roundOrder === "sequential") {
      // Select rounds matching the match's multiplier schedule (e.g., 1x, 1x, 2x, 3x or 1x, 2x, 3x)
      // while avoiding any previously used rounds in this deck.
      const multSchedule =
        getEscalatingMultipliers(roundsPerMatch) ||
        Array.from({ length: roundsPerMatch }, (_, i) =>
          i === 0 ? 1 : i === roundsPerMatch - 1 ? 3 : 2
        );
      const pickedInThisMatch = new Set();

      for (let slot = 0; slot < roundsPerMatch; slot++) {
        const targetMult = multSchedule[slot];
        const levelPool = poolIndices.filter(
          (idx) =>
            !pickedInThisMatch.has(idx) &&
            (Number(sourceRounds[idx] && sourceRounds[idx].multiplier) || 1) === targetMult
        );

        let available = levelPool.filter((idx) => !playedSet.has(idx));
        if (roundOrder === "shuffle-by-level" && available.length > 1) {
          available = shuffleArray(available);
        }

        let pickedIdx = available.length > 0 ? available[0] : undefined;

        // Fallback if this multiplier level has no unplayed rounds left:
        // first use any unplayed regular round from another level before repeating any played round!
        if (pickedIdx === undefined) {
          let fallbackPool = poolIndices.filter(
            (idx) => !pickedInThisMatch.has(idx) && !playedSet.has(idx)
          );
          if (fallbackPool.length === 0) {
            // Entire regular deck has been played: reset played history (excluding rounds already in this match)
            poolIndices.forEach((idx) => {
              if (!pickedInThisMatch.has(idx)) playedSet.delete(idx);
            });
            let refreshedLevel = levelPool.filter((idx) => !pickedInThisMatch.has(idx));
            if (roundOrder === "shuffle-by-level" && refreshedLevel.length > 1) {
              refreshedLevel = shuffleArray(refreshedLevel);
            }
            fallbackPool =
              refreshedLevel.length > 0
                ? refreshedLevel
                : poolIndices.filter((idx) => !pickedInThisMatch.has(idx));
          }
          if (roundOrder !== "sequential" && fallbackPool.length > 1) {
            fallbackPool = shuffleArray(fallbackPool);
          }
          pickedIdx = fallbackPool[0];
        }

        if (pickedIdx !== undefined) {
          pickedInThisMatch.add(pickedIdx);
          chosenIndices.push(pickedIdx);
        }
      }
    } else {
      // "shuffle" across any level
      let unplayedPool = poolIndices.filter((i) => !playedSet.has(i));
      if (unplayedPool.length < roundsPerMatch) {
        const freshPool = poolIndices.filter((i) => !unplayedPool.includes(i));
        const orderedFresh = shuffleArray(freshPool);
        unplayedPool = unplayedPool.concat(orderedFresh);
        playedSet.clear();
      } else {
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
            ? `Round ${matchPos + 1} (${mult}x • Deck #${srcIdx + 1})`
            : orig.title || `Round ${matchPos + 1}`,
        multiplier: mult
      };
    });

    // If slicing a match (e.g. 4 rounds), append 1 unplayed Tie-Breaker as a reserve round (only used if tied after regular rounds)!
    if (roundsPerMatch > 0 && roundsPerMatch < sourceRounds.length) {
      let tieCandidatePool = tieBreakerIndices;
      if (tieCandidatePool.length === 0) {
        const chosenSet = new Set(chosenIndices);
        tieCandidatePool = poolIndices.filter((i) => !chosenSet.has(i));
      }
      if (tieCandidatePool.length > 0) {
        let unplayedTieCandidates = tieCandidatePool.filter((i) => !playedSet.has(i));
        if (unplayedTieCandidates.length === 0) {
          unplayedTieCandidates = tieCandidatePool.slice();
        }
        if (roundOrder !== "sequential" && unplayedTieCandidates.length > 1) {
          unplayedTieCandidates = shuffleArray(unplayedTieCandidates);
        }
        const unplayedTie = unplayedTieCandidates[0];
        const tieRound = sourceRounds[unplayedTie];
        if (tieRound) {
          matchRounds.push({
            ...tieRound,
            sourceIdx: unplayedTie,
            isTieBreaker: true,
            title: `Sudden-Death Tie-Breaker`,
            multiplier: tieRound.multiplier || 3
          });
        }
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

    // Only mark Fast Money set as dealt; rounds are marked used only once their question is revealed!
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
      usedRoundIndices: Array.from(playedSet),
      matchFastMoney,
      activeFmSetIdx: fmSetIdx,
      matchNumber: allHist[deckKey].matchNumber
    };
  }

  function pickRandomUnplayedRoundForLevel(roomState, roundIdx) {
    const deckKey = getDeckKey(roomState);
    const sourceRounds = getSourceRoundsList(roomState);
    const baseRounds = getBaseRoundsList(roomState);
    const safeIdx = Math.max(0, Math.min(baseRounds.length - 1, Number(roundIdx) || 0));
    const currentRound = baseRounds[safeIdx] || sourceRounds[0];
    if (!currentRound || sourceRounds.length === 0) return null;

    const targetMult = Number(currentRound.multiplier) || 1;
    const isCurrentTieBreaker =
      /tie-?breaker|sudden\s*death/i.test(currentRound.title || "") ||
      /tie-?breaker|sudden\s*death/i.test(currentRound.theme || "");

    const stats = getDeckPlayStats(roomState);
    const playedSet = new Set([
      ...(stats.playedRounds || []),
      ...(Array.isArray(roomState && roomState.usedRoundIndices) ? roomState.usedRoundIndices : [])
    ]);

    // Never pick a round that is already in the current match's active round slots
    const activeMatchSourceSet = new Set(
      baseRounds
        .map((r, i) => (r && r.sourceIdx !== undefined ? r.sourceIdx : i))
        .filter((idx) => Number.isInteger(idx))
    );
    const currentSourceIdx =
      currentRound.sourceIdx !== undefined ? currentRound.sourceIdx : safeIdx;

    const matchingLevelIndices = [];
    sourceRounds.forEach((r, idx) => {
      if (idx === currentSourceIdx) return;
      const isTie =
        /tie-?breaker|sudden\s*death/i.test(r.title || "") ||
        /tie-?breaker|sudden\s*death/i.test(r.theme || "");
      if (isCurrentTieBreaker) {
        if (isTie) matchingLevelIndices.push(idx);
      } else if (!isTie && (Number(r.multiplier) || 1) === targetMult) {
        matchingLevelIndices.push(idx);
      }
    });

    // Prefer candidates not in the current match and not yet played in this game/session
    let candidates = matchingLevelIndices.filter(
      (idx) => !activeMatchSourceSet.has(idx) && !playedSet.has(idx)
    );

    // If all questions at this level have been played across prior matches, wrap around this level's pool
    // while still avoiding questions currently in the active match
    if (candidates.length === 0) {
      const nonActiveSameLevel = matchingLevelIndices.filter(
        (idx) => !activeMatchSourceSet.has(idx)
      );
      if (nonActiveSameLevel.length > 0) {
        nonActiveSameLevel.forEach((idx) => playedSet.delete(idx));
        candidates = nonActiveSameLevel;
      } else if (matchingLevelIndices.length > 0) {
        candidates = matchingLevelIndices;
      }
    }

    if (candidates.length === 0) return null;

    const chosenSourceIdx = shuffleArray(candidates)[0];

    const orig = sourceRounds[chosenSourceIdx];
    const newRoundObj = {
      ...orig,
      sourceIdx: chosenSourceIdx,
      title: isCurrentTieBreaker
        ? `Tie-Breaker (Bonus • Deck #${chosenSourceIdx + 1})`
        : `Round ${safeIdx + 1} (${targetMult}x • Deck #${chosenSourceIdx + 1})`,
      multiplier: targetMult
    };

    const nextMatchRounds = baseRounds.map((r, i) => (i === safeIdx ? newRoundObj : { ...r }));
    const nextMatchSourceIndices = nextMatchRounds.map((r, i) =>
      r.sourceIdx !== undefined ? r.sourceIdx : i
    );

    return {
      newRound: newRoundObj,
      chosenSourceIdx,
      targetMult,
      matchRounds: nextMatchRounds,
      matchSourceIndices: nextMatchSourceIndices,
      usedRoundIndices: Array.from(playedSet)
    };
  }

  function getAllPlayedSourceIndices(roomState) {
    const stats = getDeckPlayStats(roomState);
    return new Set([
      ...(stats.playedRounds || []),
      ...(Array.isArray(roomState && roomState.usedRoundIndices) ? roomState.usedRoundIndices : [])
    ]);
  }

  function selectDeckRoundForSlot(roomState, slotIdx, chosenSourceIdx) {
    const deckKey = getDeckKey(roomState);
    const sourceRounds = getSourceRoundsList(roomState);
    const cleanSourceIdx = Number(chosenSourceIdx);
    if (
      !Number.isInteger(cleanSourceIdx) ||
      cleanSourceIdx < 0 ||
      cleanSourceIdx >= sourceRounds.length
    ) {
      return null;
    }

    const baseRounds = getBaseRoundsList(roomState);
    const safeSlotIdx = Math.max(0, Math.min(baseRounds.length - 1, Number(slotIdx) || 0));
    const currentSlotRound = baseRounds[safeSlotIdx];
    const orig = sourceRounds[cleanSourceIdx];

    const isSlotTieBreaker =
      currentSlotRound &&
      (/tie-?breaker|sudden\s*death/i.test(currentSlotRound.title || "") ||
        /tie-?breaker|sudden\s*death/i.test(currentSlotRound.theme || ""));
    const targetMult = currentSlotRound
      ? Number(currentSlotRound.multiplier) || Number(orig.multiplier) || 1
      : Number(orig.multiplier) || 1;

    const playedSet = getAllPlayedSourceIndices(roomState);

    const newRoundObj = {
      ...orig,
      sourceIdx: cleanSourceIdx,
      title: isSlotTieBreaker
        ? `Tie-Breaker (Bonus • Deck #${cleanSourceIdx + 1})`
        : `Round ${safeSlotIdx + 1} (${targetMult}x • Deck #${cleanSourceIdx + 1})`,
      multiplier: targetMult
    };

    const nextMatchRounds = baseRounds.map((r, i) => (i === safeSlotIdx ? newRoundObj : { ...r }));
    const nextMatchSourceIndices = nextMatchRounds.map((r, i) =>
      r.sourceIdx !== undefined ? r.sourceIdx : i
    );

    return {
      newRound: newRoundObj,
      chosenSourceIdx: cleanSourceIdx,
      slotIdx: safeSlotIdx,
      targetMult,
      matchRounds: nextMatchRounds,
      matchSourceIndices: nextMatchSourceIndices,
      usedRoundIndices: Array.from(playedSet)
    };
  }

  function markCurrentRoundUsed(roomState) {
    if (!roomState) return null;
    const deckKey = getDeckKey(roomState);
    const curRound = getRoundData(roomState, roomState.roundIdx || 0);
    const sourceIdx =
      curRound && curRound.sourceIdx !== undefined
        ? Number(curRound.sourceIdx)
        : Number(roomState.roundIdx || 0);
    const sourceRounds = getSourceRoundsList(roomState);
    if (!Number.isInteger(sourceIdx) || sourceIdx < 0 || sourceIdx >= sourceRounds.length) {
      return null;
    }
    const playedSet = getAllPlayedSourceIndices(roomState);
    if (playedSet.has(sourceIdx)) {
      return null;
    }
    playedSet.add(sourceIdx);
    const allHist = loadAllPlayedHistory();
    const prevEntry = allHist[deckKey] || { playedRounds: [], playedFmSets: [], matchNumber: 1 };
    allHist[deckKey] = {
      ...prevEntry,
      playedRounds: Array.from(playedSet)
    };
    saveAllPlayedHistory(allHist);
    return Array.from(playedSet);
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
      boardTheme: loadSavedBoardTheme(),
      stage: "main", // 'main' | 'fast' | 'winner'
      enableFastMoney: false,
      roundsPerMatch: 4,
      roundOrder: "sequential",
      matchNumber: 1,
      tournament: null,
      isDemoMode: false,
      matchRounds: null,
      matchSourceIndices: null,
      usedRoundIndices: [],
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
      beSpecificSeq: 0,
      testBuzzSeq: 0,
      buzzerWinner: 0,
      buzzerWinnerAt: 0,
      buzzerRunnerUpDeltaMs: 0,
      showTvWelcome: false,
      tvWelcomeInfo: null,
      tvQrOverlay: null,
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

  function isTieBreakerRound(round) {
    if (!round) return false;
    if (round.isTieBreaker === true) return true;
    return (
      /tie-?breaker|sudden\s*death/i.test(round.title || "") ||
      /tie-?breaker|sudden\s*death/i.test(round.theme || "")
    );
  }

  function getRegularRoundCount(roomState) {
    const list = getBaseRoundsList(roomState);
    const regCount = list.filter((r) => !isTieBreakerRound(r)).length;
    return regCount > 0 ? regCount : list.length;
  }

  function getDeckRegularRoundCount(roomState) {
    const sourceRounds = getSourceRoundsList(roomState);
    const regCount = sourceRounds.filter((r) => !isTieBreakerRound(r)).length;
    return regCount > 0 ? regCount : sourceRounds.length;
  }

  function isTieBreakerUnlocked(roomState) {
    if (!roomState) return false;
    const list = getBaseRoundsList(roomState);
    const regCount = getRegularRoundCount(roomState);
    if (regCount >= list.length) return false;
    const curIdx = Number(roomState.roundIdx) || 0;
    if (curIdx >= regCount) return true;
    const s1 = Number(roomState.team1Score) || 0;
    const s2 = Number(roomState.team2Score) || 0;
    return curIdx === regCount - 1 && roomState.roundPhase === "round-over" && s1 === s2;
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

  function createTournamentBracket(teamNames) {
    const clean = (Array.isArray(teamNames) ? teamNames : [])
      .map((n, idx) => String(n || "").trim() || `Team ${idx + 1}`)
      .slice(0, 4);
    if (clean.length < 3) return null;

    if (clean.length === 3) {
      return {
        enabled: true,
        size: 3,
        teams: clean,
        matches: [
          {
            id: "sf1",
            label: "Semifinal",
            t1: clean[0],
            t2: clean[1],
            winner: null,
            s1: 0,
            s2: 0
          },
          {
            id: "final",
            label: "Championship Final",
            t1: null,
            t2: clean[2],
            winner: null,
            s1: 0,
            s2: 0
          }
        ],
        currentMatchIdx: 0,
        champion: null
      };
    }

    return {
      enabled: true,
      size: 4,
      teams: clean,
      matches: [
        {
          id: "sf1",
          label: "Semifinal 1",
          t1: clean[0],
          t2: clean[1],
          winner: null,
          s1: 0,
          s2: 0
        },
        {
          id: "sf2",
          label: "Semifinal 2",
          t1: clean[2],
          t2: clean[3],
          winner: null,
          s1: 0,
          s2: 0
        },
        {
          id: "final",
          label: "Championship Final",
          t1: null,
          t2: null,
          winner: null,
          s1: 0,
          s2: 0
        }
      ],
      currentMatchIdx: 0,
      champion: null
    };
  }

  function getActiveTournamentMatch(tournament) {
    if (!tournament || !tournament.enabled || !Array.isArray(tournament.matches)) return null;
    const idx = Number(tournament.currentMatchIdx) || 0;
    return tournament.matches[idx] || null;
  }

  function recordTournamentMatchResult(tournament, winnerName, s1, s2) {
    if (!tournament || !tournament.enabled || !Array.isArray(tournament.matches)) return tournament;
    const next = {
      ...tournament,
      teams: Array.isArray(tournament.teams) ? [...tournament.teams] : [],
      matches: tournament.matches.map((m) => ({ ...m }))
    };
    const curIdx = Number(next.currentMatchIdx) || 0;
    const curMatch = next.matches[curIdx];
    if (!curMatch || curMatch.winner) return next;

    const cleanWinner = String(winnerName || curMatch.t1 || "Winner").trim();
    curMatch.winner = cleanWinner;
    curMatch.s1 = Number(s1) || 0;
    curMatch.s2 = Number(s2) || 0;

    const finalMatch = next.matches.find((m) => m.id === "final");
    if (curMatch.id === "sf1" && finalMatch) {
      finalMatch.t1 = cleanWinner;
    } else if (curMatch.id === "sf2" && finalMatch) {
      finalMatch.t2 = cleanWinner;
    }

    if (curMatch.id === "final" || curIdx >= next.matches.length - 1) {
      next.champion = cleanWinner;
    } else {
      next.currentMatchIdx = curIdx + 1;
    }
    return next;
  }

  function getRemainingPossiblePoints(roomState) {
    if (!roomState) return 0;
    const regCount = getRegularRoundCount(roomState);
    const curIdx = Number(roomState.roundIdx) || 0;
    let total = 0;
    for (let i = curIdx + 1; i < regCount; i++) {
      const r = getRoundData(roomState, i);
      if (!r || isTieBreakerRound(r)) continue;
      const mult = Number(r.multiplier) || 1;
      const roundPts = (Array.isArray(r.answers) ? r.answers : []).reduce(
        (sum, a) => sum + Math.max(0, Number(a && a.points) || 0),
        0
      );
      total += roundPts * mult;
    }
    return total;
  }

  function getClinchedWinnerInfo(roomState) {
    if (!roomState) {
      return { clinched: false, winnerTeam: 0, lead: 0, maxRemainingPoints: 0, remainingRounds: 0 };
    }
    const curIdx = Number(roomState.roundIdx) || 0;
    const regCount = getRegularRoundCount(roomState);
    const curRound = getRoundData(roomState, curIdx);
    const isTie = isTieBreakerRound(curRound);
    const s1 = Number(roomState.team1Score) || 0;
    const s2 = Number(roomState.team2Score) || 0;
    const lead = Math.abs(s1 - s2);
    const winnerTeam = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;
    const remainingRounds = isTie ? 0 : Math.max(0, regCount - 1 - curIdx);
    const maxRemainingPoints = isTie ? 0 : getRemainingPossiblePoints(roomState);
    const clinched =
      !isTie &&
      !roomState.isDemoMode &&
      winnerTeam !== 0 &&
      remainingRounds > 0 &&
      lead > maxRemainingPoints;

    return { clinched, winnerTeam, lead, maxRemainingPoints, remainingRounds };
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
    BOARD_THEME_CATALOG,
    normalizeBoardTheme,
    loadSavedBoardTheme,
    saveBoardTheme,
    createTournamentBracket,
    getActiveTournamentMatch,
    recordTournamentMatchResult,
    getDeckKey,
    formatDeckOptionLabel,
    getSourceRoundsList,
    getSourceFastMoneyList,
    hasFastMoneyRounds,
    getDeckPlayStats,
    setRoundUsed,
    setAllRoundsUsed,
    getAllPlayedSourceIndices,
    markCurrentRoundUsed,
    resetDeckPlayedHistory,
    buildMatchSlice,
    pickRandomUnplayedRoundForLevel,
    selectDeckRoundForSlot,
    getActiveTeamPresets,
    createDefaultRoomState,
    getBaseRoundsList,
    isTieBreakerRound,
    getRegularRoundCount,
    getDeckRegularRoundCount,
    isTieBreakerUnlocked,
    getRemainingPossiblePoints,
    getClinchedWinnerInfo,
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
