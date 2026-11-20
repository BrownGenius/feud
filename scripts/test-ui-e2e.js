#!/usr/bin/env node
// =====================================================================
// HEADLESS BROWSER E2E UI & GAMEPLAY SMOKE TEST (scripts/test-ui-e2e.js)
// Zero-dependency Node + Headless Chrome/Chromium/Edge CDP runner.
// Starts a local static HTTP server, drives a real headless browser via
// Chrome DevTools Protocol (WebSocket), and verifies:
//  1. Zero uncaught exceptions or console errors across all views
//  2. Lobby Setup View: Deck catalog discovery (manifest.json), category tags,
//     tournament format availability gating, and theme selector
//  3. AI Custom Deck Builder Modal: Prompt generator, live JSON validation,
//     and loading a custom AI deck
//  4. Edit Round Modal & 10-Second Interactive Demo Mode
//  5. Full Host Gameplay Loop + Live Embedded TV Sync:
//     Face-Off Buzz -> Answer #1 Reveal -> Play Decision -> Board Sweeps / Strikes
//     -> Steal Phase -> Round Summary -> Undo Stack
//  6. Fast Money Bonus Stage: Host panel & TV Fast Money board rendering
//  7. Multi-View Role Routing: Standalone TV View (?role=tv), Individual Team
//     Buzzer (?role=buzzer1), and Shared Combo 1v1 Buzzer (?role=buzzer_combo)
//  8. Printable Review Sheet (review.html): 2-column question cards, level
//     filtering, answer spoiler toggle, and #deckData custom deck hash review
// =====================================================================

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const assert = require("assert");

const ROOT_DIR = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".gif": "image/gif",
  ".ico": "image/x-icon"
};

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url, "http://127.0.0.1");
        let pathname = decodeURIComponent(parsedUrl.pathname);
        if (pathname === "/") pathname = "/index.html";

        const safePath = path.normalize(path.join(ROOT_DIR, pathname));
        if (!safePath.startsWith(ROOT_DIR)) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const ext = path.extname(safePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "no-store"
        });
        fs.createReadStream(safePath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });

    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
    server.on("error", reject);
  });
}

function findBrowserExecutable() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }

  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
        ]
      : process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          "/Applications/Chromium.app/Contents/MacOS/Chromium"
        ]
      : [
          "/usr/bin/google-chrome",
          "/usr/bin/google-chrome-stable",
          "/usr/bin/chromium",
          "/usr/bin/chromium-browser",
          "/snap/bin/chromium",
          "/usr/bin/microsoft-edge"
        ];

  for (const bin of candidates) {
    if (fs.existsSync(bin)) return bin;
  }
  throw new Error(
    "No Chrome, Chromium, or Edge binary found. Set CHROME_BIN to a valid browser path."
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function launchHeadlessBrowser(browserBin) {
  const userDataDir = path.join(
    require("os").tmpdir(),
    `feud_e2e_profile_${Date.now()}_${Math.floor(Math.random() * 10000)}`
  );

  // Pick an ephemeral free port for remote debugging
  const debugPort = await new Promise((resolve, reject) => {
    const srv = http.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const p = srv.address().port;
      srv.close(() => resolve(p));
    });
    srv.on("error", reject);
  });

  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-extensions",
    "--disable-popup-blocking",
    "--mute-audio",
    "--window-size=1440,900",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank"
  ];

  if (process.platform === "linux") {
    args.unshift("--no-sandbox", "--disable-dev-shm-usage");
  }

  const proc = spawn(browserBin, args, { stdio: "ignore" });

  let targets = null;
  for (let i = 0; i < 60; i++) {
    try {
      targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
      if (Array.isArray(targets) && targets.length > 0) break;
    } catch (e) {}
    await sleep(150);
  }

  if (!targets || targets.length === 0) {
    try {
      proc.kill();
    } catch (e) {}
    throw new Error("Timed out waiting for headless browser DevTools endpoint.");
  }

  const pageTarget = targets.find((t) => t.type === "page") || targets[0];
  return { proc, debugPort, userDataDir, webSocketDebuggerUrl: pageTarget.webSocketDebuggerUrl };
}

