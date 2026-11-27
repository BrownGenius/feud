#!/usr/bin/env node
// =====================================================================
// CORE LOGIC & STATE ENGINE TEST SUITE (scripts/test-core.js)
// Zero-dependency Node test runner that executes js/state.js,
// js/formats.js, js/decks.js, and js/sync.js in a sandboxed VM context
// to verify:
//  1. JSON format parsing & round-trip export (Native, Friendly-Feud, Overrides)
//  2. Built-in deck & all decks/*.json compatibility with Feud.parseFeudJson
//  3. Match Slicer, escalating multipliers (1x -> 2x -> 3x), & non-repeating history
//  4. Sudden-Death Tie-Breaker detection, reserve slot slicing & tie unlock rules
//  5. 3-Team & 4-Team Tournament Bracket creation & championship progression
//  6. Shareable URL #deckData compression / decompression round-trip
//  7. Authoritative Face-Off Buzzer arbitration (buildBuzzPatch first-tap lock)
// =====================================================================

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT_DIR = path.resolve(__dirname, "..");

function createBrowserSandbox() {
  const storageMap = new Map();
  const localStorage = {
    getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
    setItem: (k, v) => storageMap.set(k, String(v)),
    removeItem: (k) => storageMap.delete(k),
    clear: () => storageMap.clear()
  };

  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Date,
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Set,
    Map,
    Promise,
    Error,
    Uint8Array,
    TextEncoder,
    TextDecoder,
    URL,
    URLSearchParams,
    CompressionStream: typeof CompressionStream !== "undefined" ? CompressionStream : undefined,
    DecompressionStream:
      typeof DecompressionStream !== "undefined" ? DecompressionStream : undefined,
    Response: typeof Response !== "undefined" ? Response : undefined,
    btoa: (str) => Buffer.from(str, "binary").toString("base64"),
    atob: (b64) => Buffer.from(b64, "base64").toString("binary"),
    encodeURIComponent,
    decodeURIComponent,
    parseInt,
    parseFloat,
    isNaN,
    localStorage,
    location: {
      protocol: "http:",
      hostname: "localhost",
      pathname: "/",
      search: "",
      hash: ""
    },
    navigator: {
      userAgent: "NodeTestRunner",
      vibrate: () => {}
    },
    document: {
      readyState: "complete",
      addEventListener: () => {},
      getElementById: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} } })
    },
    CustomEvent: function (type, opts) {
      this.type = type;
      this.detail = opts && opts.detail;
    }
  };

  sandbox.window = sandbox;
  sandbox.window.addEventListener = () => {};
  sandbox.window.dispatchEvent = () => {};

  vm.createContext(sandbox);

  const scriptsToLoad = [
    "js/state.js",
    "js/formats.js",
    "js/decks.js",
    "js/sync.js",
    "js/feedback.js"
  ];
  for (const relPath of scriptsToLoad) {
    const fullPath = path.join(ROOT_DIR, relPath);
    const code = fs.readFileSync(fullPath, "utf8");
    vm.runInContext(code, sandbox, { filename: relPath });
  }

  return { sandbox, Feud: sandbox.window.Feud, localStorage };
}

