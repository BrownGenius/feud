# 🎉 Party Feud — 4-Phone Multiplayer Game Engine

A zero-backend, 4-device multiplayer **Party Feud** game show web app built to run directly on **GitHub Pages** (or locally by opening `index.html`)—complete with a PIN-locked **Host Remote**, a 16:9 **TV Display Board**, **2 Live Team Podium Buzzers**, an optional **Fast Money Bonus Round**, a **Multi-Game Unplayed Round Slicer**, and universal **CSV / JSON Deck Import & Export**.

---

## ✨ Features

* **📱 4-Phone Live Multiplayer on Static GitHub Pages**:
  * **Phone 1 (Host Remote)**: PIN-locked secret answer key, round selector, strike triggers (`X`, `XX`, `XXX`), player shot-clock timer, 1-tap Fast Money scoring chips, and live question editor.
  * **Phone 2 / Laptop (TV Display)**: Widescreen 16:9 game board with 3D flipping tiles, Web Audio game show sound effects, live buzzer & steal alert banners, and a Match Winner Celebration stage.
  * **Phones 3 & 4 (Team Podium Buzzers)**: Full-screen red/blue buzzer pads with haptic vibration, atomic first-buzz lockout, and 1-scan QR Code room joining.
* **🔄 Multi-Game Party Engine & "Winner Stays On" / "Rematch"**:
  * **Unplayed Round Tracker & Slicer**: Run 4–8+ consecutive games from a large question deck at the same party without ever repeating a question. Tracks played rounds & Fast Money sets in `localStorage`, deals `4`, `5`, `6`, or `All` unused rounds per match (Sequential or Shuffled), and automatically scales point multipliers (`1x → 1x → 2x → 3x`).
  * **🏁 End Match / Next Game Modal**: Crown the match champion on the TV screen with fanfare, then start the next game from the same deck using **👑 1. Winner Stays On**, **🔥 2. Rematch (Same Teams)**, or **👥 3. Two New Teams**.
  * **⚡ Optional Fast Money**: Enable or disable the Fast Money bonus round per game when configuring the room.
* **🔌 Hybrid Zero-Config Sync (`js/sync.js`)**:
  * **PeerJS (WebRTC P2P)** for cross-phone multiplayer over Wi-Fi/cellular with zero database setup.
  * **`BroadcastChannel` + `localStorage`** for 100% offline dual-window play on a single laptop plugged into a TV via HDMI.
  * **Optional Firebase Firestore** hook if you ever want cloud-persisted rooms.
