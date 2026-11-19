## Summary
<!-- Briefly describe what this Pull Request adds or fixes -->

## Type of Change
- [ ] 🎴 **New / Updated Question Deck** (`decks/*.json`)
- [ ] ✨ **Feature / UX Improvement**
- [ ] 🐛 **Bug Fix**
- [ ] 📖 **Documentation / Screenshots**

## Checklist
- [ ] Ran `node scripts/validate-repo.js` locally (or verified via the **Validate PR & Decks** GitHub Action).
- [ ] **If adding/editing a deck in `decks/*.json`:**
  - [ ] Each round has 4–8 distinct answers ordered highest to lowest, with answer points summing to `100`.
  - [ ] For 4-round games (`1x, 1x, 2x, 3x`), multipliers are balanced (ideally twice as many `1x` rounds as `2x` and `3x`, or equal counts).
- [ ] **If modifying `css/styles.css`, `sw.js`, or any file in `js/`:**
  - [ ] Incremented the cache-busting `?v=YYYYMMDDx` version string across `index.html` (CSS link, `#appBuildBadge`, and all `<script>` tags), `review.html` (`<script>` tags), and `sw.js` (`CACHE_NAME`).