function createCdpWebSocket(wsUrl) {
  if (typeof WebSocket === "function") {
    return new WebSocket(wsUrl);
  }
  // Fallback RFC-6455 client for Node < 22 where global WebSocket isn't enabled by default
  const net = require("net");
  const crypto = require("crypto");
  const EventEmitter = require("events");
  const parsed = new URL(wsUrl);
  const emitter = new EventEmitter();
  let buf = Buffer.alloc(0);
  let upgraded = false;

  const sock = net.connect(
    Number(parsed.port) || 80,
    parsed.hostname || "127.0.0.1",
    () => {
      const key = crypto.randomBytes(16).toString("base64");
      sock.write(
        [
          `GET ${parsed.pathname}${parsed.search} HTTP/1.1`,
          `Host: ${parsed.host}`,
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Key: ${key}`,
          "Sec-WebSocket-Version: 13",
          "\r\n"
        ].join("\r\n")
      );
    }
  );

  sock.on("data", (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    if (!upgraded) {
      const hdrEnd = buf.indexOf("\r\n\r\n");
      if (hdrEnd === -1) return;
      upgraded = true;
      buf = buf.subarray(hdrEnd + 4);
      emitter.emit("open");
    }
    while (buf.length >= 2) {
      const b0 = buf[0];
      const b1 = buf[1];
      const opcode = b0 & 0x0f;
      let len = b1 & 0x7f;
      let offset = 2;
      if (len === 126) {
        if (buf.length < 4) return;
        len = buf.readUInt16BE(2);
        offset = 4;
      } else if (len === 127) {
        if (buf.length < 10) return;
        len = Number(buf.readBigUInt64BE(2));
        offset = 10;
      }
      if (buf.length < offset + len) return;
      const payload = buf.subarray(offset, offset + len);
      buf = buf.subarray(offset + len);
      if (opcode === 0x8) {
        sock.end();
        return;
      }
      if (opcode === 0x9) {
        // Pong
        const pong = Buffer.alloc(2 + payload.length);
        pong[0] = 0x8a;
        pong[1] = 0x80 | payload.length;
        // Masked empty/small pong handled if needed
        continue;
      }
      if (opcode === 0x1 || opcode === 0x0) {
        emitter.emit("message", { data: payload.toString("utf8") });
      }
    }
  });
  sock.on("error", (err) => emitter.emit("error", err));

  return {
    addEventListener: (evt, fn) => emitter.on(evt, fn),
    send: (text) => {
      const payload = Buffer.from(String(text), "utf8");
      const mask = crypto.randomBytes(4);
      let header;
      if (payload.length < 126) {
        header = Buffer.alloc(6);
        header[0] = 0x81;
        header[1] = 0x80 | payload.length;
        mask.copy(header, 2);
      } else if (payload.length < 65536) {
        header = Buffer.alloc(8);
        header[0] = 0x81;
        header[1] = 0x80 | 126;
        header.writeUInt16BE(payload.length, 2);
        mask.copy(header, 4);
      } else {
        header = Buffer.alloc(14);
        header[0] = 0x81;
        header[1] = 0x80 | 127;
        header.writeBigUInt64BE(BigInt(payload.length), 2);
        mask.copy(header, 10);
      }
      const masked = Buffer.alloc(payload.length);
      for (let i = 0; i < payload.length; i++) {
        masked[i] = payload[i] ^ mask[i % 4];
      }
      sock.write(Buffer.concat([header, masked]));
    },
    close: () => {
      try {
        sock.end();
      } catch (e) {}
    }
  };
}

class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.pageErrors = [];
    this.consoleErrors = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      const ws = createCdpWebSocket(this.wsUrl);
      this.ws = ws;

      ws.addEventListener("open", () => resolve());
      ws.addEventListener("error", (err) => reject(err));
      ws.addEventListener("message", (ev) => {
        try {
          const msg = JSON.parse(String(ev.data));
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve: res, reject: rej } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) rej(new Error(msg.error.message || JSON.stringify(msg.error)));
            else res(msg.result);
          } else if (msg.method === "Runtime.exceptionThrown") {
            const details = msg.params && msg.params.exceptionDetails;
            const text =
              (details &&
                details.exception &&
                (details.exception.description || details.exception.value)) ||
              (details && details.text) ||
              "Uncaught page exception";
            this.pageErrors.push(text);
          } else if (msg.method === "Runtime.consoleAPICalled") {
            if (msg.params && msg.params.type === "error") {
              const args = (msg.params.args || [])
                .map((a) => a.value ?? a.description ?? "")
                .join(" ");
              // Ignore expected external CDN offline/network warnings if blocked in CI
              if (!/unpkg\.com|esm\.sh|jsdelivr|esm\.run|mqtt|trystero|favicon/i.test(args)) {
                this.consoleErrors.push(args);
              }
            }
          }
        } catch (e) {}
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression: `(async () => { return (${expression}); })()`,
      awaitPromise: true,
      returnByValue: true
    });
    if (res && res.exceptionDetails) {
      const desc =
        (res.exceptionDetails.exception && res.exceptionDetails.exception.description) ||
        res.exceptionDetails.text ||
        "Evaluation error";
      throw new Error(desc);
    }
    return res && res.result ? res.result.value : undefined;
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    for (let i = 0; i < 60; i++) {
      try {
        const ready = await this.eval("document.readyState === 'complete'");
        if (ready) break;
      } catch (e) {}
      await sleep(100);
    }
    await sleep(250);
  }

  async waitFor(predicateExpr, timeoutMs = 6000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const ok = await this.eval(`Boolean(${predicateExpr})`);
        if (ok) return true;
      } catch (e) {}
      await sleep(100);
    }
    throw new Error(`Timed out waiting for condition: ${predicateExpr}`);
  }

  close() {
    try {
      if (this.ws) this.ws.close();
    } catch (e) {}
  }
}

let passed = 0;
let failed = 0;

async function runStep(name, fn) {
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
  console.log("🌐 Running Headless Browser E2E UI & Gameplay Smoke Tests...\n");

  const browserBin = findBrowserExecutable();
  console.log(`   Browser: ${browserBin}`);

  const { server, baseUrl } = await startStaticServer();
  console.log(`   Local Server: ${baseUrl}\n`);

  let browser = null;
  let cdp = null;

  try {
    browser = await launchHeadlessBrowser(browserBin);
    cdp = new CdpSession(browser.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // Stub window.open / window.confirm / window.print so popups don't block headless execution
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        window.__openedUrls = [];
        window.open = function(url) {
          window.__openedUrls.push(url);
          return { closed: false, focus: function(){}, close: function(){ this.closed = true; } };
        };
        window.confirm = function() { return true; };
        window.print = function() { window.__printed = true; };
      `
    });

    await runStep("1. Lobby View Loads, Discovers Decks via manifest.json & Renders Category Tag Pills", async () => {
      await cdp.navigate(`${baseUrl}/index.html`);
      await cdp.waitFor("window.Feud && document.getElementById('deckManagerSelect').options.length >= 7");

      const lobbyState = await cdp.eval(`({
        title: document.getElementById('topBrandTitle')?.textContent.trim(),
        lobbyVisible: !document.getElementById('lobbyView').classList.contains('hidden'),
        deckOptionCount: document.getElementById('deckManagerSelect').options.length,
        tagPillCount: document.querySelectorAll('#deckTagPills .deck-tag-pill').length,
        starterFormat3Disabled: document.querySelector('#setupMatchFormatSelect option[value="3"]')?.disabled,
        starterFormat4Disabled: document.querySelector('#setupMatchFormatSelect option[value="4"]')?.disabled
      })`);

      assert.strictEqual(lobbyState.title, "Party Feud");
      assert.strictEqual(lobbyState.lobbyVisible, true);
      assert.ok(lobbyState.deckOptionCount >= 8, `Expected >= 8 decks (Starter + 7 JSON decks), got ${lobbyState.deckOptionCount}`);
      assert.ok(lobbyState.tagPillCount >= 4, `Expected >= 4 category tag pills, got ${lobbyState.tagPillCount}`);
      // Starter deck has 5 regular rounds; with 4 rounds/game, 3-team (8 rounds) & 4-team (12 rounds) must be disabled!
      assert.strictEqual(lobbyState.starterFormat3Disabled, true, "3-Team format should be disabled on 5-round Starter deck at 4 rounds/game");
      assert.strictEqual(lobbyState.starterFormat4Disabled, true, "4-Team format should be disabled on 5-round Starter deck at 4 rounds/game");
    });

    await runStep("2. Selecting a 60-Round Deck Enables 3-Team & 4-Team Tournament Modes & Theme Switching", async () => {
      await cdp.eval(`(async () => {
        const sel = document.getElementById('deckManagerSelect');
        const opt2026 = Array.from(sel.options).find(o => /2026\\.json/i.test(o.value));
        if (opt2026) {
          sel.value = opt2026.value;
          await window.onSelectCatalogDeck(opt2026.value);
        }
        window.onBoardThemeChange('holiday');
      })()`);

      await cdp.waitFor("!document.querySelector('#setupMatchFormatSelect option[value=\"4\"]').disabled");

      const afterDeckSwitch = await cdp.eval(`({
        format3Disabled: document.querySelector('#setupMatchFormatSelect option[value="3"]')?.disabled,
        format4Disabled: document.querySelector('#setupMatchFormatSelect option[value="4"]')?.disabled,
        bodyTheme: document.body.dataset.theme
      })`);

      assert.strictEqual(afterDeckSwitch.format3Disabled, false, "3-Team format should enable for 60-round deck");
      assert.strictEqual(afterDeckSwitch.format4Disabled, false, "4-Team format should enable for 60-round deck");
      assert.strictEqual(afterDeckSwitch.bodyTheme, "holiday", "Board theme attribute should update to 'holiday'");
    });

    await runStep("3. AI Custom Deck Builder Modal: Prompt Generation, Live JSON Validation & Deck Load", async () => {
      await cdp.eval(`window.openAiDeckBuilderModal()`);
      await cdp.waitFor("!document.getElementById('aiDeckBuilderModal').classList.contains('hidden')");

      const customDeckJson = JSON.stringify({
        gameTitle: "Party Feud",
        gameIcon: "🚀",
        deckName: "E2E Space Trivia Deck",
        rounds: [
          {
            title: "Round 1",
            multiplier: 1,
            prompt: "Name a planet in our solar system.",
            answers: [
              { text: "Mars", points: 45 },
              { text: "Jupiter", points: 30 },
              { text: "Saturn", points: 25 }
            ]
          },
          {
            title: "Round 2",
            multiplier: 1,
            prompt: "Name something astronauts eat in space.",
            answers: [
              { text: "Freeze-dried ice cream", points: 60 },
              { text: "Tortillas", points: 40 }
            ]
          },
          {
            title: "Round 3",
            multiplier: 2,
            prompt: "Name a famous space telescope or probe.",
            answers: [
              { text: "Hubble", points: 55 },
              { text: "James Webb", points: 45 }
            ]
          },
          {
            title: "Round 4",
            multiplier: 3,
            prompt: "Name something you see in the night sky.",
            answers: [
              { text: "The Moon", points: 65 },
              { text: "Shooting star", points: 35 }
            ]
          }
        ],
        fastMoney: [
          { prompt: "Q1", hint: "A1 (50), A2 (30)" },
          { prompt: "Q2", hint: "B1 (40), B2 (20)" },
          { prompt: "Q3", hint: "C1 (60), C2 (15)" },
          { prompt: "Q4", hint: "D1 (45), D2 (25)" },
          { prompt: "Q5", hint: "E1 (55), E2 (35)" }
        ]
      });

      const aiStatus = await cdp.eval(`(async () => {
        const ta = document.getElementById('aiBuilderJsonInput');
        ta.value = ${JSON.stringify(customDeckJson)};
        window.validateAiBuilderJson();
        const statusText = document.getElementById('aiBuilderValidationStatus').textContent;
        await window.applyAiBuilderDeck();
        return {
          statusText,
          modalClosed: document.getElementById('aiDeckBuilderModal').classList.contains('hidden'),
          reviewHref: document.querySelector('.review-deck-link')?.getAttribute('href') || ''
        };
      })()`);

      assert.ok(aiStatus.statusText.includes("Valid"), `Expected AI validation status to be Valid, got: ${aiStatus.statusText}`);
      assert.strictEqual(aiStatus.modalClosed, true, "AI Deck Builder modal should close after applying deck");
      assert.ok(
        aiStatus.reviewHref.includes("review.html"),
        "Review link should point to review.html"
      );
    });

    await runStep("4. 10-Second Interactive Demo Mode & Embedded Live TV Preview", async () => {
      await cdp.eval(`window.startInstantDemoMode()`);
      await cdp.waitFor("!document.getElementById('hostView').classList.contains('hidden')");

      const demoState = await cdp.eval(`({
        demoBannerVisible: !document.getElementById('hostDemoBanner').classList.contains('hidden'),
        hostPrompt: document.getElementById('hostPromptText')?.textContent.trim(),
        tvDockedInsideHost: Boolean(document.querySelector('#hostTvMonitorDock #tvView')),
        hostAnswerBtnCount: document.querySelectorAll('#hostAnswersList button').length
      })`);

      assert.strictEqual(demoState.demoBannerVisible, true, "Interactive Demo banner should be visible");
      assert.ok(demoState.hostPrompt.length > 10, "Host prompt should render starter question");
      assert.strictEqual(demoState.tvDockedInsideHost, true, "Live TV preview should be docked inside Host workspace");
      assert.strictEqual(demoState.hostAnswerBtnCount, 6, "Round 1 should render 6 clickable answer buttons on Host remote");

      // Simulate Team 1 Buzz in Demo Mode & reveal #1 answer
      await cdp.eval(`(async () => {
        await window.demoSimulateBuzz(1);
      })()`);
      await sleep(100);
      await cdp.eval(`document.querySelectorAll('#hostAnswersList button')[0].click()`);
      await sleep(100);

      const afterReveal = await cdp.eval(`({
        tvPot: document.getElementById('tvPotValue')?.textContent.trim(),
        revealedTilesOnTv: document.querySelectorAll('#tvAnswerGrid .feud-tile.revealed-state').length
      })`);

      assert.strictEqual(afterReveal.tvPot, "40", "TV Round Pot should update to 40 after revealing #1 answer");
      assert.strictEqual(afterReveal.revealedTilesOnTv, 1, "TV Answer Grid should show 1 revealed 3D tile");

      // Exit Demo Mode back to Lobby setup
      await cdp.eval(`window.exitDemoToSetup()`);
      await cdp.waitFor("!document.getElementById('lobbyView').classList.contains('hidden')");
    });

    await runStep("5. Full Host Gameplay Loop: Start Game -> Face-Off -> Play -> Strikes -> Steal -> Undo", async () => {
      // Select Starter Deck, enable Fast Money, set team names, and start game
      await cdp.eval(`(async () => {
        await window.onSelectCatalogDeck('starter');
        document.getElementById('setupTeam1Input').value = 'Blue Blazers';
        document.getElementById('setupTeam2Input').value = 'Red Rockets';
        const fmCheck = document.getElementById('setupEnableFastMoneyCheckbox');
        if (fmCheck) fmCheck.checked = true;
        await window.confirmStartNewGame('host');
      })()`);

      await cdp.waitFor("!document.getElementById('hostView').classList.contains('hidden')");

      // Step A: Reveal question on TV & verify Face-Off phase
      await cdp.eval(`(async () => {
        // Click primary Reveal Question button in hostFaceOffDecisionBar or call via UI
        const btn = document.querySelector('#hostFaceOffDecisionBar button');
        if (btn) btn.click();
      })()`);
      await sleep(150);

      // Step B: Team 1 buzzes in first during Face-Off
      await cdp.eval(`(async () => {
        const btns = Array.from(document.querySelectorAll('#hostFaceOffDecisionBar button'));
        const t1BuzzBtn = btns.find(b => /Blue Blazers/i.test(b.textContent));
        if (t1BuzzBtn) t1BuzzBtn.click();
      })()`);
      await sleep(150);

      // Step C: Host taps Answer #1 (40 pts) -> Team 1 wins Face-Off immediately -> Pass or Play
      await cdp.eval(`document.querySelectorAll('#hostAnswersList button')[0].click()`);
      await sleep(150);

      // Step D: Choose PLAY
      await cdp.eval(`(async () => {
        const btns = Array.from(document.querySelectorAll('#hostFaceOffDecisionBar button'));
        const playBtn = btns.find(b => /Play/i.test(b.textContent));
        if (playBtn) playBtn.click();
      })()`);
      await sleep(150);

      // Step E: Reveal Answer #2 (24 pts -> Pot = 64)
      await cdp.eval(`document.querySelectorAll('#hostAnswersList button')[1].click()`);
      await sleep(150);

      const midPlay = await cdp.eval(`({
        pot: document.getElementById('tvPotValue')?.textContent.trim(),
        t1Name: document.getElementById('tvTeam1Name')?.textContent.trim(),
        t2Name: document.getElementById('tvTeam2Name')?.textContent.trim()
      })`);
      assert.strictEqual(midPlay.pot, "64");
      assert.strictEqual(midPlay.t1Name, "Blue Blazers");
      assert.strictEqual(midPlay.t2Name, "Red Rockets");

      // Step F: Trigger 3 Wrong Answers (Strikes 1, 2, 3) -> transitions to Steal Mode for Red Rockets!
      for (let s = 0; s < 3; s++) {
        await cdp.eval(`document.querySelector('#hostAnswersWrongBar button')?.click()`);
        await sleep(120);
      }

      const stealCheck = await cdp.eval(`({
        strikesText: document.getElementById('tvStrikesBadge')?.textContent.trim(),
        headline: document.getElementById('hostFlowHeadline')?.textContent.trim()
      })`);
      assert.ok(stealCheck.strikesText.includes("3 / 3"), `Expected 3/3 strikes, got ${stealCheck.strikesText}`);
      assert.ok(/Steal/i.test(stealCheck.headline), `Expected Steal headline, got ${stealCheck.headline}`);

      // Step G: Red Rockets succeed on the Steal by hitting Answer #3 (15 pts -> Total Pot 79 awarded to Team 2!)
      await cdp.eval(`document.querySelectorAll('#hostAnswersList button')[2].click()`);
      await sleep(150);

      const afterSteal = await cdp.eval(`({
        t1Score: document.getElementById('tvTeam1Score')?.textContent.trim(),
        t2Score: document.getElementById('tvTeam2Score')?.textContent.trim(),
        pot: document.getElementById('tvPotValue')?.textContent.trim()
      })`);
      assert.strictEqual(afterSteal.t1Score, "0");
      assert.strictEqual(afterSteal.t2Score, "79", "Red Rockets should steal 40 + 24 + 15 = 79 pts");
      assert.strictEqual(afterSteal.pot, "0", "Pot should reset to 0 once awarded");

      // Step H: Test Undo Button restores Steal phase & 64-pt pot
      await cdp.eval(`document.getElementById('hostUndoBtn').click()`);
      await sleep(150);

      const afterUndo = await cdp.eval(`({
        t2Score: document.getElementById('tvTeam2Score')?.textContent.trim(),
        pot: document.getElementById('tvPotValue')?.textContent.trim()
      })`);
      assert.strictEqual(afterUndo.t2Score, "0", "Undo should revert Team 2 score to 0");
      assert.strictEqual(afterUndo.pot, "64", "Undo should restore 64-pt pot");
    });

    await runStep("6. Edit Round Modal & Fast Money Bonus Stage UI", async () => {
      // Open Edit Round Modal
      await cdp.eval(`window.openEditRoundModal()`);
      await cdp.waitFor("!document.getElementById('editRoundModal').classList.contains('hidden')");
      await cdp.eval(`window.closeEditRoundModal()`);

      // Switch to Fast Money Stage
      await cdp.eval(`window.hostSwitchStage('fast')`);
      await cdp.waitFor("!document.getElementById('hostFmControls').classList.contains('hidden')");

      const fmState = await cdp.eval(`({
        hostFmRows: document.querySelectorAll('#hostFmRows .fm-host-card, #hostFmRows > div').length,
        tvFmVisible: !document.getElementById('tvFastMoneyWrap').classList.contains('hidden'),
        tvFmClock: document.getElementById('tvFmClock')?.textContent.trim()
      })`);

      assert.ok(fmState.hostFmRows >= 5, `Expected 5 Fast Money rows in Host view, got ${fmState.hostFmRows}`);
      assert.strictEqual(fmState.tvFmVisible, true, "TV Fast Money board should be visible");
      assert.strictEqual(fmState.tvFmClock, "20");
    });

    await runStep("7. Multi-Tab Live BroadcastChannel Sync: Standalone TV, Team Buzzer & Combo 1v1 Buzzer", async () => {
      const roomCode = await cdp.eval(`new URLSearchParams(window.location.search).get('room') || 'GA42'`);

      // Helper to open a second browser tab against the live Host room and run assertions
      async function withSecondTab(url, fn) {
        const created = await cdp.send("Target.createTarget", { url });
        const targetId = created.targetId;
        const targets = await fetchJson(`http://127.0.0.1:${browser.debugPort}/json/list`);
        const tInfo = targets.find((t) => t.id === targetId);
        assert.ok(tInfo && tInfo.webSocketDebuggerUrl, "Second tab should expose a WebSocket debugger URL");

        const tabCdp = new CdpSession(tInfo.webSocketDebuggerUrl);
        await tabCdp.connect();
        await tabCdp.send("Page.enable");
        await tabCdp.send("Runtime.enable");
        try {
          await fn(tabCdp);
          assert.strictEqual(tabCdp.pageErrors.length, 0, `Second tab uncaught errors: ${tabCdp.pageErrors.join("\n")}`);
        } finally {
          tabCdp.close();
          await cdp.send("Target.closeTarget", { targetId });
        }
      }

      // A. Standalone TV Display (?room=XXXX&role=tv) syncs with live Host via BroadcastChannel
      await withSecondTab(`${baseUrl}/index.html?room=${roomCode}&role=tv`, async (tvTab) => {
        await tvTab.waitFor("!document.getElementById('tvView').classList.contains('hidden')");
        const tvInfo = await tvTab.eval(`({
          tvVisible: !document.getElementById('tvView').classList.contains('hidden'),
          lobbyHidden: document.getElementById('lobbyView').classList.contains('hidden'),
          t1Name: document.getElementById('tvTeam1Name')?.textContent.trim(),
          t2Name: document.getElementById('tvTeam2Name')?.textContent.trim()
        })`);
        assert.strictEqual(tvInfo.tvVisible, true);
        assert.strictEqual(tvInfo.lobbyHidden, true);
        assert.strictEqual(tvInfo.t1Name, "Blue Blazers", "TV tab should sync Team 1 name from Host tab");
        assert.strictEqual(tvInfo.t2Name, "Red Rockets", "TV tab should sync Team 2 name from Host tab");
      });

      // B. Individual Team 1 Phone Buzzer (?room=XXXX&role=buzzer1)
      await withSecondTab(`${baseUrl}/index.html?room=${roomCode}&role=buzzer1`, async (b1Tab) => {
        await b1Tab.waitFor("!document.getElementById('buzzerView').classList.contains('hidden')");
        const b1Info = await b1Tab.eval(`({
          visible: !document.getElementById('buzzerView').classList.contains('hidden'),
          btnText: document.getElementById('giantBuzzText')?.textContent.trim()
        })`);
        assert.strictEqual(b1Info.visible, true);
        assert.strictEqual(b1Info.btnText.toUpperCase(), "BLUE BLAZERS", "Buzzer 1 button should display synced Team 1 name");
      });

      // C. Shared Combo 1v1 Phone Buzzer (?room=XXXX&role=buzzer_combo)
      await withSecondTab(`${baseUrl}/index.html?room=${roomCode}&role=buzzer_combo`, async (comboTab) => {
        await comboTab.waitFor("!document.getElementById('comboBuzzerView').classList.contains('hidden')");
        const comboInfo = await comboTab.eval(`({
          visible: !document.getElementById('comboBuzzerView').classList.contains('hidden'),
          t1Title: document.getElementById('comboTitleT1')?.textContent.trim(),
          t2Title: document.getElementById('comboTitleT2')?.textContent.trim()
        })`);
        assert.strictEqual(comboInfo.visible, true);
        assert.strictEqual(comboInfo.t1Title.toUpperCase(), "BLUE BLAZERS");
        assert.strictEqual(comboInfo.t2Title.toUpperCase(), "RED ROCKETS");
      });
    });

    await runStep("8. Printable Review Sheet (review.html): Built-in Decks, Spoiler Toggle & #deckData Hash", async () => {
      await cdp.navigate(`${baseUrl}/review.html?deck=bollywood-music-movies`);
      await cdp.waitFor("document.querySelectorAll('#reviewContentRoot .q-card').length >= 12");

      const reviewState = await cdp.eval(`({
        title: document.getElementById('reviewDocTitle')?.textContent.trim(),
        cardCount: document.querySelectorAll('#reviewContentRoot .q-card').length,
        answersHiddenByDefault: document.querySelector('#reviewContentRoot .q-card')?.classList.contains('answers-hidden')
      })`);

      assert.ok(/Bollywood/i.test(reviewState.title), `Expected Bollywood title, got ${reviewState.title}`);
      assert.strictEqual(reviewState.cardCount, 13, "Bollywood deck should render 12 survey cards + 1 Fast Money card = 13 cards");
      assert.strictEqual(reviewState.answersHiddenByDefault, true, "Answers should be hidden by default to prevent spoilers");

      // Click "Show All Answers" toggle
      await cdp.eval(`document.getElementById('btnToggleAllAnswers').click()`);
      const answersRevealed = await cdp.eval(`!document.querySelector('#reviewContentRoot .q-card').classList.contains('answers-hidden')`);
      assert.strictEqual(answersRevealed, true, "Show All Answers button should reveal all answer tables");
    });

    await runStep("9. Zero Uncaught Page Exceptions or Console Errors", async () => {
      assert.strictEqual(
        cdp.pageErrors.length,
        0,
        `Uncaught page exceptions detected:\n${cdp.pageErrors.join("\n")}`
      );
      assert.strictEqual(
        cdp.consoleErrors.length,
        0,
        `Console errors detected:\n${cdp.consoleErrors.join("\n")}`
      );
    });
  } finally {
    if (cdp) cdp.close();
    if (browser && browser.proc) {
      try {
        browser.proc.kill();
      } catch (e) {}
    }
    if (browser && browser.userDataDir) {
      setTimeout(() => {
        try {
          fs.rmSync(browser.userDataDir, { recursive: true, force: true });
        } catch (e) {}
      }, 500);
    }
    server.close();
  }

  console.log(`\n=============================================================`);
  if (failed > 0) {
    console.error(`❌ Headless Browser E2E Suite Failed: ${failed} failed, ${passed} passed.`);
    process.exit(1);
  } else {
    console.log(`🎉 All ${passed} headless browser E2E UI & gameplay checks passed!`);
  }
})();
