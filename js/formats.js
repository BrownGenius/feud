// =====================================================================
// UNIVERSAL PARTY FEUD FORMAT PARSER & EXPORTER (js/formats.js)
// Supports:
//  1. Friendly-Feud JSON (joshzcold/Friendly-Feud schema: rounds[].ans/pnt + final_round)
//  2. Standard / Native Feud Deck JSON ({ gameTitle, gameIcon, deckName, teamPresets, rounds, fastMoney })
//  3. Legacy Custom Poll Overrides JSON ({ "0": { prompt, answers } })
//  4. CSV / Spreadsheet Wide Format (Google Sheets, Excel, Standard Survey CSV)
//  5. CSV / Spreadsheet Tidy Format (1 row per answer)
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  function parseFeudJson(jsonText) {
    const data =
      typeof jsonText === "string"
        ? JSON.parse(jsonText.replace(/^\uFEFF/, ""))
        : jsonText;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid JSON content.");
    }

    // Case A: Friendly-Feud format (joshzcold/Friendly-Feud)
    if (
      Array.isArray(data.rounds) &&
      data.rounds.length > 0 &&
      ("question" in data.rounds[0] ||
        (Array.isArray(data.rounds[0].answers) &&
          data.rounds[0].answers[0] &&
          "ans" in data.rounds[0].answers[0]))
    ) {
      const rounds = data.rounds
        .map((r, idx) => {
          const prompt = String(r.question || r.prompt || "").trim();
          const multiplier = Number(r.multiply || r.multiplier) || 1;
          const theme = String(r.theme || r.category || "🎉 Custom Feud Deck").trim();
          const title = String(r.title || `Round ${idx + 1}`).trim();
          const answers = (r.answers || [])
            .map((a) => ({
              text: String(a.ans ?? a.text ?? a[0] ?? "").trim(),
              points: parseInt(a.pnt ?? a.points ?? a[1] ?? 10, 10) || 0
            }))
            .filter((a) => a.text.length > 0);
          return { theme, title, multiplier, prompt, answers };
        })
        .filter((r) => r.prompt && r.answers.length > 0);

      let fastMoney = null;
      if (Array.isArray(data.final_round) && data.final_round.length > 0) {
        fastMoney = data.final_round.map((fm) => {
          const prompt = String(fm.question || fm.prompt || "").trim();
          const hintParts = (fm.answers || []).map((a) => {
            if (Array.isArray(a)) return `${a[0]} (${a[1]})`;
            if (a && typeof a === "object") return `${a.ans || a.text} (${a.pnt ?? a.points ?? 0})`;
            return String(a);
          });
          return {
            prompt,
            hint: hintParts.join(", ") || "Custom Fast Money"
          };
        });
      }

      return {
        kind: "deck",
        formatName: "Friendly-Feud JSON",
        gameTitle: data.gameTitle || data.title || "",
        gameIcon: data.gameIcon || data.icon || "",
        deckName: data.deckName || data.name || "",
        teamPresets: Array.isArray(data.teamPresets) ? data.teamPresets : null,
        rounds,
        fastMoney
      };
    }

    // Case B: Native Full Deck JSON ({ gameTitle, gameIcon, deckName, teamPresets, rounds, fastMoney }) or raw array
    const rawRounds = Array.isArray(data) ? data : Array.isArray(data.rounds) ? data.rounds : null;
    if (rawRounds && rawRounds.length > 0) {
      const rounds = rawRounds
        .map((r, idx) => {
          const prompt = String(r.prompt || r.question || "").trim();
          const multiplier = Number(r.multiplier || r.multiply) || 1;
          const theme = String(r.theme || r.category || "🎉 Custom Feud Deck").trim();
          const title = String(r.title || `Round ${idx + 1}`).trim();
          const answers = (r.answers || [])
            .map((a) => ({
              text: String(a.text ?? a.ans ?? a.answer ?? "").trim(),
              points: parseInt(a.points ?? a.pnt ?? a.score ?? 10, 10) || 0
            }))
            .filter((a) => a.text.length > 0);
          return { theme, title, multiplier, prompt, answers };
        })
        .filter((r) => r.prompt && r.answers.length > 0);

      const fastMoney =
        Array.isArray(data.fastMoney) && data.fastMoney.length > 0
          ? data.fastMoney.map((q) => ({
              prompt: String(q.prompt || q.question || "").trim(),
              hint: String(q.hint || "")
            }))
          : null;

      return {
        kind: "deck",
        formatName: "Party Feud Deck JSON",
        gameTitle: data.gameTitle || data.title || "",
        gameIcon: data.gameIcon || data.icon || "",
        deckName: data.deckName || data.name || "",
        teamPresets: Array.isArray(data.teamPresets) ? data.teamPresets : null,
        rounds,
        fastMoney
      };
    }

    // Case C: Custom Round Overrides Map ({ "0": { prompt, multiplier, answers } })
    const keys = Object.keys(data);
    if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
      return {
        kind: "overrides",
        formatName: "Custom Poll Overrides JSON",
        customRounds: data
      };
    }

    throw new Error("Unrecognized JSON structure. Expected rounds array or Friendly-Feud format.");
  }

  function parseFeudCsv(csvText) {
    const rows = parseCsvRows(String(csvText || "").replace(/^\uFEFF/, ""));
    if (rows.length < 2) {
      throw new Error("CSV must contain a header row and at least 1 data row.");
    }

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const dataRows = rows.slice(1).filter((r) => r.some((cell) => cell.trim() !== ""));

    const hasSingleAnswerCol =
      headers.includes("answer") && !headers.some((h) => /answer\s*1|ans\s*1|^a1$/.test(h));

    if (hasSingleAnswerCol) {
      return parseTidyCsv(headers, dataRows);
    }
    return parseWideCsv(headers, dataRows);
  }

  function parseWideCsv(headers, dataRows) {
    const findCol = (patterns) =>
      headers.findIndex((h) => patterns.some((p) => (typeof p === "string" ? h === p : p.test(h))));

    const qCol = findCol(["question", "prompt", /question/, /prompt/]);
    const themeCol = findCol(["theme", "category", "group", /theme/, /category/]);
    const titleCol = findCol(["title", "round", /round\s*name/]);
    const multCol = findCol(["multiplier", "multiply", "mult", /mult/]);

    const ansPairs = [];
    for (let i = 1; i <= 8; i++) {
      const aIdx = findCol([
        `answer ${i}`,
        `answer${i}`,
        `ans ${i}`,
        `ans${i}`,
        `a${i}`,
        new RegExp(`^(answer|ans)\\s*_?${i}$`)
      ]);
      const pIdx = findCol([
        `points ${i}`,
        `points${i}`,
        `point ${i}`,
        `pts ${i}`,
        `pts${i}`,
        `pnt ${i}`,
        `score ${i}`,
        `p${i}`,
        `#${i}`,
        new RegExp(`^(points?|pts|pnt|score)\\s*_?${i}$`)
      ]);
      if (aIdx !== -1) {
        ansPairs.push({ aIdx, pIdx });
      }
    }

    const effectiveQCol = qCol !== -1 ? qCol : 0;
    if (ansPairs.length === 0) {
      for (let col = effectiveQCol + 1; col < headers.length; col += 2) {
        ansPairs.push({ aIdx: col, pIdx: col + 1 < headers.length ? col + 1 : -1 });
      }
    }

    const rounds = [];
    const fastMoney = [];

    dataRows.forEach((row) => {
      const prompt = (row[effectiveQCol] || "").trim();
      if (!prompt) return;

      const rawTheme = themeCol !== -1 ? (row[themeCol] || "").trim() : "";
      if (/^fast\s*money$/i.test(rawTheme)) {
        const hintList = [];
        ansPairs.forEach(({ aIdx, pIdx }) => {
          const txt = (row[aIdx] || "").trim();
          const pts = pIdx !== -1 ? parseInt(row[pIdx], 10) : 0;
          if (txt) hintList.push(`${txt} (${isNaN(pts) ? 0 : pts})`);
        });
        fastMoney.push({
          prompt,
          hint: hintList.join(", ") || "Fast Money"
        });
        return;
      }

      const answers = [];
      ansPairs.forEach(({ aIdx, pIdx }) => {
        const text = (row[aIdx] || "").trim();
        if (!text) return;
        const rawPts = pIdx !== -1 ? parseInt(row[pIdx], 10) : NaN;
        answers.push({
          text,
          points: isNaN(rawPts) ? Math.max(5, 40 - answers.length * 6) : rawPts
        });
      });

      if (answers.length === 0) return;

      const multVal = multCol !== -1 ? parseInt(row[multCol], 10) : 1;
      rounds.push({
        theme: rawTheme || "🎉 Custom CSV Deck",
        title:
          titleCol !== -1 && row[titleCol] && row[titleCol].trim()
            ? row[titleCol].trim()
            : `Round ${rounds.length + 1}`,
        multiplier: [1, 2, 3].includes(multVal) ? multVal : 1,
        prompt,
        answers: answers.slice(0, 8)
      });
    });

    if (rounds.length === 0) {
      throw new Error("No valid question rows found in CSV.");
    }

    return {
      kind: "deck",
      formatName: "CSV Spreadsheet",
      gameTitle: "",
      gameIcon: "",
      deckName: "",
      teamPresets: null,
      rounds,
      fastMoney: fastMoney.length > 0 ? fastMoney : null
    };
  }

  function parseTidyCsv(headers, dataRows) {
    const qCol = headers.findIndex((h) => /question|prompt/.test(h));
    const aCol = headers.findIndex((h) => /^answer$|^ans$/.test(h));
    const pCol = headers.findIndex((h) => /point|pts|pnt|score/.test(h));
    const themeCol = headers.findIndex((h) => /theme|category/.test(h));
    const multCol = headers.findIndex((h) => /mult/.test(h));

    if (qCol === -1 || aCol === -1) {
      throw new Error("CSV must have Question and Answer columns.");
    }

    const byQuestion = new Map();
    dataRows.forEach((row) => {
      const prompt = (row[qCol] || "").trim();
      const ansText = (row[aCol] || "").trim();
      if (!prompt || !ansText) return;

      if (!byQuestion.has(prompt)) {
        const mult = multCol !== -1 ? parseInt(row[multCol], 10) : 1;
        byQuestion.set(prompt, {
          theme:
            (themeCol !== -1 && row[themeCol] && row[themeCol].trim()) || "🎉 Custom CSV Deck",
          title: `Round ${byQuestion.size + 1}`,
          multiplier: [1, 2, 3].includes(mult) ? mult : 1,
          prompt,
          answers: []
        });
      }
      const pts = pCol !== -1 ? parseInt(row[pCol], 10) : 10;
      const entry = byQuestion.get(prompt);
      if (entry.answers.length < 8) {
        entry.answers.push({ text: ansText, points: isNaN(pts) ? 10 : pts });
      }
    });

    const rounds = Array.from(byQuestion.values());
    if (rounds.length === 0) {
      throw new Error("No valid questions found in CSV.");
    }

    return {
      kind: "deck",
      formatName: "CSV (Tidy Rows)",
      gameTitle: "",
      gameIcon: "",
      deckName: "",
      teamPresets: null,
      rounds,
      fastMoney: null
    };
  }

  function parseCsvRows(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          field += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          field += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          row.push(field);
          field = "";
        } else if (ch === "\r" && next === "\n") {
          row.push(field);
          rows.push(row);
          row = [];
          field = "";
          i++;
        } else if (ch === "\n" || ch === "\r") {
          row.push(field);
          rows.push(row);
          row = [];
          field = "";
        } else {
          field += ch;
        }
      }
    }
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  function exportToNativeDeckJson(activeRounds, activeFastMoney, roomState) {
    return JSON.stringify(
      {
        gameTitle: (roomState && roomState.gameTitle) || "Party Feud",
        gameIcon: (roomState && roomState.gameIcon) || "🎉",
        deckName:
          (roomState && roomState.customDeck && roomState.customDeck.name) || "Custom Party Deck",
        teamPresets: Feud.getActiveTeamPresets(roomState),
        exportedAt: new Date().toISOString(),
        rounds: activeRounds,
        fastMoney: activeFastMoney || Feud.FAST_MONEY_QUESTIONS
      },
      null,
      2
    );
  }

  function exportToFriendlyFeudJson(activeRounds, activeFastMoney) {
    const rounds = (activeRounds || Feud.DEFAULT_ROUNDS).map((r) => ({
      question: r.prompt,
      multiply: Number(r.multiplier) || 1,
      answers: (r.answers || []).map((a) => ({
        ans: a.text,
        pnt: Number(a.points) || 0
      }))
    }));

    const final_round = (activeFastMoney || Feud.FAST_MONEY_QUESTIONS).map((fm) => {
      const pairs = [];
      const parts = String(fm.hint || "").split(",");
      parts.forEach((p) => {
        const m = p.trim().match(/^(.+?)\s*\((\d+)\)$/);
        if (m) {
          pairs.push([m[1].trim(), parseInt(m[2], 10)]);
        } else if (p.trim()) {
          pairs.push([p.trim(), 20]);
        }
      });
      return {
        question: fm.prompt,
        answers: pairs
      };
    });

    return JSON.stringify({ rounds, final_round }, null, 2);
  }

  function exportToCsv(activeRounds, activeFastMoney) {
    const headers = [
      "Theme",
      "Title",
      "Multiplier",
      "Question",
      "Answer 1",
      "Points 1",
      "Answer 2",
      "Points 2",
      "Answer 3",
      "Points 3",
      "Answer 4",
      "Points 4",
      "Answer 5",
      "Points 5",
      "Answer 6",
      "Points 6",
      "Answer 7",
      "Points 7",
      "Answer 8",
      "Points 8"
    ];

    const escapeCsvCell = (val) => {
      const s = String(val ?? "");
      if (/[",\r\n]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [headers.join(",")];

    (activeRounds || Feud.DEFAULT_ROUNDS).forEach((r) => {
      const row = [r.theme || "", r.title || "", r.multiplier || 1, r.prompt || ""];
      for (let i = 0; i < 8; i++) {
        const a = r.answers && r.answers[i];
        row.push(a ? a.text : "");
        row.push(a ? a.points : "");
      }
      lines.push(row.map(escapeCsvCell).join(","));
    });

    (activeFastMoney || []).forEach((fm, i) => {
      const row = ["Fast Money", `FM ${i + 1}`, 1, fm.prompt || ""];
      const parts = String(fm.hint || "").split(",");
      for (let slot = 0; slot < 8; slot++) {
        const raw = (parts[slot] || "").trim();
        const m = raw.match(/^(.+?)\s*\((\d+)\)$/);
        if (m) {
          row.push(m[1].trim(), m[2]);
        } else {
          row.push(raw, "");
        }
      }
      lines.push(row.map(escapeCsvCell).join(","));
    });

    return lines.join("\r\n");
  }

  function escapeHtmlText(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function exportToMarkdownReview(activeRounds, activeFastMoney, roomState) {
    const title = (roomState && roomState.gameTitle) || "Party Feud";
    const icon = (roomState && roomState.gameIcon) || "🎉";
    const deckName =
      (roomState && roomState.customDeck && roomState.customDeck.name) || "Starter Party Deck";
    const rounds = activeRounds || Feud.DEFAULT_ROUNDS || [];
    const fmList = activeFastMoney || Feud.FAST_MONEY_QUESTIONS || [];

    const lines = [
      `# ${icon} ${title} — Question & Answer Review Sheet`,
      `**Deck:** ${deckName}  `,
      `**Total Rounds:** ${rounds.length}  |  **Fast Money Questions:** ${fmList.length}`,
      ""
    ];

    const groups = [
      { label: "1x Single-Point Rounds", filter: (r, isTie) => !isTie && (Number(r.multiplier) || 1) === 1 },
      { label: "2x Double-Point Rounds", filter: (r, isTie) => !isTie && (Number(r.multiplier) || 1) === 2 },
      { label: "3x Triple-Point Rounds", filter: (r, isTie) => !isTie && (Number(r.multiplier) || 1) >= 3 },
      { label: "⚡ Sudden-Death Tie-Breaker Rounds", filter: (r, isTie) => isTie }
    ];

    groups.forEach((grp) => {
      const matched = [];
      rounds.forEach((r, idx) => {
        const isTie =
          /tie-?breaker|sudden\s*death/i.test(r.title || "") ||
          /tie-?breaker|sudden\s*death/i.test(r.theme || "");
        if (grp.filter(r, isTie)) matched.push({ r, idx });
      });
      if (matched.length === 0) return;

      lines.push(`## ${grp.label} (${matched.length})`);
      lines.push("");

      matched.forEach(({ r, idx }) => {
        const mult = Number(r.multiplier) || 1;
        const sumPts = (r.answers || []).reduce((s, a) => s + (Number(a.points) || 0), 0);
        lines.push(
          `### Round #${idx + 1}: ${r.prompt}`
        );
        lines.push(
          `*${r.title || `Round ${idx + 1}`} • ${mult}x Multiplier • Theme: ${r.theme || "General"} • Total Base Pts: ${sumPts}*`
        );
        lines.push("");
        lines.push("| Rank | Survey Answer | Base Pts | Scaled Pts |");
        lines.push("| :---: | :--- | :---: | :---: |");
        (r.answers || []).forEach((a, aIdx) => {
          const base = Number(a.points) || 0;
          lines.push(`| #${aIdx + 1} | ${a.text} | ${base} | ${base * mult} |`);
        });
        lines.push("");
      });
    });

    if (fmList.length > 0) {
      lines.push(`## ⚡ Fast Money Bonus Questions (${fmList.length})`);
      lines.push("");
      fmList.forEach((fm, i) => {
        if (i % 5 === 0) {
          lines.push(`### Fast Money Set #${Math.floor(i / 5) + 1}`);
        }
        lines.push(`${(i % 5) + 1}. **${fm.prompt}**`);
        if (fm.hint) {
          lines.push(`   - *Top Answers:* ${fm.hint.replace(/^Top\s*Answers:\s*/i, "")}`);
        }
      });
      lines.push("");
    }

    return lines.join("\n");
  }

  function exportToPrintableHtml(activeRounds, activeFastMoney, roomState) {
    const title = (roomState && roomState.gameTitle) || "Party Feud";
    const icon = (roomState && roomState.gameIcon) || "🎉";
    const deckName =
      (roomState && roomState.customDeck && roomState.customDeck.name) || "Starter Party Deck";
    const rounds = activeRounds || Feud.DEFAULT_ROUNDS || [];
    const fmList = activeFastMoney || Feud.FAST_MONEY_QUESTIONS || [];

    const groups = [
      {
        label: "1x Single-Point Rounds",
        badge: "1x Level",
        filter: (r, isTie) => !isTie && (Number(r.multiplier) || 1) === 1
      },
      {
        label: "2x Double-Point Rounds",
        badge: "2x Level",
        filter: (r, isTie) => !isTie && (Number(r.multiplier) || 1) === 2
      },
      {
        label: "3x Triple-Point Rounds",
        badge: "3x Level",
        filter: (r, isTie) => !isTie && (Number(r.multiplier) || 1) >= 3
      },
      {
        label: "Sudden-Death Tie-Breaker Rounds",
        badge: "Tie-Breaker",
        filter: (r, isTie) => isTie
      }
    ];

    let sectionsHtml = "";
    groups.forEach((grp) => {
      const matched = [];
      rounds.forEach((r, idx) => {
        const isTie =
          /tie-?breaker|sudden\s*death/i.test(r.title || "") ||
          /tie-?breaker|sudden\s*death/i.test(r.theme || "");
        if (grp.filter(r, isTie)) matched.push({ r, idx });
      });
      if (matched.length === 0) return;

      const cardsHtml = matched
        .map(({ r, idx }) => {
          const mult = Number(r.multiplier) || 1;
          const sumPts = (r.answers || []).reduce((s, a) => s + (Number(a.points) || 0), 0);
          const rowsHtml = (r.answers || [])
            .map((a, aIdx) => {
              const base = Number(a.points) || 0;
              return `
                <tr>
                  <td class="col-rank">#${aIdx + 1}</td>
                  <td class="col-ans">${escapeHtmlText(a.text)}</td>
                  <td class="col-pts">${base}${mult > 1 ? ` <span class="scaled">(${base * mult})</span>` : ""}</td>
                </tr>
              `;
            })
            .join("");

          return `
            <article class="q-card">
              <div class="q-card-head">
                <span class="q-num">Deck #${idx + 1} • ${escapeHtmlText(r.title || `Round ${idx + 1}`)}</span>
                <span class="q-mult mult-${mult}">${mult}x (${sumPts} base pts)</span>
              </div>
              <div class="q-theme">${escapeHtmlText(r.theme || "General")}</div>
              <h3 class="q-prompt">${escapeHtmlText(r.prompt)}</h3>
              <table class="ans-table">
                <tbody>${rowsHtml}</tbody>
              </table>
            </article>
          `;
        })
        .join("");

      sectionsHtml += `
        <section class="level-section">
          <h2 class="level-heading">${escapeHtmlText(grp.label)} <span>(${matched.length} Questions)</span></h2>
          <div class="cards-grid">${cardsHtml}</div>
        </section>
      `;
    });

    let fmHtml = "";
    if (fmList.length > 0) {
      const totalSets = Math.ceil(fmList.length / 5);
      let setsHtml = "";
      for (let s = 0; s < totalSets; s++) {
        const slice = fmList.slice(s * 5, s * 5 + 5);
        const itemsHtml = slice
          .map(
            (fm, i) => `
            <tr>
              <td class="col-rank">Q${i + 1}</td>
              <td class="col-ans">
                <strong>${escapeHtmlText(fm.prompt)}</strong>
                ${
                  fm.hint
                    ? `<div class="fm-hint">${escapeHtmlText(
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
          <article class="q-card">
            <div class="q-card-head">
              <span class="q-num">⚡ Fast Money Set #${s + 1}</span>
              <span class="q-mult mult-1">5 Questions</span>
            </div>
            <table class="ans-table">
              <tbody>${itemsHtml}</tbody>
            </table>
          </article>
        `;
      }

      fmHtml = `
        <section class="level-section">
          <h2 class="level-heading">⚡ Fast Money Bonus Rounds <span>(${fmList.length} Questions • ${totalSets} Set${totalSets === 1 ? "" : "s"})</span></h2>
          <div class="cards-grid">${setsHtml}</div>
        </section>
      `;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtmlText(title)} — Printable Question Review (${escapeHtmlText(deckName)})</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px 28px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      line-height: 1.35;
    }
    .print-toolbar {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.18);
    }
    .toolbar-btns {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn {
      cursor: pointer;
      border: 1.5px solid #fbbf24;
      background: #fbbf24;
      color: #0f172a;
      font-weight: 800;
      font-size: 13px;
      padding: 8px 14px;
      border-radius: 8px;
    }
    .btn.secondary {
      background: transparent;
      color: #fef08a;
    }
    .doc-header {
      border-bottom: 3px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 10px;
    }
    .doc-title {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
    }
    .doc-meta {
      font-size: 13px;
      color: #475569;
      font-weight: 600;
    }
    .level-section {
      margin-bottom: 26px;
    }
    .level-heading {
      font-size: 17px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: #e2e8f0;
      padding: 8px 12px;
      border-left: 5px solid #0f172a;
      border-radius: 6px;
      margin: 0 0 12px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .level-heading span {
      font-size: 12px;
      color: #475569;
      font-weight: 700;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (max-width: 720px) {
      .cards-grid { grid-template-columns: 1fr; }
    }
    .q-card {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .q-card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
    }
    .q-mult {
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      background: #f1f5f9;
      border: 1px solid #94a3b8;
      color: #0f172a;
    }
    .q-mult.mult-2 { background: #fef3c7; border-color: #f59e0b; color: #92400e; }
    .q-mult.mult-3 { background: #fee2e2; border-color: #ef4444; color: #991b1b; }
    .q-theme {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .q-prompt {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin: 6px 0 8px 0;
    }
    .ans-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .ans-table td {
      padding: 3px 6px;
      border-top: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .col-rank {
      width: 28px;
      font-weight: 800;
      color: #64748b;
    }
    .col-ans {
      font-weight: 600;
      color: #1e293b;
    }
    .col-pts {
      width: 68px;
      text-align: right;
      font-weight: 800;
      color: #0f172a;
      white-space: nowrap;
    }
    .col-pts .scaled {
      color: #64748b;
      font-weight: 600;
      font-size: 11px;
    }
    .fm-hint {
      font-size: 11px;
      color: #475569;
      margin-top: 2px;
      font-weight: 500;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .print-toolbar { display: none !important; }
      .cards-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .q-card { border-color: #94a3b8; }
    }
  </style>
</head>
<body>
  <div class="print-toolbar">
    <div>
      <strong>${escapeHtmlText(icon)} ${escapeHtmlText(title)} — Printable Deck Review</strong>
      <span style="font-size:12px; color:#cbd5e1; margin-left:8px;">${escapeHtmlText(deckName)} (${rounds.length} Rounds • ${fmList.length} Fast Money Qs)</span>
    </div>
    <div class="toolbar-btns">
      <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <button class="btn secondary" onclick="window.close()">✕ Close Tab</button>
    </div>
  </div>

  <header class="doc-header">
    <div>
      <h1 class="doc-title">${escapeHtmlText(icon)} ${escapeHtmlText(title)} — Question &amp; Answer Key</h1>
      <div class="doc-meta">Deck: ${escapeHtmlText(deckName)}</div>
    </div>
    <div class="doc-meta">
      ${rounds.length} Survey Rounds • ${fmList.length} Fast Money Questions
    </div>
  </header>

  ${sectionsHtml}
  ${fmHtml}
</body>
</html>`;
  }

  Object.assign(Feud, {
    parseFeudJson,
    parseFeudCsv,
    exportToNativeDeckJson,
    exportToFriendlyFeudJson,
    exportToCsv,
    exportToMarkdownReview,
    exportToPrintableHtml
  });
})(window.Feud);
