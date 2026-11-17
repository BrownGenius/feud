# 🎉 Party Feud — Host Your Own Live Game Show

Turn your TV, laptop, and phones into a real **Family Feud–style party game show** in seconds — no app installs, no accounts, and no setup headaches.

Pick a ready-made question pack, cast or plug in a TV, hand phones to both teams as live buzzers (or share one phone in the middle for 1v1 **Combo Buzzer** mode), and host like a pro with a built-in teleprompter, game-show sound effects, and one-tap **Undo**.

[![Play Now](https://img.shields.io/badge/🎮_Play_Now-browngenius.github.io%2Ffeud-f59e0b?style=for-the-badge)](https://browngenius.github.io/feud)
[![Question Review](https://img.shields.io/badge/🖨️_Review_Questions-review.html-1e293b?style=for-the-badge)](https://browngenius.github.io/feud/review.html)

---

## 📸 See It in Action

| Lobby & Room Setup | Host Control Screen + Mini TV |
| :---: | :---: |
| ![Lobby View](docs/screenshots/lobby.png) | ![Host Remote](docs/screenshots/host-remote.png) |

| 16:9 TV Display Board | Printable Question Review Sheet |
| :---: | :---: |
| ![TV Display](docs/screenshots/tv-board.png) | ![Question Review Sheet](docs/screenshots/review-sheet.png) |

| Individual Team Buzzer (Phone) | Combo Buzzer (Shared 1v1 Phone) |
| :---: | :---: |
| ![Individual Team Buzzer](docs/screenshots/team-buzzer.png) | ![Combo Buzzer](docs/screenshots/combo-buzzer.png) |

---

## ✨ Why Hosts & Players Love It

* **📺 Real TV Show Presentation:** Big 16:9 board with flipping answer tiles, giant red `X` strike overlays, suspenseful countdown timer, game-show dings/buzzers/fanfare, and a **Match Champion** celebration screen.
* **🎙️ Stress-Free Hosting:** The Host screen shows all survey answers, a **live mini TV preview**, a **step-by-step coach**, a collapsible **Host Script** (`SAY` / `DO`), and a **25-step Undo** button so you can fix any mis-tap instantly.
* **🔔 Phone Buzzers (No App Required):** Scan a QR code from the TV or Host screen to join as **Team 1 Buzzer**, **Team 2 Buzzer**, or **Combo Buzzer** (both teams on one shared phone/iPad facing each other). Buzzers stay locked until you reveal the question!
* **🔄 Play All Night Without Repeats:** Tracks which questions you've already played across multiple games at the same party, includes a **printable Question Review Sheet** (`review.html`), and automatically unlocks a **Sudden-Death Tie-Breaker** if a match ends in a tie.
* **⚡ Optional Fast Money Bonus Round:** Toggle Fast Money on or off for any game, complete with 20s / 25s clocks, hidden Player 1 answers, duplicate-answer buzzers, and 1-tap score chips.

---

## 🚀 Quick Start (Play in 60 Seconds)

### Option 1: Party Setup (TV + Phone Buzzers via QR Code)
1. Open **[Party Feud](https://browngenius.github.io/feud)** on your laptop or tablet and tap **✨ Create New Game Room**.
2. Choose a question deck, enter your team names, and tap **🚀 Start New Game**.
3. Pick how to show the TV board:
   * **Start Local TV Screen Window** (if your laptop is plugged into a TV via HDMI), or
   * **Show QR Code for Remote TV Screen** (scan on a smart TV/casting laptop — it disappears automatically once connected).
4. Tap **📱 Join QR** anytime to put **Individual Buzzers** (Team 1 on the left, Team 2 on the right) or **Combo Buzzer** up on the TV for players to scan.

### Option 2: Laptop + HDMI TV (Works Even Offline)
1. Plug your laptop into your TV in **Extended Display** mode (works even with Wi-Fi turned off by opening `index.html`).
2. Start a room, pick **1. Start Local TV Screen Window**, drag that window onto your TV, and click **⛶ Fullscreen**.

---

## 🎙️ How a Round Works (Host Guide)

1. **Mystery Question → Show Question (`Space`):** New rounds keep the question hidden on the TV so players can't read ahead. Once both podium players are ready, click **👁️ Show Question on TV** (`Space`) — buzzers unlock with no timer running yet.
2. **Face-Off Buzz-In:** First team to buzz gets the shot clock.
   * **`#1` Answer:** Instantly wins the Face-Off!
   * **`#2`–`#8` Answer or Wrong Guess (`❌`):** Flashes 1 temporary `X` (without adding a round strike) and automatically starts the timer for the opposing player to try to beat it.
3. **Play or Pass:** The Face-Off winner chooses **▶️ PLAY** or **🔀 PASS**.
4. **Going Down the Line (`R` / `X`):** Press **`R`** to start each player's clock, tap matching answers (`1`–`8`) to flip them into the Round Pot, or press **`X`** for a wrong guess.
   * **Need clarification?** Tap **🔍 Be More Specific** for a gentle double-buzz and `+5s` on the clock.
   * **3 Strikes (`XXX`):** Automatically switches to the opposing team for a **30-second Steal**! If they hit an unrevealed answer, they steal the whole pot; if they miss, the original team keeps it.
5. **Round Over & Winner Screen:** Reveal any remaining unguessed answers (`0 pts`) to the crowd, then click **⏭️ Next Round** — or after the final round, click **🏆 Show Winner Screen** to celebrate and start the next match (**Winner Stays On**, **Rematch**, or **Two New Teams**).

---

## 🛠️ For Developers & Self-Hosting

### 🔌 Hybrid Zero-Config Sync Architecture (`js/sync.js`)
Party Feud runs 100% statically with zero required backend or accounts:
* **Trystero WebRTC P2P (`https://`):** Uses multi-relay Nostr `wss://` signaling on port `443` for the initial WebRTC handshake, then sends all room state and buzzes directly peer-to-peer over `RTCDataChannel`.
* **Automatic MQTT-over-WSS Fallback (`http://` / non-secure contexts):** Automatically falls back to `wss://broker.emqx.io:8084/mqtt` (with `wss://test.mosquitto.org:8081/mqtt` fallback) when running on plain `http://` LAN servers where browsers restrict `crypto.subtle`, or if WebRTC P2P is blocked by strict NAT/firewalls. Strips `pin` and full `customDeck` payloads on MQTT broadcasts and uses MQTT Last Will + 2s/6.5s heartbeats for fast disconnect detection.
* **`BroadcastChannel` + `localStorage`:** Instant zero-network sync for dual-window HDMI / `file://` play, plus `?room=CODE&role=...` URL state preservation on reload.
* **Optional Firebase Firestore:** Drop a `window.FIREBASE_CONFIG` object in to enable cloud-persisted rooms.

---

### 🔄 Host Workflow State Machine (`roundPhase`)

```mermaid
stateDiagram-v2
    [*] --> faceoff_ready : "New Round Selected"

    state "faceoff-ready (Question Hidden)" as faceoff_ready
    state "faceoff-buzz (Waiting for First Buzz)" as faceoff_buzz
    state "faceoff-p1 (Face-Off Turn 1)" as faceoff_p1
    state "faceoff-p2 (Face-Off Turn 2)" as faceoff_p2
    state "pass-or-play (Play or Pass?)" as pass_or_play
    state "playing (Team Play, 0-2 Strikes)" as playing
    state "steal (30s Steal Attempt)" as steal
    state "round-over (Pot Awarded)" as round_over
    state "winner (TV Celebration + Next Match)" as winner

    faceoff_ready --> faceoff_buzz : "Show Question on TV (Space)"
    faceoff_buzz --> faceoff_p1 : "Buzz In (Team 1 or Team 2)"

    faceoff_p1 --> pass_or_play : "Tap #1 Answer"
    faceoff_p1 --> faceoff_p2 : "Tap #2-#8 Answer OR Wrong Guess (1 Temp X)"

    faceoff_p2 --> pass_or_play : "Compare Rank / Wrong Guess"

    pass_or_play --> playing : "Choose PLAY or PASS"

    playing --> playing : "Tap Answer OR Strike 1-2"
    playing --> steal : "3rd Strike (XXX)"
    playing --> round_over : "Board Swept"

    steal --> round_over : "Steal Answer OR Steal Missed"

    round_over --> round_over : "Reveal Remaining Answers (0 pts)"
    round_over --> faceoff_ready : "Next Round"
    faceoff_ready --> faceoff_ready : "Swap / Pick Round (While Hidden)"
    round_over --> winner : "Final Round Complete -> Show Winner Screen"
```

| Phase (`roundPhase`) | Answer Tiles | Primary Host Actions Allowed |
| :--- | :--- | :--- |
| **`faceoff-ready`** | 🔒 Locked | **👁️ Show Question on TV (`Space`)**, or tap the Host question box / round pill to swap or randomize rounds (`1x`/`2x`/`3x` tree) |
| **`faceoff-buzz`** | 🔒 Locked | **🔔 Team A Buzzed** or **🔔 Team B Buzzed** (remote buzzers unlocked) |
| **`faceoff-p1`** | 🔓 Unrevealed clickable | Tap revealed answer (`1`–`8`), **❌ Wrong Guess** (1 Temp X + auto-starts Turn 2 timer), or **🔍 Be More Specific** (`+5s`) |
| **`faceoff-p2`** | 🔓 Unrevealed clickable | Tap 2nd player's answer (`1`–`8`), **❌ Wrong Guess**, or **🔍 Be More Specific** (`+5s`) |
| **`pass-or-play`** | 🔒 Locked | **▶️ PLAY Board** or **🔀 PASS Board** |
| **`playing`** | 🔓 Unrevealed clickable | Tap board answer (`1`–`8`), **❌ Wrong Answer (`X`)**, **🔍 Be More Specific** (`+5s`), or **🔄 Start Timer (`R`)** |
| **`steal`** | 🔓 Unrevealed clickable | **⏱️ Start 30s Steal Timer (`R`)**, tap stolen answer (`1`–`8`), **❌ Steal Missed (`X`)**, or **🔍 Be More Specific** (`+5s`) |
| **`round-over`** | 🔓 Unrevealed clickable (`0 pts`) | **👁️ Reveal Answer #N (0 pts)**, **⏭️ Next Round ▶**, or **🏆 Show Winner Screen** (final round) |

> **Host Shortcuts & Popovers:** Tap any Team Score Card, the Phase Stepper, or the `⏱️` Timer Pill directly to open contextual override popovers.

---

### 📊 Custom Question Decks (`/decks/`, JSON Schema & `review.html`)

A Party Feud Deck JSON file configures `gameTitle`, `gameIcon`, `deckName`, `teamPresets`, `rounds`, and `fastMoney`:

```json
{
  "gameTitle": "Holiday Party Feud",
  "gameIcon": "🎉",
  "deckName": "Holiday Party Pack",
  "teamPresets": [
    ["Team A", "Team B"],
    ["Team Parents", "Team Kids"]
  ],
  "rounds": [
    {
      "theme": "🔥 Live Party Poll",
      "title": "Round 1",
      "multiplier": 1,
      "prompt": "Name something people always do right after finishing a huge meal.",
      "answers": [
        { "text": "Take a nap on the couch", "points": 40 },
        { "text": "Have coffee or tea", "points": 24 }
      ]
    }
  ],
  "fastMoney": [
    {
      "prompt": "Name a pizza topping almost everyone can agree on.",
      "hint": "Cheese (42), Pepperoni (30), Mushrooms (14), Olives (8), Peppers (6)"
    }
  ]
}
```

* **GitHub Pages Auto-Discovery:** Any `.json` or `.csv` file committed to `/decks/` is automatically discovered via the GitHub Contents API.
* **Offline (`file://`):** Register bundled decks in [`decks/catalog.js`](./decks/catalog.js).
* **Direct URL Loading:** `?deck=https://.../my-questions.json&title=Holiday+Party+Feud&icon=🎉`
* **Printable Review & `Used` Tracker:** Open [`review.html`](./review.html) (or `review.html?deck=desi-thanksgiving`) to inspect all rounds/Fast Money sets and toggle `Used` / `Unused` status in `localStorage`.

---

### 📁 Repository Structure

```text
feud/
├── index.html                      # Main app UI (Lobby, TV Display, Host Remote, Buzzers, Modals)
├── review.html                     # Printable 2-column question review sheet (?deck=...)
├── AGENT.md                        # AI/developer workflow, conventions & cache-busting guide
├── css/
│   └── styles.css                  # Responsive game show styling & 3D tile animations
├── data/
│   └── questions.js                # Generic default starter deck & configuration
├── docs/
│   └── screenshots/                # Gameplay screenshots embedded in README.md
├── js/
│   ├── app.js                      # Controller, keyboard shortcuts & modal handlers
│   ├── state.js                    # State management, multi-game slicer & localStorage
│   ├── sync.js                     # Trystero WebRTC P2P + MQTT-WSS + BroadcastChannel + Firebase sync
│   ├── formats.js                  # Universal CSV, Friendly-Feud JSON & Deck parser/exporter
│   ├── views.js                    # DOM renderers for TV Display, Host Remote, and Buzzers
│   └── audio.js                    # Web Audio API synthesizer (no external MP3 dependencies)
└── decks/
    ├── catalog.js                          # Built-in deck registry for offline (file://) + online use
    ├── 2025.json                           # Family Feud 2025 (60 Rounds • 8 Fast Money Sets)
    ├── 2025-family-friendly.json           # Family Feud 2025 (Family-Friendly Edition)
    ├── 2026.json                           # Family Feud 2026 (60 Rounds • 8 Fast Money Sets)
    ├── 2026-family-friendly.json           # Family Feud 2026 (Family-Friendly Edition)
    ├── desi-thanksgiving.json              # 37-Round + 25 Fast Money Desi Thanksgiving Party Pack
    ├── gandhi-samaj-2026.json              # Gandhi Samaj 2026 (43 Rounds • 6 Fast Money Sets)
    ├── gandhi-samaj-2026-meha-edition.json # Gandhi Samaj 2026 (Meha Edition • 21 Rounds)
    ├── sample-friendly-feud.json           # Sample Friendly-Feud compatible JSON pack
    └── template.csv                        # Sample spreadsheet template for Google Sheets / Excel
```

### 🌐 Deploying Your Own Copy on GitHub Pages
1. Fork this repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch** → `main` → `/ (root)` and click **Save**.
4. Your live Party Feud site will be ready at `https://<your-username>.github.io/<repo-name>/`!

## 📄 License

Released under the [MIT License](./LICENSE).
