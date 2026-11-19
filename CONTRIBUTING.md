# 🤝 Contributing to Party Feud

Thanks for helping make **Party Feud** even better! Whether you want to share a themed question deck (no coding required!) or contribute a UI/gameplay improvement, here is how to get started.

---

## 🎴 Option 1: Contribute a Question Deck (No Coding Required)

1. Open **[Party Feud](https://browngenius.github.io/feud)** and click **`✨ AI Deck`** in Step 1 (`1. Question Deck`).
2. Enter your topic, choose the round count (`12` or `24` rounds recommended) and audience style, and click **`📋 Copy AI Prompt`**.
3. Paste the prompt into ChatGPT, Gemini, or Claude, then paste the generated JSON back into the **AI Custom Deck Builder** to validate that all rounds and points parse cleanly.
4. Click **`💾 Download .json`** and either:
   * **Open a Pull Request** adding your `.json` file to the [`decks/`](./decks) folder (GitHub Actions will automatically validate your JSON and update [`decks/manifest.json`](./decks/manifest.json) when merged!), **or**
   * **[Open a Deck Submission Issue](https://github.com/BrownGenius/feud/issues/new?template=submit-deck.yml)** and paste your JSON or `#deckData=...` share link there!

### Deck Guidelines
* **4 to 8 answers per round**, ordered from highest points to lowest, with points per round summing to **`100`**.
* **Multipliers (`1`, `2`, `3`):** Standard 4-round games use two `1x` rounds, one `2x` round, and one `3x` round (`[1x, 1x, 2x, 3x]`), so a `2 : 1 : 1` ratio (or equal `1 : 1 : 1` counts) maximizes unique multi-game play.
* **Optional Tags:** Include `"tags": ["family-friendly"]` (or `"classic"`, `"holidays"`, `"movies-music"`, `"robotics"`) at the top of your JSON so it appears under the right category filter pill.

---

## 🛠️ Option 2: Contribute Code or UX Improvements

Party Feud is a **100% static, zero-build vanilla HTML/CSS/JS** web app that works both on GitHub Pages (`https://`) and offline via `file://`.

### Local Development & Testing
1. Clone the repository and open `index.html` directly in your browser (or serve over HTTP with `npx serve .` or VS Code Live Server to test QR phone buzzers across devices).
2. Read [`AGENT.md`](./AGENT.md) for the module architecture (`js/app.js`, `js/state.js`, `js/sync.js`, `js/views.js`, `js/decks.js`, `js/formats.js`, `js/audio.js`).
3. **Cache-Busting Rule:** Whenever you modify `css/styles.css`, `sw.js`, or any file in `js/`, bump the `?v=YYYYMMDDx` version string in:
   * `index.html` (`<link rel="stylesheet">`, `#appBuildBadge`, and all `<script>` tags)
   * `review.html` (all `<script>` tags)
   * `sw.js` (`CACHE_NAME`)
4. **Run the Validator Before Opening a PR:**
   ```bash
   node scripts/validate-repo.js
   ```
   This verifies JavaScript syntax across all files, checks every `decks/*.json` schema, and confirms all `?v=` cache-busting strings are in sync.
