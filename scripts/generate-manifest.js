#!/usr/bin/env node
// =====================================================================
// DECK MANIFEST GENERATOR (scripts/generate-manifest.js)
// Scans decks/*.json (excluding manifest.json) and writes decks/manifest.json
// so GitHub Pages and static servers discover all decks in 1 CDN request
// without hitting unauthenticated GitHub API rate limits.
// =====================================================================

const fs = require("fs");
const path = require("path");

const DECKS_DIR = path.resolve(__dirname, "..", "decks");
const MANIFEST_PATH = path.join(DECKS_DIR, "manifest.json");

function inferDeckTags(id, deckName, explicitTags) {
  if (Array.isArray(explicitTags) && explicitTags.length > 0) {
    return Array.from(
      new Set(
        explicitTags
          .map((t) => String(t || "").trim().toLowerCase())
          .filter(Boolean)
      )
    );
  }
  const haystack = `${id || ""} ${deckName || ""}`;
  const tags = new Set();
  const isFrc = /frc|robotics|stem/i.test(haystack);

  if (/family-friendly|starter|frc|bollywood|desi/i.test(haystack)) {
    tags.add("family-friendly");
  }
  if (isFrc) {
    tags.add("robotics");
  }
  if (/thanksgiving|christmas|holiday|halloween|diwali/i.test(haystack)) {
    tags.add("holidays");
  }
  if (/bollywood|movie|music/i.test(haystack)) {
    tags.add("movies-music");
  }
  if (/2025|2026|starter|friendly-feud/i.test(haystack) && !isFrc) {
    tags.add("classic");
  }
  if (tags.size === 0) {
    tags.add("classic");
  }
  return Array.from(tags);
}

function prettyStem(fileName) {
  return String(fileName || "")
    .replace(/\.json$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .trim();
}

function buildManifest() {
  const files = fs
    .readdirSync(DECKS_DIR)
    .filter((f) => /\.json$/i.test(f) && f.toLowerCase() !== "manifest.json");

  const decks = [];
  for (const fileName of files) {
    const fullPath = path.join(DECKS_DIR, fileName);
    const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
    const data = JSON.parse(raw);

    const rawRounds = Array.isArray(data)
      ? data
      : Array.isArray(data.rounds)
      ? data.rounds
      : [];
    const roundsCount = rawRounds.filter(
      (r) => r && (r.prompt || r.question) && Array.isArray(r.answers) && r.answers.length > 0
    ).length;
    if (roundsCount === 0) {
      throw new Error(`Deck ${fileName} has 0 valid rounds.`);
    }

    const fmArray = Array.isArray(data.fastMoney)
      ? data.fastMoney
      : Array.isArray(data.final_round)
      ? data.final_round
      : [];
    const fastMoneySets = Math.floor(fmArray.length / 5);

    const deckName = String(data.deckName || data.name || "").trim() || prettyStem(fileName);
    const gameIcon = String(data.gameIcon || data.icon || "🎉").trim() || "🎉";
    const boardTheme = String(data.boardTheme || "").trim().toLowerCase();
    const tags = inferDeckTags(fileName, deckName, data.tags);

    const entry = {
      id: fileName,
      file: `./decks/${fileName}`,
      deckName,
      gameIcon,
      roundsCount,
      fastMoneySets,
      tags
    };
    if (boardTheme) {
      entry.boardTheme = boardTheme;
    }
    decks.push(entry);
  }

  decks.sort((a, b) => a.deckName.localeCompare(b.deckName));

  const payload = {
    generatedAt: new Date().toISOString(),
    decks
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  return payload;
}

if (require.main === module) {
  const res = buildManifest();
  console.log(`Generated ${MANIFEST_PATH} with ${res.decks.length} decks.`);
}

module.exports = { buildManifest, inferDeckTags };
