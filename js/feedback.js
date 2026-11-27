// =====================================================================
// IN-APP BUG REPORTING, DIAGNOSTICS, AUTO-GROUPING & VOTING (js/feedback.js)
// - Captures sanitized game state, URL params, sync diagnostics & recent errors
// - Never leaks Host PINs, custom team names, or full custom deck payloads
// - Fetches & caches open GitHub issues, auto-groups similar issues as you type,
//   and supports 1-click voting/reporting via an optional Cloudflare Worker
//   with zero-config fallbacks (pre-filled GitHub Issue, mailto:, Copy).
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  const REPO_SLUG = "BrownGenius/feud";
  const ISSUES_CACHE_KEY = "party_feud_open_issues_cache_v1";
  const VOTED_ISSUES_KEY = "party_feud_voted_issues_v1";
  const CACHE_TTL_MS = 30 * 1000;
  const MAX_RECENT_ERRORS = 10;

  const FEEDBACK_CONFIG = {
    repoSlug: REPO_SLUG,
    reportEndpoint:
      (typeof window !== "undefined" && window.FEUD_REPORT_ENDPOINT) ||
      "https://party-feud-bugs.nilesh-agarwalla-s-account.workers.dev",
    fallbackEmail:
      (typeof window !== "undefined" && window.FEUD_BUG_EMAIL) || ""
  };

  const recentErrors = [];

  function pushErrorEntry(kind, msg) {
    const clean = String(msg || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 260);
    if (!clean) return;
    recentErrors.push({
      t: new Date().toISOString(),
      kind,
      msg: clean
    });
    if (recentErrors.length > MAX_RECENT_ERRORS) {
      recentErrors.shift();
    }
  }

  if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("error", (ev) => {
      const loc = ev && ev.filename ? ` (${ev.filename.split("/").pop()}:${ev.lineno || 0})` : "";
      pushErrorEntry("error", `${(ev && ev.message) || "Runtime error"}${loc}`);
    });
    window.addEventListener("unhandledrejection", (ev) => {
      const reason = ev && ev.reason;
      const msg =
        reason && typeof reason === "object"
          ? reason.message || String(reason)
          : String(reason || "Unhandled promise rejection");
      pushErrorEntry("rejection", msg);
    });
  }

  function getBuildVersion() {
    if (typeof document !== "undefined") {
      const badge = document.getElementById("appBuildBadge");
      if (badge && badge.textContent) {
        return badge.textContent.replace(/^Build\s+/i, "").trim();
      }
    }
    return "unknown";
  }

  function buildBugDiagnostics(roomState, activeRole, currentRoomCode) {
    const st = roomState || {};
    const loc = (typeof window !== "undefined" && window.location) || {};
    const params = new URLSearchParams(loc.search || "");
    const syncDiag =
      Feud.getSyncDiagnostics && typeof Feud.getSyncDiagnostics === "function"
        ? Feud.getSyncDiagnostics()
        : null;

    let viewport = "unknown";
    if (typeof window !== "undefined" && window.innerWidth) {
      viewport = `${window.innerWidth}x${window.innerHeight}`;
    }

    const deckName =
      st.customDeck && st.customDeck.name
        ? String(st.customDeck.name).slice(0, 80)
        : (Feud.DEFAULT_DECK && Feud.DEFAULT_DECK.deckName) || "Starter Party Deck";

    return {
      build: getBuildVersion(),
      role: String(activeRole || "lobby"),
      protocol: String(loc.protocol || "unknown"),
      online: typeof navigator !== "undefined" ? navigator.onLine !== false : true,
      urlDeck: (params.get("deck") || "").slice(0, 80),
      urlTheme: (params.get("theme") || params.get("boardTheme") || "").slice(0, 40),
      hasRoomCode: Boolean(currentRoomCode && currentRoomCode !== "SOLO"),
      stage: st.stage || "main",
      roundPhase: st.roundPhase || "faceoff-ready",
      roundIdx: Number(st.roundIdx) || 0,
      roundsPerMatch: Number(st.roundsPerMatch) || 4,
      deckName,
      boardTheme: st.boardTheme || "classic",
      strikes: Number(st.strikes) || 0,
      pot: Number(st.pot) || 0,
      revealedCount: Array.isArray(st.revealed) ? st.revealed.length : 0,
      isDemoMode: Boolean(st.isDemoMode),
      tournamentSize:
        st.tournament && st.tournament.enabled ? Number(st.tournament.size) || 0 : 0,
      sync: syncDiag
        ? {
            mqttConnectedCount: Number(syncDiag.mqttConnectedCount) || 0,
            trysteroReady: Boolean(syncDiag.trysteroReady),
            relayOk: Boolean(syncDiag.relayOk)
          }
        : null,
      viewport,
      userAgent:
        typeof navigator !== "undefined" && navigator.userAgent
          ? String(navigator.userAgent).slice(0, 180)
          : "unknown",
      recentErrors: recentErrors.slice(-MAX_RECENT_ERRORS)
    };
  }

  function formatDiagnosticsMarkdown(diag) {
    const d = diag || {};
    const lines = [
      "### Diagnostics (Auto-Captured)",
      `- **Build:** ${d.build || "unknown"}`,
      `- **Role / Stage / Phase:** \`${d.role}\` / \`${d.stage}\` / \`${d.roundPhase}\` (Round ${(d.roundIdx || 0) + 1})`,
      `- **Protocol / Network:** \`${d.protocol}\` • Online: \`${d.online}\``,
      `- **Deck / Theme:** ${d.deckName || "Starter"} (\`${d.boardTheme || "classic"}\`)`,
      `- **Board State:** Strikes \`${d.strikes || 0}/3\` • Pot \`${d.pot || 0}\` • Revealed \`${d.revealedCount || 0}\` • Demo: \`${Boolean(d.isDemoMode)}\``,
      d.sync
        ? `- **Sync:** MQTT \`${d.sync.mqttConnectedCount}\` • WebRTC \`${d.sync.trysteroReady}\` • RelayOK \`${d.sync.relayOk}\``
        : "- **Sync:** local / not started",
      `- **Viewport:** \`${d.viewport || "unknown"}\``,
      `- **Browser:** \`${d.userAgent || "unknown"}\``
    ];

    if (Array.isArray(d.recentErrors) && d.recentErrors.length > 0) {
      lines.push("", "**Recent Errors:**", "```text");
      d.recentErrors.forEach((e) => {
        lines.push(`[${e.t}] (${e.kind}) ${e.msg}`);
      });
      lines.push("```");
    }
    return lines.join("\n");
  }

  function mapRoleToTemplateOption(role) {
    if (role === "host") return "Host Remote Control";
    if (role === "tv" || role === "solo") return "TV Display Board";
    if (role === "buzzer1" || role === "buzzer2") return "Individual Team Buzzer (Phone)";
    if (role === "buzzer_combo") return "Combo Buzzer (Shared Phone / Tablet)";
    return "Lobby / New Game Setup";
  }

  function buildGitHubIssueUrl({ title, category, description, diag }) {
    const cleanTitle = String(title || "").trim() || `[${category || "Bug"}] Party Feud Report`;
    const bodyText = [
      String(description || "").trim() || "(Please describe what happened)",
      "",
      formatDiagnosticsMarkdown(diag)
    ].join("\n");

    const envSummary = diag
      ? `${diag.protocol || ""} • Online: ${diag.online} • ${diag.viewport || ""}`.trim()
      : "";

    const params = new URLSearchParams({
      template: "bug-report.yml",
      title: cleanTitle,
      role: mapRoleToTemplateOption(diag && diag.role),
      "build-version": (diag && diag.build) || getBuildVersion(),
      environment: envSummary,
      steps: bodyText
    });

    return `https://github.com/${FEEDBACK_CONFIG.repoSlug}/issues/new?${params.toString()}`;
  }

  function buildMailtoUrl({ title, category, description, diag, email }) {
    const cleanTo = String(email || FEEDBACK_CONFIG.fallbackEmail || "").trim();
    const subject = `[Party Feud ${category || "Bug"}] ${String(title || "Issue Report").trim()}`;
    const body = [
      String(description || "").trim() || "Describe what happened:",
      "",
      formatDiagnosticsMarkdown(diag)
    ].join("\n");
    return `mailto:${encodeURIComponent(cleanTo)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  const STOPWORDS = new Set([
    "the", "and", "for", "with", "that", "this", "from", "when", "does", "not",
    "into", "what", "have", "cant", "will", "just", "very", "after", "before",
    "game", "party", "feud", "issue", "bug"
  ]);

  function tokenizeText(str) {
    return Array.from(
      new Set(
        String(str || "")
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
      )
    );
  }

  function extractCommunityVotes(issue) {
    const nativeVotes =
      (issue && issue.reactions && Number(issue.reactions["+1"])) || 0;
    const bodyStr = String((issue && issue.body) || "");
    const match = bodyStr.match(/<!--\s*feud-votes:(\d+)\s*-->/i);
    const workerVotes = match ? parseInt(match[1], 10) || 0 : 0;
    return nativeVotes + workerVotes;
  }

  function scoreIssueSimilarity(queryTitle, category, diag, issue) {
    if (!issue || !issue.title) return 0;
    const queryTokens = tokenizeText(`${queryTitle || ""} ${category || ""}`);
    const issueText = `${issue.title} ${(issue.body || "").slice(0, 400)}`;
    const issueTokens = new Set(tokenizeText(issueText));

    let score = 0;
    queryTokens.forEach((tok) => {
      if (issueTokens.has(tok)) score += 3;
    });

    const roleToken = diag && diag.role ? String(diag.role).toLowerCase() : "";
    if (roleToken && roleToken !== "lobby") {
      const labelMatch = (issue.labels || []).some((l) =>
        String(l.name || "").toLowerCase().includes(roleToken.replace(/\d+$/, ""))
      );
      if (labelMatch) score += 1;
    }
    return score;
  }

  function findSimilarIssues(issues, queryTitle, category, diag, limit = 3) {
    if (!Array.isArray(issues) || issues.length === 0) return [];
    const hasQuery = String(queryTitle || "").trim().length >= 3;
    if (!hasQuery) return [];

    return issues
      .map((issue) => ({
        issue,
        score: scoreIssueSimilarity(queryTitle, category, diag, issue),
        votes: extractCommunityVotes(issue)
      }))
      .filter((entry) => entry.score >= 3)
      .sort((a, b) => b.score - a.score || b.votes - a.votes)
      .slice(0, limit);
  }

  function getVotedIssueSet() {
    try {
      const raw = localStorage.getItem(VOTED_ISSUES_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr.map(Number) : []);
    } catch (e) {
      return new Set();
    }
  }

  function markIssueVotedLocally(issueNumber) {
    const set = getVotedIssueSet();
    set.add(Number(issueNumber));
    try {
      localStorage.setItem(VOTED_ISSUES_KEY, JSON.stringify(Array.from(set)));
    } catch (e) {}
    return set;
  }

  async function fetchOpenIssues(forceRefresh = false) {
    if (!forceRefresh) {
      try {
        const cachedRaw = sessionStorage.getItem(ISSUES_CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached && Date.now() - (cached.ts || 0) < CACHE_TTL_MS && Array.isArray(cached.items)) {
            return cached.items;
          }
        }
      } catch (e) {}
    }

    if (typeof fetch !== "function" || (typeof navigator !== "undefined" && navigator.onLine === false)) {
      return [];
    }

    try {
      const url = `https://api.github.com/repos/${FEEDBACK_CONFIG.repoSlug}/issues?state=open&per_page=30${
        forceRefresh ? `&_t=${Date.now()}` : ""
      }`;
      const res = await fetch(url, {
        headers: { Accept: "application/vnd.github+json" },
        cache: forceRefresh ? "no-store" : "default"
      });
      if (!res.ok) return [];
      const list = await res.json();
      const issuesOnly = Array.isArray(list) ? list.filter((it) => it && !it.pull_request) : [];
      try {
        sessionStorage.setItem(
          ISSUES_CACHE_KEY,
          JSON.stringify({ ts: Date.now(), items: issuesOnly })
        );
      } catch (e) {}
      return issuesOnly;
    } catch (e) {
      return [];
    }
  }

  function normalizeEndpointUrl(raw) {
    const clean = String(raw || "").trim().replace(/\/+$/, "");
    if (!clean) return "";
    return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  }

  async function submitReportToEndpoint(payload, endpointOverride) {
    const endpoint = normalizeEndpointUrl(endpointOverride || FEEDBACK_CONFIG.reportEndpoint);
    if (!endpoint) {
      return { ok: false, unconfigured: true };
    }
    try {
      const res = await fetch(`${endpoint}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data.error || `HTTP ${res.status}` };
      }
      try {
        sessionStorage.removeItem(ISSUES_CACHE_KEY);
      } catch (e) {}
      return {
        ok: true,
        issueNumber: data.issueNumber,
        url: data.url,
        duplicateOf: data.duplicateOf || null
      };
    } catch (err) {
      return { ok: false, error: (err && err.message) || "Network or CORS error" };
    }
  }

  async function voteIssueViaEndpoint(issueNumber, endpointOverride) {
    const num = Number(issueNumber);
    if (!Number.isInteger(num) || num <= 0) {
      return { ok: false, error: "Invalid issue number" };
    }
    const voted = getVotedIssueSet();
    if (voted.has(num)) {
      return { ok: true, alreadyVoted: true };
    }
    const endpoint = normalizeEndpointUrl(endpointOverride || FEEDBACK_CONFIG.reportEndpoint);
    if (!endpoint) {
      return { ok: false, unconfigured: true };
    }
    try {
      const res = await fetch(`${endpoint}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueNumber: num })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data.error || `HTTP ${res.status}` };
      }
      markIssueVotedLocally(num);
      try {
        sessionStorage.removeItem(ISSUES_CACHE_KEY);
      } catch (e) {}
      return { ok: true, votes: data.votes };
    } catch (err) {
      return { ok: false, error: (err && err.message) || "Network or CORS error" };
    }
  }

  Object.assign(Feud, {
    FEEDBACK_CONFIG,
    pushErrorEntry,
    buildBugDiagnostics,
    formatDiagnosticsMarkdown,
    buildGitHubIssueUrl,
    buildMailtoUrl,
    extractCommunityVotes,
    scoreIssueSimilarity,
    findSimilarIssues,
    getVotedIssueSet,
    markIssueVotedLocally,
    fetchOpenIssues,
    submitReportToEndpoint,
    voteIssueViaEndpoint
  });
})(window.Feud);
