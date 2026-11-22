#!/usr/bin/env node
// =====================================================================
// REPOSITORY & PR VALIDATOR (scripts/validate-repo.js)
// Validates:
//  1. JavaScript syntax across data/, js/, scripts/, and sw.js
//  2. All question decks in decks/*.json via js/formats.js#parseFeudJson
//  3. Cache-busting ?v= version sync across index.html, review.html, and sw.js
// =====================================================================

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
let errors = 0;

function fail(msg) {
  console.error(`❌ ${msg}`);
  errors++;
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

// 1. Validate JavaScript Syntax
const jsFiles = [
  "js/audio.js",
  "js/state.js",
  "js/formats.js",
  "js/decks.js",
  "js/sync.js",
  "js/feedback.js",
  "js/views.js",
  "js/app.js",
  "sw.js",
  "scripts/generate-manifest.js",
  "scripts/validate-repo.js",
  "scripts/test-core.js",
  "scripts/test-ui-e2e.js"
];

jsFiles.forEach((rel) => {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    fail(`Missing expected JS file: ${rel}`);
    return;
  }
  try {
    const code = fs.readFileSync(full, "utf8").replace(/^#!.*\r?\n/, "");
    new vm.Script(code, { filename: rel });
  } catch (err) {
    fail(`Syntax error in ${rel}: ${err.message}`);
  }
});
if (errors === 0) {
  pass(`All ${jsFiles.length} JavaScript files passed syntax validation.`);
}

// 2. Validate Question Decks (decks/*.json)
global.window = {};
eval(fs.readFileSync(path.join(ROOT, "js/formats.js"), "utf8"));
const parseFeudJson = global.window.Feud && global.window.Feud.parseFeudJson;

const decksDir = path.join(ROOT, "decks");
const deckFiles = fs
  .readdirSync(decksDir)
  .filter((f) => /\.json$/i.test(f) && f.toLowerCase() !== "manifest.json");

deckFiles.forEach((fileName) => {
  const full = path.join(decksDir, fileName);
  let raw;
  try {
    raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
    JSON.parse(raw);
  } catch (err) {
    fail(`Invalid JSON in decks/${fileName}: ${err.message}`);
    return;
  }

  let parsed;
  try {
    parsed = parseFeudJson(raw);
  } catch (err) {
    fail(`Could not parse decks/${fileName} as a Party Feud deck: ${err.message}`);
    return;
  }

  if (!parsed || parsed.kind !== "deck" || !Array.isArray(parsed.rounds) || parsed.rounds.length === 0) {
    fail(`decks/${fileName} must contain at least 1 valid round.`);
    return;
  }

  parsed.rounds.forEach((r, idx) => {
    const rLabel = `decks/${fileName} Round #${idx + 1}`;
    if (!r.prompt || !String(r.prompt).trim()) {
      fail(`${rLabel} is missing a question prompt.`);
    }
    if (![1, 2, 3].includes(Number(r.multiplier) || 1)) {
      fail(`${rLabel} has invalid multiplier "${r.multiplier}" (expected 1, 2, or 3).`);
    }
    const isTie = /tie-?breaker|sudden\s*death/i.test(r.title || "") || /tie-?breaker|sudden\s*death/i.test(r.theme || "");
    const minAns = isTie ? 1 : 2;
    if (!Array.isArray(r.answers) || r.answers.length < minAns || r.answers.length > 8) {
      fail(`${rLabel} has ${r.answers ? r.answers.length : 0} answers (expected ${minAns} to 8).`);
      return;
    }
    let sum = 0;
    r.answers.forEach((a, aIdx) => {
      if (!a.text || !String(a.text).trim()) {
        fail(`${rLabel} Answer #${aIdx + 1} has empty text.`);
      }
      const pts = Number(a.points);
      if (!Number.isFinite(pts) || pts <= 0) {
        fail(`${rLabel} Answer #${aIdx + 1} ("${a.text}") must have points > 0 (got ${a.points}).`);
      }
      sum += pts;
    });
    if (sum < 40 || sum > 120) {
      fail(`${rLabel} answer points sum to ${sum} (expected ~100).`);
    }
  });

  if (Array.isArray(parsed.fastMoney)) {
    parsed.fastMoney.forEach((fm, fmIdx) => {
      if (!fm.prompt || !String(fm.prompt).trim()) {
        fail(`decks/${fileName} Fast Money #${fmIdx + 1} is missing a prompt.`);
      }
    });
  }
});
if (errors === 0) {
  pass(`All ${deckFiles.length} deck JSON files in decks/ passed schema and round validation.`);
}

// 3. Validate Cache-Busting ?v= Version Consistency
const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const reviewHtml = fs.readFileSync(path.join(ROOT, "review.html"), "utf8");
const swJs = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");

const indexVersions = Array.from(indexHtml.matchAll(/\?v=([0-9a-zA-Z_-]+)/g)).map((m) => m[1]);
const reviewVersions = Array.from(reviewHtml.matchAll(/\?v=([0-9a-zA-Z_-]+)/g)).map((m) => m[1]);
const badgeMatch = indexHtml.match(/id="appBuildBadge"[^>]*>Build v([0-9a-zA-Z_-]+)</);
const swMatch = swJs.match(/CACHE_NAME\s*=\s*"party-feud-v([0-9a-zA-Z_-]+)"/);

const allVersions = new Set([
  ...indexVersions,
  ...reviewVersions,
  badgeMatch ? badgeMatch[1] : "MISSING_BADGE",
  swMatch ? swMatch[1] : "MISSING_SW"
]);

if (allVersions.size !== 1) {
  fail(
    `Mismatched cache-busting versions found across index.html, review.html, and sw.js: ${Array.from(
      allVersions
    ).join(", ")}`
  );
} else {
  pass(`Cache-busting version v=${Array.from(allVersions)[0]} is consistent across index.html, review.html, and sw.js.`);
}

if (errors > 0) {
  console.error(`\n💥 Validation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log("\n🎉 All repository checks passed!");
}
