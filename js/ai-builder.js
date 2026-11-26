// =====================================================================
// AI CUSTOM DECK BUILDER & SHARE LINK HELPERS (js/ai-builder.js)
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  function openAiDeckBuilderModal() {
    document.getElementById("aiDeckBuilderModal")?.classList.remove("hidden");
    validateAiBuilderJson();
  }

  function closeAiDeckBuilderModal() {
    document.getElementById("aiDeckBuilderModal")?.classList.add("hidden");
  }

  function buildAiDeckPromptText() {
    const topic =
      (document.getElementById("aiBuilderTopicInput")?.value || "").trim() ||
      "Fun Family Game Night";
    const rounds =
      parseInt(document.getElementById("aiBuilderRoundsSelect")?.value || "12", 10) || 12;
    const style =
      (document.getElementById("aiBuilderStyleSelect")?.value || "").trim() || "Family-Friendly";
    const includeFm = Boolean(document.getElementById("aiBuilderIncludeFmCheck")?.checked);
    const n1 = Math.max(2, Math.round(rounds / 2));
    const n2 = Math.max(1, Math.round(rounds / 4));
    const n3 = Math.max(1, rounds - n1 - n2);

    const fmSchema = includeFm
      ? `,\n  "fastMoney": [\n    {\n      "prompt": "Short rapid-fire question",\n      "hint": "Top1 (45), Top2 (28), Top3 (15), Top4 (8), Top5 (4)"\n    }\n  ]`
      : `,\n  "fastMoney": []`;

    return `Create a ${rounds}-round Family Feud-style question deck about "${topic}" (audience style: ${style}).
Respond ONLY with valid raw JSON (no markdown explanation) matching this exact schema:
{
  "gameTitle": "Party Feud",
  "gameIcon": "🎉",
  "deckName": "${topic} (${rounds} Rounds)",
  "tags": ["custom"],
  "teamPresets": [["Team Alpha", "Team Omega"], ["Team Blue", "Team Red"]],
  "rounds": [
    {
      "theme": "Category Emoji + Name",
      "title": "Round 1",
      "multiplier": 1,
      "prompt": "Name something people associate with...",
      "answers": [
        { "text": "Most common answer", "points": 38 },
        { "text": "Second answer", "points": 26 },
        { "text": "Third answer", "points": 18 },
        { "text": "Fourth answer", "points": 11 },
        { "text": "Fifth answer", "points": 7 }
      ]
    }
  ]${fmSchema}
}
Rules:
- Each round MUST have 4 to 6 concise, distinct answers ordered highest to lowest, with answer points totaling EXACTLY 100.
- Use multiplier 1 for ${n1} rounds, multiplier 2 for ${n2} rounds, and multiplier 3 for ${n3} rounds (total ${rounds} rounds).${
      includeFm
        ? "\n- Include 5 concise Fast Money questions in fastMoney (whose top 5 hints sum to 100)."
        : ""
    }`;
  }

  async function copyAiDeckPrompt() {
    const prompt = buildAiDeckPromptText();
    try {
      await navigator.clipboard.writeText(prompt);
      Feud.showToast("📋 AI Deck Prompt copied! Paste it into Gemini, ChatGPT, or Claude.");
    } catch (e) {
      window.prompt("Copy this AI prompt:", prompt);
    }
  }

  function parseAiBuilderDraft() {
    const raw = (document.getElementById("aiBuilderJsonInput")?.value || "").trim();
    if (!raw) return null;
    const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = Feud.parseFeudJson(stripped);
    if (!parsed || parsed.kind !== "deck" || !Array.isArray(parsed.rounds) || parsed.rounds.length === 0) {
      throw new Error("JSON must contain a non-empty 'rounds' array with valid answers.");
    }
    const topicFallback =
      (document.getElementById("aiBuilderTopicInput")?.value || "").trim() || "AI Custom Deck";
    return {
      gameTitle: parsed.gameTitle || "Party Feud",
      gameIcon: parsed.gameIcon || "✨",
      deckName: parsed.deckName || topicFallback,
      teamPresets: parsed.teamPresets || null,
      tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ["custom"],
      rounds: parsed.rounds,
      fastMoney: Array.isArray(parsed.fastMoney) ? parsed.fastMoney : []
    };
  }

  function validateAiBuilderJson() {
    const statusEl = document.getElementById("aiBuilderValidationStatus");
    const raw = (document.getElementById("aiBuilderJsonInput")?.value || "").trim();
    if (!raw) {
      if (statusEl) {
        statusEl.className = "ai-builder-status";
        statusEl.textContent = "Paste generated JSON above to validate rounds, answers, and points.";
      }
      return null;
    }
    try {
      const draft = parseAiBuilderDraft();
      const fmCount = Array.isArray(draft.fastMoney) ? draft.fastMoney.length : 0;
      if (statusEl) {
        statusEl.className = "ai-builder-status ok";
        statusEl.textContent = `✅ Valid "${draft.deckName}" — ${draft.rounds.length} rounds${
          fmCount > 0 ? ` + ${Math.floor(fmCount / 5) || 1} Fast Money set` : ""
        }!`;
      }
      return draft;
    } catch (err) {
      if (statusEl) {
        statusEl.className = "ai-builder-status err";
        statusEl.textContent = `❌ ${err && err.message ? err.message : "Invalid JSON format"}`;
      }
      return null;
    }
  }

  function makeSlugDeckId(deckName) {
    const clean = Feud.slugifyDeckName
      ? Feud.slugifyDeckName(deckName)
      : String(deckName || "custom-deck")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
    return `${clean || "custom-deck"}.json`;
  }

  function downloadAiBuilderDeckJson() {
    const draft = validateAiBuilderJson();
    if (!draft) {
      Feud.showToast("Paste valid deck JSON before downloading.");
      return;
    }
    const jsonText = Feud.formatDeckJsonLikeOriginal
      ? Feud.formatDeckJsonLikeOriginal(draft, "")
      : JSON.stringify(draft, null, 2);
    const blob = new Blob([jsonText], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = makeSlugDeckId(draft.deckName);
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copyShareUrlForDeckObj(deckObj) {
    if (!Feud.encodeDeckForUrlHash) {
      Feud.showToast("Deck sharing helper unavailable.");
      return;
    }
    const token = await Feud.encodeDeckForUrlHash(deckObj);
    if (!token) {
      Feud.showToast("Could not encode deck into URL.");
      return;
    }
    const base = window.location.href.split("#")[0].split("?")[0];
    const shareUrl = `${base}#deckData=${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      Feud.showToast(`🔗 Shareable deck link copied (${shareUrl.length} chars)!`);
    } catch (e) {
      window.prompt("Copy this shareable Party Feud deck link:", shareUrl);
    }
  }

  async function copyShareableDeckLink() {
    const draft = validateAiBuilderJson();
    if (!draft) {
      Feud.showToast("Paste valid deck JSON first to generate a share link.");
      return;
    }
    await copyShareUrlForDeckObj(draft);
  }

  Feud.AiBuilder = {
    openAiDeckBuilderModal,
    closeAiDeckBuilderModal,
    buildAiDeckPromptText,
    copyAiDeckPrompt,
    parseAiBuilderDraft,
    validateAiBuilderJson,
    makeSlugDeckId,
    downloadAiBuilderDeckJson,
    copyShareUrlForDeckObj,
    copyShareableDeckLink
  };
})(window.Feud);
