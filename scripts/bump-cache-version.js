#!/usr/bin/env node
// =====================================================================
// CACHE-BUSTING VERSION BUMPER (scripts/bump-cache-version.js)
// Increments ?v=YYYYMMDD<suffix> across index.html, review.html, and sw.js.
// Uses current UTC date with Excel-style suffix progression:
//   a, b, ..., z, aa, ab, ac, ..., az, ba, bb, ...
// =====================================================================

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function nextSuffix(cur) {
  const chars = String(cur || "")
    .toLowerCase()
    .split("");
  if (chars.length === 0) return "a";
  let i = chars.length - 1;
  while (i >= 0) {
    if (chars[i] !== "z") {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      return chars.join("");
    }
    chars[i] = "a";
    i--;
  }
  return "a" + chars.join("");
}

function getTodayYyyymmdd() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

function computeNextVersion(currentVersion, todayStr) {
  const m = String(currentVersion || "").match(/^(\d{8})([a-z]+)$/i);
  if (!m || m[1] !== todayStr) {
    return `${todayStr}a`;
  }
  return `${todayStr}${nextSuffix(m[2])}`;
}

function main() {
  const swPath = path.join(ROOT, "sw.js");
  const indexPath = path.join(ROOT, "index.html");
  const reviewPath = path.join(ROOT, "review.html");

  const swText = fs.readFileSync(swPath, "utf8");
  const curMatch = swText.match(/CACHE_NAME\s*=\s*"party-feud-v([0-9a-zA-Z_-]+)"/);
  const currentVersion = curMatch ? curMatch[1] : "";
  const today = getTodayYyyymmdd();
  const nextVersion = computeNextVersion(currentVersion, today);

  if (process.argv.includes("--print-only")) {
    console.log(nextVersion);
    return;
  }

  const nextSw = swText.replace(
    /CACHE_NAME\s*=\s*"party-feud-v[0-9a-zA-Z_-]+"/,
    `CACHE_NAME = "party-feud-v${nextVersion}"`
  );
  fs.writeFileSync(swPath, nextSw);

  const indexText = fs
    .readFileSync(indexPath, "utf8")
    .replace(/\?v=[0-9a-zA-Z_-]+/g, `?v=${nextVersion}`)
    .replace(/(id="appBuildBadge"[^>]*>Build v)[0-9a-zA-Z_-]+(<)/g, `$1${nextVersion}$2`);
  fs.writeFileSync(indexPath, indexText);

  const reviewText = fs
    .readFileSync(reviewPath, "utf8")
    .replace(/\?v=[0-9a-zA-Z_-]+/g, `?v=${nextVersion}`);
  fs.writeFileSync(reviewPath, reviewText);

  console.log(`Bumped cache-busting version: v=${currentVersion || "(none)"} -> v=${nextVersion}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  nextSuffix,
  computeNextVersion,
  getTodayYyyymmdd
};