* **📦 Universal CSV & JSON Question Deck Support (`js/formats.js` & `decks/catalog.js`)**:
  * **Auto-Populated GUI Deck Selector**: Bundled decks in `decks/catalog.js` work 100% offline over `file://`, and when hosted on GitHub Pages (`*.github.io`), any new `.json` or `.csv` file committed to the `/decks/` folder is discovered automatically via the GitHub API.
  * **Party Feud Deck JSON (`.json`)**: Configures `gameTitle`, `gameIcon` (emoji), `deckName`, `teamPresets`, `rounds`, and `fastMoney`.
  * **Google Sheets / Excel CSV (`.csv`)**: Import or export spreadsheets in either Wide Format (`Question, Answer 1, Points 1, ...`) or Tidy Format (`Question, Answer, Points`).
  * **`Friendly-Feud` JSON (`.json`)**: 100% compatible with [`joshzcold/Friendly-Feud`](https://github.com/joshzcold/Friendly-Feud) game packs (`rounds[].ans/pnt` & `final_round`).
  * **Direct URL Sharing**: Load any hosted CSV or JSON deck automatically via URL parameters:
    `?deck=https://.../my-questions.json&title=Holiday+Party+Feud&icon=🎉`

---

## 🚀 How to Play

### Mode A: 4-Phone Party Setup (Over Wi-Fi)
1. Open your GitHub Pages URL on **Phone 1 (Host)** and tap **Create New Game Room** to configure your deck, team names, and PIN, generating a 4-character Room Code (e.g., `GA42`).
2. Tap **📱 Join QR** in the top bar (or enter the Room Code manually) so **Phone 2 / Laptop (TV Display)** and **Phones 3 & 4 (Team 1 & Team 2 Podium Buzzers)** can join in one scan.

### Mode B: Laptop + HDMI TV (Offline Dual-Window)
1. Plug your laptop into the TV in **Extended Display** mode.
2. Open two browser windows on your laptop to `index.html` (or your hosted URL):
   * **Window 1 (on your laptop screen)**: Create a Host Room.
   * **Window 2 (dragged onto the TV screen)**: Join that Room Code as **TV Display Screen**.
3. Both windows sync instantaneously via the browser's `BroadcastChannel`—even with Wi-Fi turned off.

### Mode C: Single-Screen Mode (Keyboard Shortcuts)
Click **Play Single-Screen TV Mode** in the lobby to configure your game and launch the TV board directly:
* Press **`Space`** (or click **👁️ Show Q & Start Timer**) to reveal the hidden question and start the player countdown timer.
* Press **`R`** (or click **🔄 Next Player Timer**) to restart the countdown timer for the next team member.
* Press **`T`** to pause or resume the countdown timer.
* **Click any numbered tile** or press keys **`1`–`8`** to flip answers and add to the round pot (automatically stops the running timer).
* Press **`X`** to trigger a Big Red Strike (`C` to clear strikes).
* Press **`←` / `→`** arrow keys to switch between rounds.

---

## 🎙️ Step-by-Step Host Game Flow & Timer Guide

### Quick-Reference Cheat Sheet

| Phase | Host Action (Button or Shortcut) | Automatic Game Flow & TV Behavior |
| :--- | :--- | :--- |
| **1. New Game Setup** | Click **✨ Create New Game Room** or **🎮 Play Single-Screen TV Mode** (or **🆕 New Game**) | Select your question deck, choose **Rounds per Game** (`4`/`5`/`6`/`All`), toggle **Include Fast Money**, enter Team 1 & Team 2 names, and pick the shot-clock (`5s`/`7s`/`10s`/`15s`). |
| **2. Start of Round** | Click **👁️ Show Question & Start Face-Off** (`Space`) | Reveals the question on the TV & Buzzer phones and unlocks the Face-Off buzzers. |
| **3. Face-Off Buzz-In** | Player taps their Podium Buzzer phone (or Host taps **🔔 Team Buzzed First**) | Plays the Face-Off tone, locks out the other team, selects that team (`🎤 Face-Off Turn`), and **automatically starts their answer timer**. |
| **4. Face-Off Turn 1** | Tap their answer (`1`–`8`) or tap **❌ Wrong Answer** (`X`) | • **If `#1` Answer**: That team immediately wins the Face-Off (`Play or Pass?`).<br>• **If `#2`–`#8` Answer or Wrong (`X`)**: Automatically triggers `X` (if wrong), **switches to the other team's Face-Off player**, and starts their timer! |
| **5. Face-Off Turn 2** | Tap 2nd player's answer (`1`–`8`) or tap **❌ Wrong Answer** (`X`) | Automatically compares ranks and advances to **Step 2: Play or Pass** for the higher-ranking team! |
| **6. Play or Pass** | Click **▶️ [Winner] PLAYS Board** or **🔀 PASS Board to [Other Team]** | Assigns board control (`🎯 Playing Board`) and **automatically starts the countdown timer** for the first player down the line. |
| **7. Team Play (`0–3 X`)** | Click **🔄 Ask Next Player (`R`)**, then tap answer (`1`–`8`) or **❌ Wrong (`X`)** | • **Timer hits `0s` (`TIME!`)**: Sounds the time-up alert without forcing a transition—the Host can still tap a board answer, tap **❌ Wrong (`X`)**, or restart the timer!<br>• **Board Swept**: If all answers are revealed, automatically awards the pot to the playing team!<br>• **3rd Strike (`XXX`)**: **Automatically switches teams to Steal Mode** and pre-loads the `15s` Steal Timer! |
| **8. Steal Mode (`15s`)** | Click **⏱️ Start 15s Steal Timer (`R`)**, then tap board answer or **❌ Steal Missed (`X`)** | • **If Answer on Board**: Reveals tile and **automatically awards the pot to the stealing team**!<br>• **If Wrong (`X`)**: Triggers `X` and **automatically awards the pot to the original playing team**! |
| **9. Round Complete** | Click **👁️ Reveal Remaining Answers (No Points)**, then **⏭️ Next Round ▶** | Reveals any remaining unflipped tiles on the TV without affecting scores, then advances to the next round. |
| **10. End Match / Next Game** | Click **🏁 End Match / Next Game** | Displays the **🏆 Match Winner Celebration** on the TV and lets you deal the next batch of unplayed rounds with **👑 Winner Stays On**, **🔥 Rematch**, or **👥 Two New Teams**. |

---

### 1. Creating a New Game (`🆕 New Game Setup`)
When you click **✨ Create New Game Room**, **🎮 Play Single-Screen TV Mode**, or **🆕 New Game** in the top bar, the **New Game Setup** modal walks you through 4 quick steps:
1. **Select Question Deck & Multi-Game Slicer**:
   * Choose any deck from the dropdown (or click **📂 Upload Custom File...**).
   * The **📊 Rounds Unused** badge shows how many questions remain unplayed in that deck across your party session (with a **↺ Reset Used** button to clear history anytime).
   * Choose **Rounds per Game** (`4 Rounds`, `5 Rounds`, `6 Rounds`, or `All Rounds`), **Round Order** (`🎲 Random Unplayed` or `📋 Sequential Unplayed`), and check or uncheck **⚡ Include "Fast Money" Bonus Round in this game**.
2. **Event Icon & Title**: Set your game icon (emoji) and title (auto-populated from your deck JSON).
3. **Team Names**: Enter **Team 1** and **Team 2** names (or click **🎲 Swap Preset Names** to cycle through your deck's `teamPresets`).
4. **Player Answer Timer & Host PIN**: Select the default shot-clock countdown per player (`5s`, `7s`, `10s`, or `15s`) and set your 4-digit Host PIN.

---

### 2. Starting a Round & The Face-Off (Hidden Question → Reveal & Start Timer)
1. **Mystery Question State**: Whenever a new round is selected, the question prompt on the **TV Display** and **Podium Buzzer phones** starts **hidden** (`🔒 Question Hidden — Get Ready for the Face-Off!`) so players cannot read ahead while walking up to the podium. Meanwhile, the **Host Remote** always displays the full question and answer key.
2. **Reveal Question & Start Timer**: Once one player from each team is ready at the podium, the Host clicks **👁️ Show Question & Start Timer (`Space`)** and reads the question aloud:
   * The question immediately appears on the TV and Buzzer phones.
   * The **Player Answer Timer** starts counting down from your chosen duration (e.g., `10s`).
3. **Buzzing In**:
   * The first player to slap their **Team Podium Buzzer** phone locks out the other team, triggers the Face-Off tone on the TV, and **automatically restarts the Player Answer Timer** so they have a full clock to give their answer.
   * **Correct Answer**: If their answer is on the board, the Host taps that answer on the Host Remote (`1`–`8`). The tile flips on the TV with a *Ding!*, points are added to the Round Pot, and the **timer automatically stops**.
   * **Not #1 Answer**: If the first player's answer is not the `#1` answer (or misses the board), the Host taps **🔄 Next Player / Restart Timer (`R`)** to give the second Face-Off player their countdown to beat it.
   * **Pass or Play**: Whichever team wins the Face-Off chooses to **Play** or **Pass**. The Host taps **🎯 T1 Playing** or **🎯 T2 Playing** under **Board Control** so the TV highlights the active team.

---

### 3. Going Down the Line (Asking Each Team Member)
As the Host goes down the line asking each member of the playing team for an answer:
1. **Start Next Player's Clock**: Each time you ask the next team member the question, tap **🔄 Next Player / Restart Timer** (or press **`R`**). The timer resets to full duration (`10s`, `7s`, etc.) and immediately counts down (playing a clock tick during the final 5 seconds).
2. **If the Player Answers in Time**:
   * **On the Board**: Tap the matching answer button (`1`–`8`). The tile flips on the TV, points add to the Round Pot, and the timer stops automatically.
   * **Wrong Answer**: Tap **`X`** (`XX`, `XXX`) under **Wrong Answer Strikes** (or press **`X`**). The Big Red `X` and buzzer honk fire on the TV, the strike counter increments, and the timer stops.
3. **If the Timer Hits `0` (`TIME!`)**:
   * The TV and Host Remote automatically sound the buzzer honk and flash `TIME!`. The Host can then tap **`X`** to issue a strike and tap **🔄 Next Player / Restart Timer (`R`)** for the next player.
4. **Pausing or Adjusting the Timer Anytime**:
   * **▶️ Start / Pause (`T`)**: Pause the clock if you need a moment to judge a close answer, and tap again to resume.
   * **⏹️ Stop & Reset**: Stop the countdown and reset it to full duration without starting it.
   * **`5s` / `7s` / `10s` / `15s` Buttons**: Switch the shot-clock duration on the fly.

---

### 4. Three Strikes & The Steal
1. Once the playing team gets **3 Strikes (`XXX`)**:
   * If a team was marked as **🎯 Playing Board**, the TV automatically displays a pulsing **`🚨 STEAL OPPORTUNITY: [Opposing Team]!`** banner and pre-loads the shot-clock to **`15s`**.
2. **Steal Huddle Timer**: Click **🔄 Next Player / Restart Timer (`R`)** to start the 15-second huddle countdown on the TV for the opposing team's single Steal attempt.
3. **Resolving the Round**:
   * **If the Steal Succeeds**: Tap the matching answer on the Host Remote so it flips and adds to the pot, then click **Award Pot** under the stealing team.
   * **If the Steal Misses**: Tap **`X`** for the buzzer sound, then click **Award Pot** under the original playing team.
4. **Reveal Remaining Answers**: Click **Reveal All (No Pot Add)** so everyone can see the remaining unflipped answers on the TV without affecting the score, then click **Next ▶** to advance to the next round!

---

### 5. Fast Money Bonus Round (`⚡ Fast Money` — Optional)
If **Include "Fast Money" Bonus Round** was checked during game setup:
1. Click **⚡ Fast Money** on the Host Remote to switch the TV to the Fast Money board.
2. **Player 1 (20 Seconds)**: Player 2 steps out of the room/earshot. Click **`20s`** and **Start** to run the 20-second clock.
3. **1-Tap Answer & Score Chips**: Beneath each Fast Money question on the Host Remote, tap any survey chip (e.g., `[Turkey • 38]` or `[❌ 0 Pts]`) to auto-fill both the answer text and points in one tap (or type a custom answer and tap the matching score chip). Tapping `[❌ 0 Pts]` (or entering `0`) triggers the zero-point buzzer honk, while positive points play the reveal ding!
4. **Hide Player 1 & Run Player 2 (25 Seconds)**: Click **🙈 Hide/Show P1** so Player 1's answers are hidden on the TV, bring Player 2 back, click **`25s`**, and click **Start**. If Player 2 gives an identical answer to Player 1, tap **Dup ❌** to sound the duplicate-answer buzzer!

---

### 6. Ending a Match & Running Multiple Games at a Party (`🏁 End Match / Next Game`)
When a game finishes:
1. Click **🏁 End Match / Next Game** on the Host Remote (or top bar).
2. **TV Winner Celebration**: The TV automatically transitions to the **🏆 Match Champion Celebration Screen** with fanfare and final scores.
3. **Start Next Game (Same Deck, Unplayed Rounds)**:
   * **👑 1. Winner Stays On**: Keeps the winning team as Team 1 (resetting scores to `0` for the new match) and prompts you for the **New Challenger Team (Team 2)** name.
   * **🔥 2. Rematch (Same Teams)**: Keeps both **Team 1** and **Team 2** in their existing slots, resets scores to `0`, and deals a fresh set of unplayed rounds.
   * **👥 3. Two New Teams**: Prompts for two fresh team names (or lets you click **🎲 Swap Preset Pair**).
   * Click **🚀 Deal Next Unplayed Rounds & Start Match** to immediately deal the next slice of unused rounds and Fast Money questions—without needing any players to reconnect their phones!

---

## 📊 Deck JSON Schema & Adding New Decks to `/decks/`

A Party Feud Deck JSON file lets you customize the game title, emoji icon, deck name, team presets, rounds, and Fast Money questions:

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

### How `/decks/` Discovery Works:
* **On GitHub Pages (`https://<user>.github.io/<repo>/`)**: Any `.json` or `.csv` file you commit to the `decks/` folder is **automatically discovered** via the GitHub Contents API and added to the **Select Question Deck** dropdown!
* **Offline (`file://`)**: Register new decks in [`decks/catalog.js`](./decks/catalog.js) so they work instantaneously without a web server.

---

## 📁 Repository Structure

```text
feud/
├── index.html                      # Main app UI (Lobby, TV, Host, Buzzers, Modals)
├── css/
│   └── styles.css                  # Responsive game show styling & 3D tile animations
├── data/
│   └── questions.js                # Generic default starter deck & configuration
├── js/
│   ├── app.js                      # Controller, keyboard shortcuts & modal handlers
│   ├── state.js                    # State management, multi-game slicer & localStorage
│   ├── sync.js                     # PeerJS (WebRTC) + BroadcastChannel + Firebase sync
│   ├── formats.js                  # Universal CSV, Friendly-Feud JSON & Deck parser/exporter
│   ├── views.js                    # DOM renderers for TV, Host, Solo, and Buzzers
│   └── audio.js                    # Web Audio API synthesizer (no external MP3 dependencies)
└── decks/
    ├── catalog.js                  # Built-in deck registry for offline (file://) + online use
    ├── desi-thanksgiving.json      # 37-Round + 25 Fast Money Desi Thanksgiving Party Pack
    ├── sample-friendly-feud.json   # Sample Friendly-Feud compatible JSON pack
    └── template.csv                # Sample spreadsheet template for Google Sheets / Excel
```

---

## 🌐 Deploying Your Own Copy on GitHub Pages

1. Fork this repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch** → `main` → `/ (root)` and click **Save**.
4. Your live multiplayer Party Feud site will be ready at `https://<your-username>.github.io/<repo-name>/`!

## 📄 License

Released under the [MIT License](./LICENSE).
