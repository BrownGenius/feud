// =====================================================================
// PRINTABLE REVIEW SHEET & INLINE DECK EDITOR (js/review.js)
// =====================================================================

(function () {
  const Feud = window.Feud || {};
  const tagFilterSelect = document.getElementById("reviewDeckTagFilter");
  const deckSelect = document.getElementById("reviewDeckSelect");
  const levelSelect = document.getElementById("reviewLevelFilter");
  const searchInput = document.getElementById("reviewSearchInput");
  const folderInput = document.getElementById("reviewFolderInput");
  const fileInput = document.getElementById("reviewFileInput");
  const btnScanFolder = document.getElementById("btnReviewScanFolder");
  const btnRescanFolder = document.getElementById("btnReviewRescanFolder");
  const btnLoadFile = document.getElementById("btnReviewLoadFile");
  const rootEl = document.getElementById("reviewContentRoot");
  const titleEl = document.getElementById("reviewDocTitle");
  const subEl = document.getElementById("reviewDocSub");
  const pillsEl = document.getElementById("reviewSummaryPills");
  const toggleAllBtn = document.getElementById("btnToggleAllAnswers");
  const statePill = document.getElementById("reviewAnswersStatePill");

  let allAnswersRevealed = false; // Hidden by default
  const revealedCardIds = new Set();

  let activeDeck = {
    gameTitle: (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameTitle) || "Party Feud",
    gameIcon: (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameIcon) || "🎉",
    deckName: (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.deckName) || "Starter Party Deck",
    rounds: Feud.DEFAULT_ROUNDS || [],
    fastMoney: Feud.FAST_MONEY_QUESTIONS || []
  };

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toDeckSlug(id) {
    return String(id || "")
      .trim()
      .replace(/^\.?\/?decks\//i, "")
      .replace(/\.json$/i, "");
  }

  function findCatalogMatch(rawParam, catalog) {
    if (!rawParam) return null;
    if (Feud.findCatalogDeckMatch) {
      const m = Feud.findCatalogDeckMatch(rawParam);
      if (m) return m;
    }
    const clean = String(rawParam).trim();
    const slug = toDeckSlug(clean).toLowerCase();
    return (
      catalog.find((item) => {
        if (item.id.toLowerCase() === clean.toLowerCase()) return true;
        if (toDeckSlug(item.id).toLowerCase() === slug) return true;
        if (item.file && item.file.toLowerCase() === clean.toLowerCase()) return true;
        const dName = (item.data && item.data.deckName) || (item.meta && item.meta.deckName) || "";
        if (dName && toDeckSlug(dName).toLowerCase() === slug) return true;
        const slugifiedName = dName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return Boolean(slugifiedName && slugifiedName === slug);
      }) || null
    );
  }

  function syncUrlToSelection() {
    try {
      const url = new URL(window.location.href);
      const selVal = deckSelect.value;
      if (selVal && selVal !== "__active_saved__" && selVal !== "__uploaded__") {
        url.searchParams.set("deck", toDeckSlug(selVal));
      }
      const lvl = levelSelect.value || "all";
      if (lvl && lvl !== "all") {
        url.searchParams.set("level", lvl);
      } else {
        url.searchParams.delete("level");
      }
      const q = (searchInput.value || "").trim();
      if (q) {
        url.searchParams.set("q", q);
      } else {
        url.searchParams.delete("q");
      }
      if (allAnswersRevealed) {
        url.searchParams.set("answers", "show");
      } else {
        url.searchParams.delete("answers");
      }
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  }

  function updateReviewFolderButtons() {
    const info = Feud.getLocalDecksFolderState
      ? Feud.getLocalDecksFolderState()
      : { hasSavedHandle: false };
    if (btnRescanFolder) {
      btnRescanFolder.style.display = info.hasSavedHandle ? "inline-flex" : "none";
    }
    if (btnScanFolder) {
      btnScanFolder.textContent = info.hasSavedHandle ? "📂 Change Folder" : "📂 Scan Folder";
    }
  }

  function buildTagFilterOptions(catalog) {
    if (!tagFilterSelect) return;
    const curVal = tagFilterSelect.value || "all";
    const defs =
      Array.isArray(Feud.DECK_TAG_DEFINITIONS) && Feud.DECK_TAG_DEFINITIONS.length > 0
        ? Feud.DECK_TAG_DEFINITIONS
        : [{ id: "all", label: "📚 All Decks" }];
    tagFilterSelect.innerHTML = "";
    defs.forEach((def) => {
      const count =
        def.id === "all"
          ? catalog.length
          : catalog.filter((item) => Feud.getDeckTags && Feud.getDeckTags(item).includes(def.id))
              .length;
      if (def.id !== "all" && count === 0) return;
      const opt = document.createElement("option");
      opt.value = def.id;
      opt.textContent = `${def.label} (${count})`;
      if (def.id === curVal) opt.selected = true;
      tagFilterSelect.appendChild(opt);
    });
  }

  function ensureSavedCustomDeckInCatalog() {
    const savedCustom = Feud.loadSavedCustomDeck ? Feud.loadSavedCustomDeck() : null;
    if (!savedCustom || !Array.isArray(savedCustom.rounds) || savedCustom.rounds.length === 0) {
      return null;
    }
    const catalog = Feud.getDeckCatalog ? Feud.getDeckCatalog() : Feud.DECK_CATALOG || [];
    const savedSlug = String(savedCustom.name || "custom-deck")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const deckId = `${savedSlug || "custom-deck"}.json`;
    const existing =
      (Feud.findCatalogDeckMatch && Feud.findCatalogDeckMatch(savedCustom.name)) ||
      catalog.find((c) => {
        if (!c) return false;
        if (c.id && c.id.toLowerCase() === deckId.toLowerCase()) return true;
        const entryName =
          (c.data && c.data.deckName) || (c.meta && c.meta.deckName) || "";
        return Boolean(entryName && entryName === savedCustom.name);
      });
    if (!existing && Feud.upsertCatalogEntries) {
      Feud.upsertCatalogEntries(
        [
          {
            id: deckId,
            label: `${Feud.loadSavedGameIcon ? Feud.loadSavedGameIcon() : "✨"} ${
              savedCustom.name || "Custom Deck"
            }`,
            file: null,
            source: "custom-file",
            data: {
              gameTitle: Feud.loadSavedGameTitle ? Feud.loadSavedGameTitle() : "Party Feud",
              gameIcon: Feud.loadSavedGameIcon ? Feud.loadSavedGameIcon() : "✨",
              deckName: savedCustom.name || "Custom Deck",
              teamPresets: savedCustom.teamPresets || null,
              tags: Array.isArray(savedCustom.tags) ? savedCustom.tags : ["custom"],
              rounds: savedCustom.rounds,
              fastMoney: Array.isArray(savedCustom.fastMoney) ? savedCustom.fastMoney : []
            }
          }
        ],
        { skipSave: true }
      );
    }
    return savedCustom;
  }

  function buildCatalogOptions(preserveSelection = false) {
    const prevVal = preserveSelection ? deckSelect.value : "";
    const savedCustom = ensureSavedCustomDeckInCatalog();
    const catalog = Feud.getDeckCatalog
      ? Feud.getDeckCatalog().slice()
      : Array.isArray(Feud.DECK_CATALOG)
      ? Feud.DECK_CATALOG.slice()
      : [];
    buildTagFilterOptions(catalog);
    const activeTag = (tagFilterSelect && tagFilterSelect.value) || "all";
    const filteredCatalog =
      activeTag === "all"
        ? catalog
        : catalog.filter(
            (item) => Feud.getDeckTags && Feud.getDeckTags(item).includes(activeTag)
          );
    const listToShow = filteredCatalog.length > 0 ? filteredCatalog : catalog;
    deckSelect.innerHTML = "";

    listToShow.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      let labelText = Feud.formatDeckOptionLabel
        ? Feud.formatDeckOptionLabel(item)
        : item.label;
      if (Feud.getDeckPlayStats) {
        const dName =
          item.builtin === "starter"
            ? (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.deckName) || "Starter Party Deck"
            : (item.data && item.data.deckName) ||
              (item.meta && item.meta.deckName) ||
              item.id;
        const dRounds =
          item.builtin === "starter"
            ? Feud.DEFAULT_ROUNDS || []
            : item.data && Array.isArray(item.data.rounds)
            ? item.data.rounds
            : item.meta && Number(item.meta.roundsCount) > 0
            ? new Array(Number(item.meta.roundsCount)).fill({})
            : [];
        if (item.builtin === "starter" || dRounds.length > 0) {
          const st = Feud.getDeckPlayStats({ customDeck: { name: dName, rounds: dRounds } });
          labelText +=
            st.usedRoundsCount > 0 ? ` (${st.usedRoundsCount} Used)` : " (All Unused)";
        }
      }
      opt.textContent = labelText;
      deckSelect.appendChild(opt);
    });

    if (savedCustom && Array.isArray(savedCustom.rounds) && savedCustom.rounds.length > 0) {
      const alreadyInCatalog = catalog.some(
        (c) =>
          (c.data && c.data.deckName === savedCustom.name) ||
          toDeckSlug(c.id).toLowerCase() === toDeckSlug(savedCustom.name).toLowerCase()
      );
      if (!alreadyInCatalog) {
        const opt = document.createElement("option");
        opt.value = "__active_saved__";
        opt.textContent = `⭐ Saved Custom Deck: ${savedCustom.name || "Custom Deck"} (${savedCustom.rounds.length} Rounds)`;
        deckSelect.prepend(opt);
      }
    }

    if (preserveSelection && prevVal) {
      const matchedPrev = findCatalogMatch(prevVal, catalog);
      if (matchedPrev) {
        deckSelect.value = matchedPrev.id;
        return null;
      }
      if (Array.from(deckSelect.options).some((o) => o.value === prevVal)) {
        deckSelect.value = prevVal;
        return null;
      }
      const customOpt = document.createElement("option");
      customOpt.value = prevVal;
      customOpt.textContent = `📄 Deck: ${toDeckSlug(prevVal)}`;
      deckSelect.prepend(customOpt);
      deckSelect.value = prevVal;
      return null;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedDeck = (params.get("deck") || "").trim();
    const requestedLevel = (params.get("level") || "").trim().toLowerCase();
    const requestedQuery = (params.get("q") || "").trim();
    const requestedAnswers = (params.get("answers") || "").trim().toLowerCase();

    allAnswersRevealed =
      requestedAnswers === "show" || requestedAnswers === "1" || requestedAnswers === "true";

    if (
      requestedLevel &&
      Array.from(levelSelect.options).some((o) => o.value === requestedLevel)
    ) {
      levelSelect.value = requestedLevel;
    }
    if (requestedQuery) {
      searchInput.value = requestedQuery;
    }

    if (requestedDeck) {
      const matched = findCatalogMatch(requestedDeck, catalog);
      if (matched) {
        deckSelect.value = matched.id;
        return null;
      }
      // Not in pre-bundled catalog: treat as a direct file in ./decks/ or a remote URL
      const customOpt = document.createElement("option");
      customOpt.value = requestedDeck;
      customOpt.textContent = `📄 Deck: ${toDeckSlug(requestedDeck)}`;
      deckSelect.prepend(customOpt);
      deckSelect.value = requestedDeck;
      return requestedDeck;
    }

    if (Array.from(deckSelect.options).some((o) => o.value === "desi-thanksgiving.json")) {
      deckSelect.value = "desi-thanksgiving.json";
    }
    return null;
  }

  function persistActiveDeckToGameStorage(isStarter) {
    if (!Feud.saveCustomDeck) return;
    if (isStarter) {
      Feud.saveCustomDeck(null);
      if (Feud.saveGameTitle) {
        Feud.saveGameTitle((Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.deckName) || "Starter Party Deck");
      }
      if (Feud.saveGameIcon) {
        Feud.saveGameIcon((Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameIcon) || "🎉");
      }
      return;
    }
    Feud.saveCustomDeck({
      name: activeDeck.deckName,
      teamPresets: activeDeck.teamPresets || null,
      rounds: activeDeck.rounds || [],
      fastMoney: activeDeck.fastMoney || []
    });
    if (Feud.saveGameTitle) {
      Feud.saveGameTitle(activeDeck.deckName || activeDeck.gameTitle || "Party Feud");
    }
    if (Feud.saveGameIcon) {
      Feud.saveGameIcon(activeDeck.gameIcon || "🎉");
    }
  }

  async function loadSelectedDeck(val, updateUrl = true, persistSelection = false) {
    if (updateUrl) {
      revealedCardIds.clear();
      const p = new URLSearchParams(window.location.search);
      const reqAns = (p.get("answers") || "").trim().toLowerCase();
      allAnswersRevealed = reqAns === "show" || reqAns === "1" || reqAns === "true";
    }

    if (val === "__active_saved__") {
      const saved = Feud.loadSavedCustomDeck();
      if (saved) {
        activeDeck = {
          gameTitle: Feud.loadSavedGameTitle ? Feud.loadSavedGameTitle() : "Party Feud",
          gameIcon: Feud.loadSavedGameIcon ? Feud.loadSavedGameIcon() : "🎉",
          deckName: saved.name || "Custom Deck",
          rounds: saved.rounds || [],
          fastMoney: saved.fastMoney || Feud.FAST_MONEY_QUESTIONS || []
        };
        renderReviewSheet();
        return;
      }
    }

    ensureSavedCustomDeckInCatalog();
    const catalog = Feud.getDeckCatalog
      ? Feud.getDeckCatalog()
      : Array.isArray(Feud.DECK_CATALOG)
      ? Feud.DECK_CATALOG
      : [];
    const entry = findCatalogMatch(val, catalog);

    if (entry && entry.builtin === "starter") {
      activeDeck = {
        gameTitle: (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameTitle) || "Party Feud",
        gameIcon: (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameIcon) || "🎉",
        deckName: (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.deckName) || "Starter Party Deck",
        rounds: Feud.DEFAULT_ROUNDS || [],
        fastMoney: Feud.FAST_MONEY_QUESTIONS || []
      };
      if (persistSelection) persistActiveDeckToGameStorage(true);
      if (updateUrl) syncUrlToSelection();
      renderReviewSheet();
      return;
    }

    if (entry && entry.data) {
      const parsed = Feud.parseFeudJson(JSON.stringify(entry.data));
      activeDeck = {
        gameTitle: parsed.gameTitle || "Party Feud",
        gameIcon: parsed.gameIcon || "🎉",
        deckName: parsed.deckName || entry.label,
        teamPresets: parsed.teamPresets || null,
        rounds: parsed.rounds || [],
        fastMoney: parsed.fastMoney || []
      };
      if (persistSelection) persistActiveDeckToGameStorage(false);
      if (updateUrl) syncUrlToSelection();
      renderReviewSheet();
      return;
    }

    // Otherwise load from entry.file, ./decks/<val>.json, or direct URL
    const candidateUrls = [];
    if (entry && entry.file) {
      candidateUrls.push(entry.file);
    } else if (val) {
      if (Feud.resolveDeckCandidateUrls) {
        candidateUrls.push(...Feud.resolveDeckCandidateUrls(val));
      } else if (/^https?:\/\//i.test(val) || val.startsWith("./") || val.startsWith("/")) {
        candidateUrls.push(val);
      } else if (/\.json$/i.test(val)) {
        candidateUrls.push(`./decks/${val}`);
      } else {
        candidateUrls.push(`./decks/${val}.json`);
      }
    }

    for (const fetchUrl of candidateUrls) {
      try {
        const res = await fetch(fetchUrl);
        if (!res.ok) continue;
        const txt = await res.text();
        const parsed = Feud.parseFeudJson(txt);
        activeDeck = {
          gameTitle: parsed.gameTitle || "Party Feud",
          gameIcon: parsed.gameIcon || "🎉",
          deckName: parsed.deckName || toDeckSlug(val),
          teamPresets: parsed.teamPresets || null,
          rounds: parsed.rounds || [],
          fastMoney: parsed.fastMoney || []
        };
        if (persistSelection) persistActiveDeckToGameStorage(false);
        if (updateUrl) syncUrlToSelection();
        renderReviewSheet();
        return;
      } catch (err) {
        console.warn("Could not load deck URL:", fetchUrl, err);
      }
    }

    // Fallback to starter deck if nothing matched
    activeDeck = {
      gameTitle: (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameTitle) || "Party Feud",
      gameIcon: (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.gameIcon) || "🎉",
      deckName: (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.deckName) || "Starter Party Deck",
      rounds: Feud.DEFAULT_ROUNDS || [],
      fastMoney: Feud.FAST_MONEY_QUESTIONS || []
    };
    renderReviewSheet();
  }

  function matchesQuery(roundObj, q) {
    if (!q) return true;
    const needle = q.toLowerCase();
    if ((roundObj.prompt || "").toLowerCase().includes(needle)) return true;
    if ((roundObj.theme || "").toLowerCase().includes(needle)) return true;
    if ((roundObj.title || "").toLowerCase().includes(needle)) return true;
    return (roundObj.answers || []).some((a) =>
      String(a.text || "").toLowerCase().includes(needle)
    );
  }

  function renderReviewSheet() {
    const levelFilter = levelSelect.value || "all";
    const query = (searchInput.value || "").trim();
    const rounds = activeDeck.rounds || [];
    const fmList = activeDeck.fastMoney || [];

    titleEl.textContent = `${activeDeck.gameIcon || "🎉"} ${
      activeDeck.deckName || activeDeck.gameTitle || "Party Feud"
    } — Question & Answer Review`;
    subEl.textContent = "Organized by Point Multiplier Level (1x → 2x → 3x)";

    const groups = [
      {
        id: "1",
        cls: "lvl-1",
        label: "1x Single-Point Questions",
        short: "1x Single",
        filter: (r, isTie) => !isTie && (Number(r.multiplier) || 1) === 1
      },
      {
        id: "2",
        cls: "lvl-2",
        label: "2x Double-Point Questions",
        short: "2x Double",
        filter: (r, isTie) => !isTie && (Number(r.multiplier) || 1) === 2
      },
      {
        id: "3",
        cls: "lvl-3",
        label: "3x Triple-Point Questions",
        short: "3x Triple",
        filter: (r, isTie) => !isTie && (Number(r.multiplier) || 1) >= 3
      },
      {
        id: "tie",
        cls: "lvl-3",
        label: "⚡ Sudden-Death Tie-Breaker Questions",
        short: "Tie-Breakers",
        filter: (r, isTie) => isTie
      }
    ];

    const deckStats = Feud.getDeckPlayStats
      ? Feud.getDeckPlayStats({ customDeck: { name: activeDeck.deckName, rounds } })
      : { playedRounds: [], usedRoundsCount: 0, remainingRoundsCount: rounds.length };
    const playedSet = new Set(deckStats.playedRounds || []);

    // Render top summary pills
    const pillParts = [
      `<span class="summary-pill">Total Rounds: ${rounds.length}</span>`,
      `<span class="summary-pill" style="background:#dcfce7; border-color:#22c55e; color:#166534;">✨ Unused: ${Math.max(
        0,
        rounds.length - playedSet.size
      )}</span>`,
      `<span class="summary-pill" style="background:#fee2e2; border-color:#ef4444; color:#991b1b;">✓ Used: ${playedSet.size}</span>`
    ];
    groups.forEach((grp) => {
      const count = rounds.filter((r) => {
        const isTie =
          /tie-?breaker|sudden\s*death/i.test(r.title || "") ||
          /tie-?breaker|sudden\s*death/i.test(r.theme || "");
        return grp.filter(r, isTie);
      }).length;
      if (count > 0) {
        pillParts.push(`<span class="summary-pill ${grp.cls}">${grp.short}: ${count}</span>`);
      }
    });
    if (fmList.length > 0) {
      pillParts.push(
        `<span class="summary-pill lvl-fm">⚡ Fast Money: ${fmList.length} Qs (${Math.ceil(
          fmList.length / 5
        )} Sets)</span>`
      );
    }
    pillsEl.innerHTML = pillParts.join("");

    let html = "";

    groups.forEach((grp) => {
      if (levelFilter !== "all" && levelFilter !== grp.id) return;

      const matched = [];
      rounds.forEach((r, idx) => {
        const isTie =
          /tie-?breaker|sudden\s*death/i.test(r.title || "") ||
          /tie-?breaker|sudden\s*death/i.test(r.theme || "");
        if (grp.filter(r, isTie) && matchesQuery(r, query)) {
          matched.push({ r, idx });
        }
      });

      if (matched.length === 0) return;

      const cardsHtml = matched
        .map(({ r, idx }) => {
          const cardId = `card-r-${idx}`;
          const isRevealed = allAnswersRevealed || revealedCardIds.has(cardId);
          const hiddenClass = isRevealed ? "" : "answers-hidden";
          const btnText = isRevealed ? "🙈 Hide Answers" : "👁️ Show Answers";

          const mult = Number(r.multiplier) || 1;
          const isUsed = playedSet.has(idx);
          const sumPts = (r.answers || []).reduce((s, a) => s + (Number(a.points) || 0), 0);
          const rowsHtml = (r.answers || [])
            .map((a, aIdx) => {
              const base = Number(a.points) || 0;
              return `
                <tr>
                  <td class="col-rank">#${aIdx + 1}</td>
                  <td class="col-ans">${escapeHtml(a.text)}</td>
                  <td class="col-pts">${base}${
                mult > 1 ? ` <span class="scaled">(${base * mult})</span>` : ""
              }</td>
                </tr>
              `;
            })
            .join("");

          if (editingRoundIdx === idx) {
            const editRowsHtml = (r.answers || [])
              .slice(0, 8)
              .map(
                (a, aIdx) => `
                <div class="inline-edit-ans-row">
                  <span class="inline-edit-rank">#${aIdx + 1}</span>
                  <input type="text" class="inline-edit-input" data-inline-text placeholder="Survey answer…" value="${escapeHtml(a.text || "")}" />
                  <input type="number" class="inline-edit-input" data-inline-pts min="1" max="100" placeholder="Pts" value="${escapeHtml(String(a.points || ""))}" />
                  <button type="button" class="card-edit-btn" data-inline-remove-row title="Remove row">✕</button>
                </div>`
              )
              .join("");
            return `
              <article id="${cardId}" class="q-card is-editing${isUsed ? " is-used" : ""}" data-editing-round="${idx}">
                <div class="q-card-head">
                  <span>✏️ Editing Deck #${idx + 1} • ${escapeHtml(r.title || `Round ${idx + 1}`)}</span>
                  <span data-inline-sum style="font-size:11.5px; font-weight:800; color:${sumPts === 100 ? "#047857" : "#b45309"};">Total: ${sumPts} pts</span>
                </div>
                <div class="inline-edit-body">
                  <div style="display:grid; grid-template-columns:1fr 130px; gap:8px;">
                    <div class="inline-edit-field">
                      <label>Theme / Category</label>
                      <input type="text" class="inline-edit-input" data-inline-theme value="${escapeHtml(r.theme || "")}" />
                    </div>
                    <div class="inline-edit-field">
                      <label>Multiplier</label>
                      <select class="inline-edit-input" data-inline-mult>
                        <option value="1" ${mult === 1 ? "selected" : ""}>1x Single</option>
                        <option value="2" ${mult === 2 ? "selected" : ""}>2x Double</option>
                        <option value="3" ${mult === 3 ? "selected" : ""}>3x Triple</option>
                      </select>
                    </div>
                  </div>
                  <div class="inline-edit-field">
                    <label>Question Prompt</label>
                    <input type="text" class="inline-edit-input" data-inline-prompt value="${escapeHtml(r.prompt || "")}" />
                  </div>
                  <div class="inline-edit-field">
                    <label>Survey Answers &amp; Points (Up to 8)</label>
                    <div data-inline-ans-list style="display:flex; flex-direction:column; gap:6px;">
                      ${editRowsHtml}
                    </div>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-top:2px;">
                    <button type="button" class="card-edit-btn" data-inline-add-ans>+ Add Answer</button>
                    <div style="display:flex; gap:6px;">
                      <button type="button" class="card-edit-btn" data-inline-cancel>Cancel</button>
                      <button type="button" class="toolbar-btn" style="padding:5px 12px; font-size:12px;" data-inline-save>💾 Save</button>
                    </div>
                  </div>
                </div>
              </article>
            `;
          }

          return `
            <article id="${cardId}" class="q-card ${hiddenClass}${isUsed ? " is-used" : ""}">
              <div class="q-card-head">
                <span>Deck #${idx + 1} • ${escapeHtml(r.title || `Round ${idx + 1}`)}</span>
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  <label class="card-used-toggle${isUsed ? " is-used" : ""}" title="${
                    isUsed ? "Click to mark as Unused" : "Click to mark as Used"
                  }">
                    <input type="checkbox" data-used-round="${idx}" ${isUsed ? "checked" : ""} />
                    ${isUsed ? "Used" : "Unused"}
                  </label>
                  <span class="q-mult mult-${mult}">${mult}x Level (${sumPts} pts)</span>
                  <button type="button" class="card-edit-btn" data-edit-round="${idx}" title="Edit this question, answers, and points">
                    ✏️ Edit
                  </button>
                  <button type="button" class="ans-toggle-btn card-header-toggle-btn" data-toggle-card="${cardId}" title="Toggle answers for this question">
                    ${btnText}
                  </button>
                </div>
              </div>
              <div class="q-theme">${escapeHtml(r.theme || "General")}</div>
              <h3 class="q-prompt">${escapeHtml(r.prompt)}</h3>
              <div class="ans-reveal-placeholder">
                <button type="button" class="ans-reveal-bar-btn" data-toggle-card="${cardId}">
                  👁️ Reveal ${r.answers.length} Survey Answers
                </button>
              </div>
              <div class="ans-table-wrap">
                <table class="ans-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Survey Answer</th>
                      <th style="text-align:right;">Pts${mult > 1 ? ` (${mult}x)` : ""}</th>
                    </tr>
                  </thead>
                  <tbody>${rowsHtml}</tbody>
                </table>
              </div>
            </article>
          `;
        })
        .join("");

      html += `
        <section class="level-section">
          <h2 class="level-heading ${grp.cls}">
            ${escapeHtml(grp.label)}
            <span>${matched.length} Question${matched.length === 1 ? "" : "s"}</span>
          </h2>
          <div class="cards-grid">${cardsHtml}</div>
        </section>
      `;
    });

    // Fast Money section
    if ((levelFilter === "all" || levelFilter === "fm") && fmList.length > 0) {
      const totalSets = Math.ceil(fmList.length / 5);
      let setsHtml = "";
      let visibleSets = 0;

      for (let s = 0; s < totalSets; s++) {
        const slice = fmList.slice(s * 5, s * 5 + 5).filter((fm) => {
          if (!query) return true;
          const needle = query.toLowerCase();
          return (
            String(fm.prompt || "").toLowerCase().includes(needle) ||
            String(fm.hint || "").toLowerCase().includes(needle)
          );
        });
        if (slice.length === 0) continue;
        visibleSets++;

        const cardId = `card-fm-${s}`;
        if (editingFmSetIdx === s) {
              const fmEditRows = slice
                .map(
                  (fm, i) => `
                  <div class="inline-edit-field" style="padding:8px; border:1px solid #fde68a; border-radius:8px; background:#fff;" data-inline-fm-row="${s * 5 + i}">
                    <label>Question #${i + 1}</label>
                    <input type="text" class="inline-edit-input" data-inline-fm-prompt value="${escapeHtml(fm.prompt || "")}" placeholder="Fast Money question…" />
                    <input type="text" class="inline-edit-input" data-inline-fm-hint value="${escapeHtml((fm.hint || "").replace(/^Top\s*Answers:\s*/i, ""))}" placeholder="Top answers hint (e.g. Cheese (42), Pepperoni (30))…" />
                  </div>`
                )
                .join("");
              setsHtml += `
                <article id="${cardId}" class="q-card fm-card is-editing" data-editing-fm-set="${s}">
                  <div class="q-card-head">
                    <span>✏️ Editing Fast Money Set #${s + 1}</span>
                    <span class="q-mult">${slice.length} Questions</span>
                  </div>
                  <div class="inline-edit-body">
                    ${fmEditRows}
                    <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:2px;">
                      <button type="button" class="card-edit-btn" data-inline-fm-cancel>Cancel</button>
                      <button type="button" class="toolbar-btn" style="padding:5px 12px; font-size:12px;" data-inline-fm-save>💾 Save</button>
                    </div>
                  </div>
                </article>
              `;
              continue;
            }
        const isRevealed = allAnswersRevealed || revealedCardIds.has(cardId);
        const hiddenClass = isRevealed ? "" : "answers-hidden";
        const btnText = isRevealed ? "🙈 Hide Answers" : "👁️ Show Answers";

        const rowsHtml = slice
          .map(
            (fm, i) => `
              <tr>
                <td class="col-rank">Q${i + 1}</td>
                <td class="col-ans">
                  <strong>${escapeHtml(fm.prompt)}</strong>
                  ${
                    fm.hint
                      ? `<div class="fm-hint">Top Answers: ${escapeHtml(
                          fm.hint.replace(/^Top\s*Answers:\s*/i, "")
                        )}</div>`
                      : ""
                  }
                </td>
              </tr>
            `
          )
          .join("");

        setsHtml += `
          <article id="${cardId}" class="q-card fm-card ${hiddenClass}">
            <div class="q-card-head">
              <span>⚡ Fast Money Set #${s + 1}</span>
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="q-mult">${slice.length} Questions</span>
                <button type="button" class="card-edit-btn" data-edit-fm-set="${s}" title="Edit Fast Money Set #${s + 1}">✏️ Edit</button>
                <button type="button" class="ans-toggle-btn card-header-toggle-btn" data-toggle-card="${cardId}" title="Toggle top answers for this set">
                  ${btnText}
                </button>
              </div>
            </div>
            <div class="ans-reveal-placeholder fm-reveal-placeholder">
              <button type="button" class="ans-reveal-bar-btn" data-toggle-card="${cardId}">
                👁️ Reveal Top Answers for Set #${s + 1}
              </button>
            </div>
            <table class="ans-table" style="margin-top:6px;">
              <tbody>${rowsHtml}</tbody>
            </table>
          </article>
        `;
      }

      if (visibleSets > 0) {
        html += `
          <section class="level-section">
            <h2 class="level-heading lvl-fm">
              ⚡ Fast Money Bonus Questions
              <span>${fmList.length} Questions (${totalSets} Set${totalSets === 1 ? "" : "s"})</span>
            </h2>
            <div class="cards-grid">${setsHtml}</div>
          </section>
        `;
      }
    }

    rootEl.innerHTML =
      html ||
      `<div style="background:#fff; padding:24px; border-radius:12px; text-align:center; color:#475569; font-weight:700;">No questions matched your filter.</div>`;

    updateAnswersStateUI();
  }

  function updateAnswersStateUI() {
    const cards = rootEl.querySelectorAll(".q-card");
    if (cards.length === 0) {
      if (toggleAllBtn) {
        toggleAllBtn.textContent = "👁️ Show All Answers";
        toggleAllBtn.classList.add("secondary");
      }
      if (statePill) {
        statePill.textContent = "🔒 Answers Hidden by Default";
        statePill.className = "answer-status-pill";
      }
      return;
    }

    const hiddenCount = rootEl.querySelectorAll(".q-card.answers-hidden").length;
    const totalCards = cards.length;
    const allVisible = hiddenCount === 0;

    if (toggleAllBtn) {
      if (allVisible) {
        toggleAllBtn.textContent = "🙈 Hide All Answers";
        toggleAllBtn.classList.remove("secondary");
        toggleAllBtn.title = "Hide survey answers across all cards";
      } else {
        toggleAllBtn.textContent = "👁️ Show All Answers";
        toggleAllBtn.classList.add("secondary");
        toggleAllBtn.title = "Reveal survey answers across all cards";
      }
    }

    if (statePill) {
      if (allVisible) {
        statePill.textContent = "👁️ All Answers Revealed";
        statePill.className = "answer-status-pill all-visible";
      } else if (hiddenCount === totalCards) {
        statePill.textContent = "🔒 Answers Hidden by Default";
        statePill.className = "answer-status-pill";
      } else {
        statePill.textContent = `👁️ ${totalCards - hiddenCount} of ${totalCards} Revealed`;
        statePill.className = "answer-status-pill";
      }
    }

    allAnswersRevealed = allVisible;
    syncUrlToSelection();
  }

  function toggleCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const isHidden = card.classList.contains("answers-hidden");
    if (isHidden) {
      card.classList.remove("answers-hidden");
      revealedCardIds.add(cardId);
      const btn = card.querySelector(".card-header-toggle-btn");
      if (btn) btn.textContent = "🙈 Hide Answers";
    } else {
      card.classList.add("answers-hidden");
      revealedCardIds.delete(cardId);
      const btn = card.querySelector(".card-header-toggle-btn");
      if (btn) btn.textContent = "👁️ Show Answers";
    }
    updateAnswersStateUI();
  }

  function toggleAllAnswers() {
    const cards = rootEl.querySelectorAll(".q-card");
    const anyHidden = Array.from(cards).some((c) => c.classList.contains("answers-hidden"));

    if (anyHidden) {
      cards.forEach((card) => {
        card.classList.remove("answers-hidden");
        revealedCardIds.add(card.id);
        const btn = card.querySelector(".card-header-toggle-btn");
        if (btn) btn.textContent = "🙈 Hide Answers";
      });
      allAnswersRevealed = true;
    } else {
      cards.forEach((card) => {
        card.classList.add("answers-hidden");
        const btn = card.querySelector(".card-header-toggle-btn");
        if (btn) btn.textContent = "👁️ Show Answers";
      });
      revealedCardIds.clear();
      allAnswersRevealed = false;
    }
    updateAnswersStateUI();
  }

  deckSelect.addEventListener("change", () => {
    if (hasUnsavedEdits) {
      if (!confirm("You have unsaved round edits. Discard them and switch decks?")) {
        const prevId = (activeDeck && activeDeck.id) || "";
        if (prevId) deckSelect.value = prevId;
        return;
      }
      editingRoundIdx = -1;
      hasUnsavedEdits = false;
    }
    loadSelectedDeck(deckSelect.value, true, true);
  });
  levelSelect.addEventListener("change", () => {
    syncUrlToSelection();
    renderReviewSheet();
  });
  searchInput.addEventListener("input", () => {
    syncUrlToSelection();
    renderReviewSheet();
  });

  const copyBtn = document.getElementById("btnCopyShareUrl");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      syncUrlToSelection();
      const shareUrl = window.location.href;
      try {
        await navigator.clipboard.writeText(shareUrl);
        copyBtn.textContent = "✅ Link Copied!";
        setTimeout(() => {
          copyBtn.textContent = "🔗 Copy Share Link";
        }, 1800);
      } catch (e) {
        window.prompt("Copy this shareable review link:", shareUrl);
      }
    });
  }

  if (toggleAllBtn) {
    toggleAllBtn.addEventListener("click", toggleAllAnswers);
  }

  function setVisibleRoundsUsed(used) {
    if (!activeDeck || !Feud.setAllRoundsUsed) return;
    const boxes = rootEl.querySelectorAll("input[data-used-round]");
    const indices = Array.from(boxes)
      .map((el) => Number(el.getAttribute("data-used-round")))
      .filter((n) => Number.isInteger(n) && n >= 0);
    Feud.setAllRoundsUsed(activeDeck.deckName, indices, used);
    renderReviewSheet();
  }

  const markAllUsedBtn = document.getElementById("btnMarkAllUsed");
  const markAllUnusedBtn = document.getElementById("btnMarkAllUnused");
  if (markAllUsedBtn) {
    markAllUsedBtn.addEventListener("click", () => setVisibleRoundsUsed(true));
  }
  if (markAllUnusedBtn) {
    markAllUnusedBtn.addEventListener("click", () => setVisibleRoundsUsed(false));
  }

  rootEl.addEventListener("change", (e) => {
    const cb = e.target.closest("input[data-used-round]");
    if (cb && activeDeck && Feud.setRoundUsed) {
      const idx = Number(cb.getAttribute("data-used-round"));
      Feud.setRoundUsed(activeDeck.deckName, idx, cb.checked);
      renderReviewSheet();
    }
  });

  let editingRoundIdx = -1;
  let editingFmSetIdx = -1;
  let hasUnsavedEdits = false;

  window.addEventListener("beforeunload", (e) => {
    if (hasUnsavedEdits) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  function updateInlineSum(cardEl) {
    if (!cardEl) return;
    const badge = cardEl.querySelector("[data-inline-sum]");
    if (!badge) return;
    let sum = 0;
    cardEl.querySelectorAll("input[data-inline-pts]").forEach((inp) => {
      const v = parseInt(inp.value, 10);
      if (Number.isFinite(v) && v > 0) sum += v;
    });
    badge.textContent = `Total: ${sum} pts`;
    badge.style.color = sum === 100 ? "#047857" : "#b45309";
  }

  function renumberInlineRows(cardEl) {
    if (!cardEl) return;
    cardEl.querySelectorAll(".inline-edit-ans-row .inline-edit-rank").forEach((el, i) => {
      el.textContent = `#${i + 1}`;
    });
  }

  function appendInlineAnswerRow(cardEl) {
    const list = cardEl?.querySelector("[data-inline-ans-list]");
    if (!list || list.children.length >= 8) return;
    const row = document.createElement("div");
    row.className = "inline-edit-ans-row";
    row.innerHTML = `
      <span class="inline-edit-rank">#${list.children.length + 1}</span>
      <input type="text" class="inline-edit-input" data-inline-text placeholder="Survey answer…" value="" />
      <input type="number" class="inline-edit-input" data-inline-pts min="1" max="100" placeholder="Pts" value="" />
      <button type="button" class="card-edit-btn" data-inline-remove-row title="Remove row">✕</button>
    `;
    list.appendChild(row);
    hasUnsavedEdits = true;
    updateInlineSum(cardEl);
    row.querySelector("input[data-inline-text]")?.focus();
  }

  function startInlineEditFmSet(setIdx) {
    if (!activeDeck || !Array.isArray(activeDeck.fastMoney)) return;
    if (hasUnsavedEdits) {
      if (!confirm("You have unsaved changes. Discard them?")) return;
    }
    editingRoundIdx = -1;
    editingFmSetIdx = setIdx;
    hasUnsavedEdits = false;
    revealedCardIds.add(`card-fm-${setIdx}`);
    renderReviewSheet();
    document.getElementById(`card-fm-${setIdx}`)?.querySelector("[data-inline-fm-prompt]")?.focus();
  }

  function cancelInlineEditFmSet() {
    if (hasUnsavedEdits && !confirm("Discard unsaved Fast Money edits?")) return;
    editingFmSetIdx = -1;
    hasUnsavedEdits = false;
    renderReviewSheet();
  }

  function saveInlineEditFmSet(cardEl) {
    if (editingFmSetIdx < 0 || !activeDeck || !Array.isArray(activeDeck.fastMoney) || !cardEl) return;
    const rows = Array.from(cardEl.querySelectorAll("[data-inline-fm-row]"));
    for (const row of rows) {
      const idx = Number(row.getAttribute("data-inline-fm-row"));
      const prompt = (row.querySelector("[data-inline-fm-prompt]")?.value || "").trim();
      const hint = (row.querySelector("[data-inline-fm-hint]")?.value || "").trim();
      if (!prompt) {
        alert("Please enter a prompt for every Fast Money question.");
        return;
      }
      if (activeDeck.fastMoney[idx]) {
        activeDeck.fastMoney[idx].prompt = prompt;
        activeDeck.fastMoney[idx].hint = hint;
      }
    }
    persistActiveDeckToGameStorage(false);
    revealedCardIds.add(`card-fm-${editingFmSetIdx}`);
    editingFmSetIdx = -1;
    hasUnsavedEdits = false;
    renderReviewSheet();
  }

  function startInlineEditRound(idx) {
    editingFmSetIdx = -1;
    if (!activeDeck || !Array.isArray(activeDeck.rounds) || !activeDeck.rounds[idx]) return;
    if (hasUnsavedEdits && editingRoundIdx !== idx) {
      if (!confirm("You have unsaved changes on the current round. Discard them?")) return;
    }
    editingRoundIdx = idx;
    hasUnsavedEdits = false;
    revealedCardIds.add(`card-r-${idx}`);
    renderReviewSheet();
    const cardEl = document.getElementById(`card-r-${idx}`);
    cardEl?.querySelector("[data-inline-prompt]")?.focus();
  }

  function cancelInlineEditRound() {
    if (hasUnsavedEdits && !confirm("Discard unsaved changes to this round?")) return;
    editingRoundIdx = -1;
    hasUnsavedEdits = false;
    renderReviewSheet();
  }

  function saveInlineEditRound(cardEl) {
    if (editingRoundIdx < 0 || !activeDeck || !activeDeck.rounds[editingRoundIdx] || !cardEl) return;
    const prompt = (cardEl.querySelector("[data-inline-prompt]")?.value || "").trim();
    if (!prompt) {
      alert("Please enter a question prompt.");
      return;
    }
    const answers = [];
    cardEl.querySelectorAll(".inline-edit-ans-row").forEach((row) => {
      const text = (row.querySelector("input[data-inline-text]")?.value || "").trim();
      const pts = parseInt(row.querySelector("input[data-inline-pts]")?.value || "0", 10);
      if (text && Number.isFinite(pts) && pts > 0) {
        answers.push({ text, points: pts });
      }
    });
    if (answers.length === 0) {
      alert("Please include at least 1 answer with points > 0.");
      return;
    }
    const target = activeDeck.rounds[editingRoundIdx];
    target.prompt = prompt;
    target.theme = (cardEl.querySelector("[data-inline-theme]")?.value || "").trim() || "General";
    target.multiplier = parseInt(cardEl.querySelector("[data-inline-mult]")?.value || "1", 10) || 1;
    target.answers = answers;

    persistActiveDeckToGameStorage(false);
    revealedCardIds.add(`card-r-${editingRoundIdx}`);
    editingRoundIdx = -1;
    hasUnsavedEdits = false;
    renderReviewSheet();
  }

  rootEl.addEventListener("input", (e) => {
    const fmCardEl = e.target.closest("[data-editing-fm-set]");
    if (fmCardEl) {
      hasUnsavedEdits = true;
      return;
    }
    const cardEl = e.target.closest("[data-editing-round]");
    if (!cardEl) return;
    hasUnsavedEdits = true;
    updateInlineSum(cardEl);
  });

  rootEl.addEventListener("change", (e) => {
    const cardEl = e.target.closest("[data-editing-round]");
    if (cardEl) hasUnsavedEdits = true;
  });

  rootEl.addEventListener("click", (e) => {
    const fmEditBtn = e.target.closest("[data-edit-fm-set]");
    if (fmEditBtn) {
      const sIdx = Number(fmEditBtn.getAttribute("data-edit-fm-set"));
      if (Number.isFinite(sIdx)) startInlineEditFmSet(sIdx);
      return;
    }
    const fmCardEl = e.target.closest("[data-editing-fm-set]");
    if (fmCardEl) {
      if (e.target.closest("[data-inline-fm-cancel]")) {
        cancelInlineEditFmSet();
        return;
      }
      if (e.target.closest("[data-inline-fm-save]")) {
        saveInlineEditFmSet(fmCardEl);
        return;
      }
    }
    const editBtn = e.target.closest("[data-edit-round]");
    if (editBtn) {
      const idx = Number(editBtn.getAttribute("data-edit-round"));
      if (Number.isFinite(idx)) startInlineEditRound(idx);
      return;
    }
    const cardEl = e.target.closest("[data-editing-round]");
    if (cardEl) {
      if (e.target.closest("[data-inline-add-ans]")) {
        appendInlineAnswerRow(cardEl);
        return;
      }
      if (e.target.closest("[data-inline-remove-row]")) {
        e.target.closest(".inline-edit-ans-row")?.remove();
        hasUnsavedEdits = true;
        renumberInlineRows(cardEl);
        updateInlineSum(cardEl);
        return;
      }
      if (e.target.closest("[data-inline-cancel]")) {
        cancelInlineEditRound();
        return;
      }
      if (e.target.closest("[data-inline-save]")) {
        saveInlineEditRound(cardEl);
        return;
      }
    }
    const btn = e.target.closest("[data-toggle-card]");
    if (btn) {
      const cardId = btn.getAttribute("data-toggle-card");
      if (cardId) toggleCard(cardId);
    }
  });

  function buildActiveDeckExportPayload() {
    if (!activeDeck) return null;
    return {
      gameTitle: activeDeck.gameTitle || "Party Feud",
      gameIcon: activeDeck.gameIcon || "🎉",
      deckName: activeDeck.deckName || "Custom Party Deck",
      boardTheme: activeDeck.boardTheme || undefined,
      teamPresets: activeDeck.teamPresets || undefined,
      rounds: activeDeck.rounds || [],
      fastMoney: activeDeck.fastMoney || []
    };
  }

  function triggerDeckJsonDownload(payload) {
    if (!payload) return;
    const jsonText = Feud.formatDeckJsonLikeOriginal
      ? Feud.formatDeckJsonLikeOriginal(payload, "")
      : JSON.stringify(payload, null, 2) + "\n";
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = String(payload.deckName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "party-feud-deck";
    a.href = url;
    a.download = `${slug}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  document.getElementById("btnSaveToLocalFile")?.addEventListener("click", async () => {
    const payload = buildActiveDeckExportPayload();
    if (!payload) return;
    const btn = document.getElementById("btnSaveToLocalFile");
    const origText = btn ? btn.textContent : "";
    if (Feud.saveDeckToLocalFile) {
      const res = await Feud.saveDeckToLocalFile(activeDeck.id || deckSelect.value, payload);
      if (res && res.ok) {
        if (btn) {
          btn.textContent = `✅ Saved ${res.fileName}`;
          setTimeout(() => { btn.textContent = origText; }, 2200);
        }
        return;
      }
      if (res && res.aborted) return;
    }
    triggerDeckJsonDownload(payload);
  });

  document.getElementById("btnDownloadDeckJson")?.addEventListener("click", () => {
    const payload = buildActiveDeckExportPayload();
    triggerDeckJsonDownload(payload);
  });

  async function handleReviewCustomFileResult(res) {
    if (!res) return;
    if (Array.isArray(res.entries) && res.entries.length > 0) {
      buildCatalogOptions(true);
      updateReviewFolderButtons();
      deckSelect.value = res.entries[0].id;
      await loadSelectedDeck(res.entries[0].id, true, true);
      return;
    }
    if (Array.isArray(res.errors) && res.errors.length > 0) {
      alert(`Could not load deck file: ${res.errors[0].message || "Invalid format"}`);
    }
  }

  if (btnScanFolder) {
    btnScanFolder.addEventListener("click", async () => {
      if (!Feud.canUseDirectoryPicker || !Feud.canUseDirectoryPicker()) {
        if (folderInput) folderInput.click();
        return;
      }
      try {
        const res = await Feud.scanLocalDecksWithDirectoryPicker();
        if (!res || res.cancelled) return;
        if (res.fallbackRequired) {
          if (folderInput) folderInput.click();
          return;
        }
        buildCatalogOptions(true);
        updateReviewFolderButtons();
        if (res.count === 0) {
          alert(`No valid .json decks found in ${res.folderName || "that folder"}.`);
        }
      } catch (err) {
        alert(`Could not scan folder: ${err && err.message ? err.message : "Error"}`);
      }
    });
  }

  if (btnRescanFolder) {
    btnRescanFolder.addEventListener("click", async () => {
      if (!Feud.rescanSavedDecksFolder) return;
      const res = await Feud.rescanSavedDecksFolder();
      if (res.missingHandle) {
        if (btnScanFolder) btnScanFolder.click();
        return;
      }
      if (res.denied) {
        alert("Permission needed to re-read your folder. Click 📂 Change Folder to pick it again.");
        return;
      }
      buildCatalogOptions(true);
      updateReviewFolderButtons();
      await loadSelectedDeck(deckSelect.value, false, false);
    });
  }

  if (folderInput) {
    folderInput.addEventListener("change", async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const res = await Feud.ingestLocalFolderFiles(files);
      e.target.value = "";
      buildCatalogOptions(true);
      updateReviewFolderButtons();
      if (res.count === 0) {
        alert("No valid .json Feud decks found in that folder.");
      }
    });
  }

  if (btnLoadFile) {
    btnLoadFile.addEventListener("click", () => {
      if (!Feud.canUseFilePicker || !Feud.canUseFilePicker()) {
        if (fileInput) fileInput.click();
        return;
      }
      Feud.pickCustomDeckFilesWithPicker()
        .then((res) => {
          if (!res || res.cancelled) return;
          if (res.fallbackRequired) {
            if (fileInput) fileInput.click();
            return;
          }
          return handleReviewCustomFileResult(res);
        })
        .catch((err) => {
          alert(`Could not load file: ${err && err.message ? err.message : "Error"}`);
        });
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const res = await Feud.ingestCustomDeckFiles(files);
      e.target.value = "";
      await handleReviewCustomFileResult(res);
    });
  }

  if (tagFilterSelect) {
    tagFilterSelect.addEventListener("change", () => {
      buildCatalogOptions(false);
      loadSelectedDeck(deckSelect.value, true, false);
    });
  }

  window.addEventListener("feud-decks-updated", () => {
    buildCatalogOptions(true);
    updateReviewFolderButtons();
  });

  buildCatalogOptions(false);
  updateReviewFolderButtons();
  const reviewHash = window.location.hash || "";
  if (reviewHash.includes("deckData=") && Feud.decodeDeckFromUrlHash) {
    Feud.decodeDeckFromUrlHash(reviewHash).then((decoded) => {
      if (decoded && decoded.data) {
        if (Feud.upsertCatalogEntries) Feud.upsertCatalogEntries([decoded]);
        buildCatalogOptions(false);
        deckSelect.value = decoded.id;
        loadSelectedDeck(decoded.id, false, false);
      } else {
        loadSelectedDeck(deckSelect.value, true);
      }
    });
  } else {
    loadSelectedDeck(deckSelect.value, true);
  }
  if (Feud.discoverAvailableDecks) {
    Feud.discoverAvailableDecks();
  }
})();
