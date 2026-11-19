# AGENT.md — Party Feud Development Guide

This document summarizes the architecture, priorities, coding style, and development workflow for **Party Feud** (`feud/`).

---

## 1. Project Goals & Priorities

1. **Zero-Backend Static Portability:**
   - Must run directly on **GitHub Pages (`https://`)**, local HTTP servers (`http://localhost` / LAN IP), and **offline via `file://`** (no build step, bundler, or Node server required).
2. **Reliable Dual-Screen & Remote Play:**
   - **Offline / Same-Device:** `BroadcastChannel` + `localStorage` for instant Host + HDMI TV Display dual-window sync.
   - **Cross-Device (Shared Wi-Fi & Remote):** `Trystero` (WebRTC P2P via multi-relay Nostr `wss://` signaling on `https://`) with automatic **MQTT-over-WSS** fallback (`http://` LAN servers or `!crypto.subtle`), plus optional Firebase Firestore in `js/sync.js`.
3. **Strict Standard Family Feud Gameplay:**
   - Phase-gated workflow (`faceoff-ready` → `faceoff-buzz` → `faceoff-p1` → `faceoff-p2` → `pass-or-play` → `playing` → `steal` → `round-over` → `winner`), plus optional **Sudden-Death Tie-Breaker** (`#1` answer wins) and **Fast Money**.
   - **Undo (`↩️`)** via snapshot stack (`pushUndoSnapshot()`).
4. **Host Ergonomics & Visibility:**
   - **Always keep the Host Question & Answer Key fully visible** (never hidden inside an internal scroll).
   - Keep the **TV Display** cleanly framed in 16:9 (both standalone and embedded inside Host View via `updateEmbeddedTvScale()`).
   - Preserve active sessions across page reloads via `?room=CODE&role=...` URL parameters.

---

## 2. Architecture & File Map

| File | Responsibility |
| :--- | :--- |
| `index.html` | App shell, Lobby, TV Display, Host Remote, Team/Combo Buzzers, Modals, and `?v=` cache-busted script/CSS includes |
| `review.html` | Standalone 2-column printable question review sheet & `Used`/`Unused` round manager (`?deck=...`) |
| `css/styles.css` | All styling, responsive breakpoints, 16:9 TV scaling, Host layout, and full-viewport `100dvh` Buzzer/Combo Buzzer layouts |
| `js/app.js` | Controller, UI event handlers, Host phase transitions, timers, keyboard shortcuts, QR modal, URL routing |
| `js/state.js` | Default `roomState` schema, multi-game unplayed round slicer, `localStorage` persistence, deck/round helpers |
| `js/sync.js` | Hybrid sync (`Trystero` WebRTC P2P + MQTT-over-WSS fallback + `BroadcastChannel` + `localStorage` + optional Firebase), `buildBuzzPatch()`, buzzer locking/probing |
| `js/views.js` | Pure DOM renderers for TV Display, Host Remote, Team Buzzers, Combo Buzzer, and TV QR overlay |
| `js/formats.js` | JSON deck parser & exporter (supports native Party Feud JSON, Friendly-Feud JSON, and legacy override schemas) |
| `js/audio.js` | Web Audio API sound synthesizer (no external audio file dependencies) |
| `data/questions.js` | Built-in fallback starter deck |
| `js/decks.js` | Local folder scanner (File System Access API + `webkitdirectory` fallback + IndexedDB/`localStorage` cache), custom `.json` file loader, and HTTP/GitHub Pages deck auto-discovery |

---

## 3. Coding Style & Conventions

