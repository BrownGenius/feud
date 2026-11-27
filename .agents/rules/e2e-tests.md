# E2E Testing Requirement

- Always add headless browser E2E test coverage in `scripts/test-ui-e2e.js` for **every new feature and bug fix** (and unit tests in `scripts/test-core.js` for state/logic changes).
- Run `node scripts/validate-repo.js`, `node scripts/test-core.js`, and `node scripts/test-ui-e2e.js` after the final edit and verify all suites pass before finishing.