let passed = 0;
let failed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${err && err.stack ? err.stack : err}`);
    failed++;
  }
}

(async function main() {
  console.log("🧪 Running Party Feud Core Logic & State Engine Tests...\n");

  const { Feud, localStorage } = createBrowserSandbox();

  await runTest("1. Default Starter Deck & Room State Initialization", () => {
    localStorage.clear();
    assert.ok(Feud.DEFAULT_DECK, "DEFAULT_DECK should be defined");
    assert.strictEqual(Feud.DEFAULT_ROUNDS.length, 6, "Starter deck should have 6 rounds");
    assert.strictEqual(
      Feud.FAST_MONEY_QUESTIONS.length,
      5,
      "Starter deck should have 5 Fast Money questions"
    );

    const state = Feud.createDefaultRoomState("4321");
    assert.strictEqual(state.pin, "4321");
    assert.strictEqual(state.stage, "main");
    assert.strictEqual(state.roundPhase, "faceoff-ready");
    assert.strictEqual(state.roundsPerMatch, 4);
    assert.strictEqual(Feud.getRegularRoundCount(state), 5, "5 regular rounds + 1 tie-breaker");
  });

  await runTest("2. Universal JSON Parser (Native, Friendly-Feud & Custom Overrides)", () => {
    // A. Friendly-Feud schema
    const friendlyJson = JSON.stringify({
      gameTitle: "Friendly Test",
      rounds: [
        {
          question: "Name a popular pet.",
          multiply: 2,
          answers: [
            { ans: "Dog", pnt: 55 },
            { ans: "Cat", pnt: 35 },
            { ans: "Fish", pnt: 10 }
          ]
        }
      ],
      final_round: [
        {
          question: "Name a fruit.",
          answers: [
            ["Apple", 40],
            ["Banana", 30]
          ]
        }
      ]
    });
    const parsedFF = Feud.parseFeudJson(friendlyJson);
    assert.strictEqual(parsedFF.kind, "deck");
    assert.strictEqual(parsedFF.formatName, "Friendly-Feud JSON");
    assert.strictEqual(parsedFF.rounds.length, 1);
    assert.strictEqual(parsedFF.rounds[0].prompt, "Name a popular pet.");
    assert.strictEqual(parsedFF.rounds[0].multiplier, 2);
    assert.strictEqual(parsedFF.rounds[0].answers[0].text, "Dog");
    assert.strictEqual(parsedFF.rounds[0].answers[0].points, 55);
    assert.strictEqual(parsedFF.fastMoney.length, 1);
    assert.ok(parsedFF.fastMoney[0].hint.includes("Apple (40)"));

    // B. Native Deck schema round-trip export & re-parse
    const state = Feud.createDefaultRoomState("1234");
    const exportedNative = Feud.exportToNativeDeckJson(
      Feud.DEFAULT_ROUNDS,
      Feud.FAST_MONEY_QUESTIONS,
      state
    );
    const reParsedNative = Feud.parseFeudJson(exportedNative);
    assert.strictEqual(reParsedNative.kind, "deck");
    assert.strictEqual(reParsedNative.rounds.length, Feud.DEFAULT_ROUNDS.length);
    assert.strictEqual(reParsedNative.fastMoney.length, Feud.FAST_MONEY_QUESTIONS.length);

    // C. Friendly-Feud export & re-parse
    const exportedFF = Feud.exportToFriendlyFeudJson(
      Feud.DEFAULT_ROUNDS,
      Feud.FAST_MONEY_QUESTIONS
    );
    const reParsedFF = Feud.parseFeudJson(exportedFF);
    assert.strictEqual(reParsedFF.kind, "deck");
    assert.strictEqual(reParsedFF.rounds.length, Feud.DEFAULT_ROUNDS.length);

    // D. Custom Poll Overrides schema
    const overridesJson = JSON.stringify({
      "0": {
        prompt: "Custom round 1 prompt?",
        multiplier: 3,
        answers: [
          { text: "One", points: 60 },
          { text: "Two", points: 40 }
        ]
      }
    });
    const parsedOv = Feud.parseFeudJson(overridesJson);
    assert.strictEqual(parsedOv.kind, "overrides");
    assert.strictEqual(parsedOv.customRounds["0"].multiplier, 3);
  });

  await runTest("3. All Repository decks/*.json Parse Cleanly via Feud.parseDeckFileContent", () => {
    const decksDir = path.join(ROOT_DIR, "decks");
    const files = fs
      .readdirSync(decksDir)
      .filter((f) => f.endsWith(".json") && f.toLowerCase() !== "manifest.json");
    assert.ok(files.length >= 7, "Should find at least 7 deck JSON files");

    for (const file of files) {
      const raw = fs.readFileSync(path.join(decksDir, file), "utf8");
      const parsed = Feud.parseDeckFileContent(file, raw);
      assert.ok(parsed && parsed.kind === "deck", `${file} should parse as a valid deck`);
      assert.ok(parsed.data.rounds.length >= 6, `${file} should have at least 6 rounds`);
      const tags = Feud.getDeckTags(parsed);
      assert.ok(Array.isArray(tags) && tags.length > 0, `${file} should have inferred/explicit tags`);
    }
  });

  await runTest("4. Match Slicer, Escalating Multipliers & Non-Repeating Round History", () => {
    localStorage.clear();
    const raw2026 = fs.readFileSync(path.join(ROOT_DIR, "decks", "2026.json"), "utf8");
    const parsed2026 = Feud.parseDeckFileContent("2026.json", raw2026);

    const state = Feud.createDefaultRoomState("1234");
    state.customDeck = {
      name: parsed2026.data.deckName,
      rounds: parsed2026.data.rounds,
      fastMoney: parsed2026.data.fastMoney
    };

    // Deal a 4-round match
    const slice1 = Feud.buildMatchSlice(state, {
      roundsPerMatch: 4,
      roundOrder: "sequential"
    });
    // 4 regular rounds + 1 reserve tie-breaker = 5 matchRounds
    assert.strictEqual(slice1.matchRounds.length, 5, "4 regular rounds + 1 reserve tie-breaker");
    assert.strictEqual(
      JSON.stringify(slice1.matchRounds.slice(0, 4).map((r) => r.multiplier)),
      JSON.stringify([1, 1, 2, 3]),
      "4-round match should have [1x, 1x, 2x, 3x] escalating multipliers"
    );
    assert.strictEqual(slice1.matchRounds[4].isTieBreaker, true, "5th slot should be reserve tie-breaker");
    assert.strictEqual(slice1.matchFastMoney.length, 5, "Should slice 5 Fast Money questions");

    // Mark the 4 rounds from Match 1 as used
    state.matchRounds = slice1.matchRounds;
    for (let i = 0; i < 4; i++) {
      state.roundIdx = i;
      Feud.markCurrentRoundUsed(state);
    }

    const statsAfterMatch1 = Feud.getDeckPlayStats(state);
    assert.strictEqual(statsAfterMatch1.usedRoundsCount, 4, "4 rounds should be marked used");

    // Deal Match 2 and verify zero overlap with Match 1's regular rounds
    const slice2 = Feud.buildMatchSlice(state, {
      roundsPerMatch: 4,
      roundOrder: "sequential"
    });
    const m1Indices = new Set(slice1.matchSourceIndices);
    const overlap = slice2.matchSourceIndices.filter((idx) => m1Indices.has(idx));
    assert.strictEqual(overlap.length, 0, "Match 2 rounds must not repeat Match 1 used rounds");
    assert.notStrictEqual(
      slice2.activeFmSetIdx,
      slice1.activeFmSetIdx,
      "Match 2 should advance to the next unplayed Fast Money set"
    );
  });

  await runTest("5. Sudden-Death Tie-Breaker Unlock Logic", () => {
    localStorage.clear();
    const state = Feud.createDefaultRoomState("1234");
    const slice = Feud.buildMatchSlice(state, { roundsPerMatch: 4, roundOrder: "sequential" });
    state.matchRounds = slice.matchRounds;

    const regCount = Feud.getRegularRoundCount(state);
    assert.strictEqual(regCount, 4);

    // Final regular round (index 3), round-over, non-tied score -> Tie-Breaker locked
    state.roundIdx = 3;
    state.roundPhase = "round-over";
    state.team1Score = 250;
    state.team2Score = 180;
    assert.strictEqual(
      Feud.isTieBreakerUnlocked(state),
      false,
      "Tie-breaker must remain locked when scores are not tied"
    );

    // Tied score at end of final regular round -> Tie-Breaker unlocked!
    state.team2Score = 250;
    assert.strictEqual(
      Feud.isTieBreakerUnlocked(state),
      true,
      "Tie-breaker must unlock when final regular round ends in a tie"
    );
  });

  await runTest("6. 3-Team & 4-Team Tournament Bracket Progression", () => {
    // 3-Team Bracket
    let br3 = Feud.createTournamentBracket(["Alpha", "Bravo", "Charlie"]);
    assert.strictEqual(br3.size, 3);
    assert.strictEqual(br3.matches.length, 2);
    assert.strictEqual(Feud.getActiveTournamentMatch(br3).id, "sf1");

    br3 = Feud.recordTournamentMatchResult(br3, "Bravo", 120, 240);
    assert.strictEqual(br3.currentMatchIdx, 1);
    assert.strictEqual(br3.matches[1].t1, "Bravo", "Semifinal winner advances to Final t1");
    assert.strictEqual(br3.matches[1].t2, "Charlie");
    assert.strictEqual(br3.champion, null);

    br3 = Feud.recordTournamentMatchResult(br3, "Charlie", 190, 310);
    assert.strictEqual(br3.champion, "Charlie", "Final winner crowned tournament champion");

    // 4-Team Bracket
    let br4 = Feud.createTournamentBracket(["Red", "Blue", "Green", "Gold"]);
    assert.strictEqual(br4.size, 4);
    assert.strictEqual(br4.matches.length, 3);

    br4 = Feud.recordTournamentMatchResult(br4, "Red", 300, 150);
    assert.strictEqual(br4.currentMatchIdx, 1);
    assert.strictEqual(br4.matches[2].t1, "Red");

    br4 = Feud.recordTournamentMatchResult(br4, "Gold", 140, 280);
    assert.strictEqual(br4.currentMatchIdx, 2);
    assert.strictEqual(br4.matches[2].t2, "Gold");

    br4 = Feud.recordTournamentMatchResult(br4, "Red", 350, 290);
    assert.strictEqual(br4.champion, "Red");
  });

  await runTest("7. Shareable #deckData URL Codec Round-Trip", async () => {
    const sampleDeck = {
      gameTitle: "Party Feud",
      gameIcon: "🧪",
      deckName: "Unit Test Share Deck",
      tags: ["family-friendly", "custom"],
      rounds: Feud.DEFAULT_ROUNDS.slice(0, 3),
      fastMoney: Feud.FAST_MONEY_QUESTIONS
    };

    const token = await Feud.encodeDeckForUrlHash(sampleDeck);
    assert.ok(token && (token.startsWith("z.") || token.startsWith("u.")), "Should return encoded token");

    const decoded = await Feud.decodeDeckFromUrlHash(`#deckData=${encodeURIComponent(token)}`);
    assert.ok(decoded && decoded.data, "Should decode #deckData hash");
    assert.strictEqual(decoded.data.deckName, "Unit Test Share Deck");
    assert.strictEqual(decoded.data.gameIcon, "🧪");
    assert.strictEqual(decoded.data.rounds.length, 3);
    assert.strictEqual(decoded.data.fastMoney.length, 5);
  });

  await runTest("8. Authoritative Face-Off Buzzer Arbitration (buildBuzzPatch)", () => {
    assert.strictEqual(typeof Feud.buildBuzzPatch, "function", "buildBuzzPatch should be exported");
    const state = Feud.createDefaultRoomState("1234");
    state.roundPhase = "faceoff-buzz";
    state.questionRevealed = true;
    state.buzzerWinner = 0;

    // Team 2 buzzes first
    const patch1 = Feud.buildBuzzPatch(state, 2);
    assert.ok(patch1, "First buzz in faceoff-buzz should be accepted");
    assert.strictEqual(patch1.buzzerWinner, 2);
    assert.strictEqual(patch1.controllingTeam, 2);
    assert.strictEqual(patch1.roundPhase, "faceoff-p1");

    // Apply patch, then Team 1 tries to buzz 50ms later -> must be rejected!
    const lockedState = { ...state, ...patch1 };
    const patch2 = Feud.buildBuzzPatch(lockedState, 1);
    assert.strictEqual(patch2, null, "Second buzz after lock must be rejected");
  });

  await runTest("9. Printable HTML & Markdown Review Sheet Exporters", () => {
    const state = Feud.createDefaultRoomState("1234");
    const md = Feud.exportToMarkdownReview(Feud.DEFAULT_ROUNDS, Feud.FAST_MONEY_QUESTIONS, state);
    assert.ok(md.includes("# 🎉 Party Feud — Question & Answer Review Sheet"));
    assert.ok(md.includes("Take a nap on the couch"));

    const html = Feud.exportToPrintableHtml(Feud.DEFAULT_ROUNDS, Feud.FAST_MONEY_QUESTIONS, state);
    assert.ok(html.includes("<!DOCTYPE html>"));
    assert.ok(html.includes("Question &amp; Answer Key"));
  });

  await runTest("10. Board Theme Catalog & Holiday Alias Normalization", () => {
    assert.ok(Array.isArray(Feud.BOARD_THEME_CATALOG) && Feud.BOARD_THEME_CATALOG.length === 14);
    assert.strictEqual(Feud.normalizeBoardTheme("thanksgiving"), "harvest");
    assert.strictEqual(Feud.normalizeBoardTheme("christmas"), "holiday");
    assert.strictEqual(Feud.normalizeBoardTheme("halloween"), "spooky");
    assert.strictEqual(Feud.normalizeBoardTheme("july4th"), "patriotic");
    assert.strictEqual(Feud.normalizeBoardTheme("diwali"), "marigold");
    assert.strictEqual(Feud.normalizeBoardTheme("lunar"), "crimson-gold");
    assert.strictEqual(Feud.normalizeBoardTheme("stpatricks"), "emerald");
    assert.strictEqual(Feud.normalizeBoardTheme("valentine"), "rose");
    assert.strictEqual(Feud.saveBoardTheme("thanksgiving"), "harvest");
    assert.strictEqual(Feud.loadSavedBoardTheme(), "harvest");
  });

  await runTest("11. Bug Reporting Diagnostics Sanitization, Auto-Grouping & URL Builders", () => {
    const state = Feud.createDefaultRoomState("9876");
    state.team1Name = "Secret Family Team";
    state.team2Name = "Private Squad";
    state.stage = "main";
    state.roundPhase = "playing";
    state.strikes = 2;
    state.pot = 120;

    Feud.pushErrorEntry("error", "Test MQTT timeout error");
    const diag = Feud.buildBugDiagnostics(state, "host", "GA42");
    const md = Feud.formatDiagnosticsMarkdown(diag);

    assert.strictEqual(diag.role, "host");
    assert.strictEqual(diag.roundPhase, "playing");
    assert.strictEqual(diag.strikes, 2);
    assert.strictEqual(diag.pot, 120);
    assert.ok(!md.includes("9876"), "Diagnostics must NEVER include Host PIN");
    assert.ok(!md.includes("Secret Family Team"), "Diagnostics must NEVER include custom team names");
    assert.ok(md.includes("Test MQTT timeout error"), "Diagnostics should include recent captured errors");

    const sampleIssues = [
      {
        number: 14,
        title: "[Sync / Buzzers] Phone buzzer disconnect on cellular",
        body: "MQTT relay drops\n<!-- feud-votes:4 -->",
        labels: [{ name: "role:buzzer" }],
        reactions: { "+1": 3 }
      },
      {
        number: 22,
        title: "Add dark mode contrast tweak",
        body: "UI request",
        labels: [],
        reactions: { "+1": 1 }
      }
    ];
    assert.strictEqual(Feud.extractCommunityVotes(sampleIssues[0]), 7);
    const similar = Feud.findSimilarIssues(sampleIssues, "Phone buzzer reconnect issue", "Sync / Buzzers", diag);
    assert.strictEqual(similar.length, 1);
    assert.strictEqual(similar[0].issue.number, 14);

    const ghUrl = Feud.buildGitHubIssueUrl({
      title: "Buzzer stuck",
      category: "Sync / Buzzers",
      description: "Repro steps",
      diag
    });
    assert.ok(ghUrl.includes("template=bug-report.yml"));
    assert.ok(ghUrl.includes("Buzzer+stuck") || ghUrl.includes("Buzzer%20stuck"));
  });

  await runTest("12. Clinched Victory Detection & Remaining Possible Points", () => {
    localStorage.clear();
    const state = Feud.createDefaultRoomState("1234");
    const slice = Feud.buildMatchSlice(state, { roundsPerMatch: 4, roundOrder: "sequential" });
    state.matchRounds = slice.matchRounds; // 4 regular rounds (1x, 1x, 2x, 3x) + 1 tie-breaker

    // After Round 3 (index 2), only Round 4 (index 3, 3x = 300 pts max) remains
    state.roundIdx = 2;
    state.team1Score = 250;
    state.team2Score = 0;
    assert.strictEqual(Feud.getRemainingPossiblePoints(state), 300);
    assert.strictEqual(Feud.getClinchedWinnerInfo(state).clinched, false, "250 <= 300 max remaining, not clinched");

    // Equal lead (300 vs 0, 300 left) -> opponent could still tie to force Sudden Death -> not clinched
    state.team1Score = 300;
    assert.strictEqual(Feud.getClinchedWinnerInfo(state).clinched, false, "Exact tie possibility means not clinched");

    // Insurmountable lead (301 vs 0, 300 left) -> mathematically clinched!
    state.team1Score = 301;
    const clinched = Feud.getClinchedWinnerInfo(state);
    assert.strictEqual(clinched.clinched, true);
    assert.strictEqual(clinched.winnerTeam, 1);
    assert.strictEqual(clinched.remainingRounds, 1);
    assert.strictEqual(clinched.maxRemainingPoints, 300);
  });

  await runTest("13. Deck Slug Matching, Duplicate Reconciliation & Format-Preserving JSON", () => {
    assert.strictEqual(Feud.slugifyDeckName("Desi Thanksgiving (37 Rounds)"), "desi-thanksgiving-37-rounds");

    // Simulate a stale slug-named custom-file entry in catalog before manifest loads
    Feud.upsertCatalogEntries(
      [
        {
          id: "desi-thanksgiving-37-rounds.json",
          source: "custom-file",
          data: {
            deckName: "Desi Thanksgiving (37 Rounds)",
            rounds: [{ title: "R1", multiplier: 1, prompt: "Old?", answers: [{ text: "A", points: 100 }] }],
            fastMoney: []
          }
        }
      ],
      { skipSave: true }
    );

    // Remote manifest entry with canonical id should reconcile/replace the stale duplicate
    Feud.upsertCatalogEntries(
      [
        {
          id: "desi-thanksgiving.json",
          file: "./decks/desi-thanksgiving.json",
          source: "remote",
          meta: {
            deckName: "Desi Thanksgiving (37 Rounds)",
            roundsCount: 37,
            fastMoneySets: 5
          }
        }
      ],
      { skipSave: true }
    );

    const catalog = Feud.getDeckCatalog();
    const desiMatches = catalog.filter((c) => /Desi Thanksgiving/i.test((c.meta && c.meta.deckName) || (c.data && c.data.deckName) || ""));
    assert.strictEqual(desiMatches.length, 1, "Duplicate slugified & canonical Desi Thanksgiving entries must reconcile to 1");
    assert.strictEqual(desiMatches[0].id, "desi-thanksgiving.json");
    assert.strictEqual(desiMatches[0].data, null, "Stale cached data should be dropped when remote metadata differs");

    const bySlug = Feud.findCatalogDeckMatch("desi-thanksgiving-37-rounds");
    const byId = Feud.findCatalogDeckMatch("desi-thanksgiving");
    assert.ok(bySlug && byId && bySlug.id === byId.id, "Both slugified and canonical ?deck= params should resolve to the same entry");

    // Verify formatDeckJsonLikeOriginal preserves 4-space CRLF & extra keys
    const origCrlf = '{\r\n    "gameTitle": "Test",\r\n    "boardTheme": "harvest",\r\n    "rounds": [\r\n        {\r\n            "prompt": "Q?",\r\n            "answers": [\r\n                { "text": "Yes", "points": 100 }\r\n            ]\r\n        }\r\n    ]\r\n}\r\n';
    const formatted = Feud.formatDeckJsonLikeOriginal(
      {
        gameTitle: "Test Updated",
        rounds: [{ prompt: "Q2?", answers: [{ text: "No", points: 100 }] }]
      },
      origCrlf
    );
    assert.ok(formatted.includes("\r\n"), "Should preserve CRLF line endings");
    assert.ok(formatted.includes('\n    "gameTitle": "Test Updated"'), "Should preserve 4-space indentation");
    assert.ok(formatted.includes('"boardTheme": "harvest"'), "Should preserve extra top-level keys");
    assert.ok(formatted.includes('{ "text": "No", "points": 100 }'), "Should preserve compact single-line answers");
  });

  await runTest("14. Cache-Bumper Suffix Progression (a..z, aa..az, ba..zz, aaa)", () => {
    const bumper = require("./bump-cache-version.js");
    assert.strictEqual(bumper.nextSuffix("a"), "b");
    assert.strictEqual(bumper.nextSuffix("y"), "z");
    assert.strictEqual(bumper.nextSuffix("z"), "aa");
    assert.strictEqual(bumper.nextSuffix("aa"), "ab");
    assert.strictEqual(bumper.nextSuffix("az"), "ba");
    assert.strictEqual(bumper.nextSuffix("ba"), "bb");
    assert.strictEqual(bumper.nextSuffix("zz"), "aaa");
    assert.strictEqual(bumper.computeNextVersion("20261125z", "20261126"), "20261126a");
    assert.strictEqual(bumper.computeNextVersion("20261126a", "20261126"), "20261126b");
    assert.strictEqual(bumper.computeNextVersion("20261126z", "20261126"), "20261126aa");
  });

  console.log(`\n=============================================================`);
  if (failed > 0) {
    console.error(`❌ Core Logic Test Suite Failed: ${failed} failed, ${passed} passed.`);
    process.exit(1);
  } else {
    console.log(`🎉 All ${passed} core logic test suites passed!`);
  }
})();