- **Namespace Pattern:** All JS modules attach exports onto `window.Feud` inside an IIFE `(function (Feud) { ... })(window.Feud);` using classic `<script>` tags so `file://` works without CORS/module errors. *(External ESM dependencies like `Trystero` are loaded via dynamic `import()` inside `js/sync.js` with graceful fallback.)*
- **State Mutations:**
  - Host state changes must go through `pushRoomPatch(patch)` in `js/app.js` so `localStorage`, `BroadcastChannel`, WebRTC P2P peers, and UI re-renders stay in sync.
  - Buzz resolution must go through `Feud.buildBuzzPatch(state, teamNum)` as the single source of truth so late taps and locked-out phases (`faceoff-ready` before question reveal, or post-first-buzz) are rejected uniformly.
- **Buzzer Exclusivity:**
  - At most **1 Team 1 Buzzer**, **1 Team 2 Buzzer**, or **1 Combo Buzzer** may be active per room.
  - `buzzer_combo` conflicts with both `buzzer1` and `buzzer2` (`buzzerRolesConflict()`), and Lobby / QR buttons must reflect disabled state (`disabled = true`).
- **QR Code, TV Setup & Team Colors:**
  - The inline Lobby setup card (`#gameSetupForm` inside `#lobbyHostCard`, re-mounted inside `#newGameModal` when switching decks mid-session) lets the Host pick TV mode upfront (`Local Window (HDMI)`, `Remote TV (QR)`, or `Host Only`, remembered in `localStorage`). Starting with `Local Window` opens the TV popup synchronously before `await startHostRoomSync()`; starting with `Remote TV (QR)` opens `#qrModal` directly.
  - `#qrModal` is the single unified "Connect TV & Buzzers" modal (opened anytime from Host's clickable `#hostBuzzerStatusPill` button): shows a live TV Display strip (`🖥️ Open Local TV Window` + scannable Remote TV QR) alongside Individual Dual-QR and Combo Buzzer cards (`roomState.tvQrOverlay` projects buzzer QRs onto the TV and auto-clears once connected).
  - `#qrModal` also opens on `file://` with QR blocks hidden and offline HDMI instructions shown; on loopback hosts (`localhost` / `127.0.0.1`), attempts WebRTC LAN IP detection and provides an editable LAN IP override (`localStorage`).
  - Keep team colors consistent across TV, Host, Lobby, and Buzzers: **Team 1 = Blue**, **Team 2 = Red**.
- **Styling & Layout:**
  - Use CSS custom properties (`--gold`, etc.) and `clamp()` / `dvh` units for full-viewport buzzer views.
  - Avoid adding `overflow-y: auto` or fixed height caps that clip Host answers.

---

## 4. Development Workflow

1. **Local Testing:**
   - **Offline HDMI / Dual-Window:** Open `index.html` directly via `file://` (Host auto-opens TV window).
   - **Cross-Device / QR Testing:** Serve the repo over HTTP (e.g. `python -m http.server 5500 --bind 0.0.0.0` or VS Code Live Server) and open `http://<LAN-IP>:5500/` or deploy to GitHub Pages (`https://`).
2. **Cache-Busting (Required on Every Edit):**
   - Whenever modifying `css/styles.css` or any file in `js/` or `decks/`, increment the `?v=YYYYMMDDxx` query string on **both** `<link rel="stylesheet" href="./css/styles.css?v=..." />` and all `<script src="./...?v=...">` tags in `index.html`.
   - Remind users to hard-reload (`Ctrl + Shift + R`) when testing `file://` or cached tabs.
3. **Documentation Sync:**
   - Keep `README.md` accurate whenever user-facing features, modes, or controls are added, changed, or temporarily disabled.
4. **Verification Checklist:**
   - Check `git status -s` / `git diff` before finishing.
   - Verify Host View (Wizard + un-scrolled Answer Key + embedded 16:9 TV monitor) on desktop and mobile widths.
   - Verify Face-Off flow (`faceoff-ready` → reveal → buzz → `faceoff-p1` wrong-guess auto-timer → `faceoff-p2` → `pass-or-play` → `playing` → 3 strikes `steal` → `round-over`).
   - Do not claim browser or automated tests passed unless actually executed after the final edit.
