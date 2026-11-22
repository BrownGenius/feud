// =====================================================================
// CLOUDFLARE WORKER: ANONYMOUS BUG REPORTER, AUTO-GROUPER & VOTER
// Deploy for free on Cloudflare Workers (100,000 requests/day free tier).
//
// Setup (5 minutes):
//  1. Create a Fine-Grained GitHub Personal Access Token (PAT) with ONLY:
//     Repository access: BrownGenius/feud
//     Permissions: Issues -> Read and Write
//  2. In Cloudflare Workers -> Settings -> Variables & Secrets:
//     Add secret: GITHUB_TOKEN = <your PAT>
//     Add var:    GITHUB_REPO  = BrownGenius/feud
//  3. Set window.FEUD_REPORT_ENDPOINT = "https://your-worker.workers.dev"
//     (or configure FEEDBACK_CONFIG.reportEndpoint in js/feedback.js).
// =====================================================================

const ALLOWED_ORIGINS = new Set([
  "https://browngenius.github.io",
  "http://localhost:8080",
  "http://127.0.0.1:8080"
]);

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://browngenius.github.io";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}

function tokenize(str) {
  return new Set(
    String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3)
  );
}

function computeOverlap(aStr, bStr) {
  const a = tokenize(aStr);
  const b = tokenize(bStr);
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const w of a) {
    if (b.has(w)) shared++;
  }
  return shared / Math.max(a.size, b.size);
}

function deriveLabels(category, diag) {
  const labels = ["user-reported"];
  const cat = String(category || "").toLowerCase();
  if (cat.includes("feature")) labels.push("enhancement");
  else labels.push("bug");

  if (cat.includes("sync") || cat.includes("buzzer")) labels.push("sync/relay");
  if (diag && diag.role) {
    const r = String(diag.role).toLowerCase();
    if (r === "host") labels.push("role:host");
    else if (r === "tv" || r === "solo") labels.push("role:tv");
    else if (r.startsWith("buzzer")) labels.push("role:buzzer");
  }
  if (diag && (diag.protocol === "file:" || diag.online === false)) {
    labels.push("offline/file");
  }
  return Array.from(new Set(labels));
}

async function ghFetch(env, path, opts = {}) {
  const repo = env.GITHUB_REPO || "BrownGenius/feud";
  const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "party-feud-bug-worker",
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  return res;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
    }
    if (!env.GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: "Worker GITHUB_TOKEN not configured" }), { status: 500, headers });
    }

    const url = new URL(request.url);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), { status: 400, headers });
    }

    // 1. Handle non-GitHub community vote (+1)
    if (url.pathname.endsWith("/vote")) {
      const issueNumber = Number(body.issueNumber);
      if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
        return new Response(JSON.stringify({ error: "Invalid issueNumber" }), { status: 400, headers });
      }
      const issueRes = await ghFetch(env, `/issues/${issueNumber}`);
      if (!issueRes.ok) {
        return new Response(JSON.stringify({ error: "Issue not found" }), { status: 404, headers });
      }
      const issue = await issueRes.json();
      const rawBody = String(issue.body || "");
      const m = rawBody.match(/<!--\s*feud-votes:(\d+)\s*-->/i);
      const nextVotes = (m ? parseInt(m[1], 10) : 0) + 1;
      const updatedBody = m
        ? rawBody.replace(/<!--\s*feud-votes:\d+\s*-->/i, `<!-- feud-votes:${nextVotes} -->`)
        : `${rawBody}\n\n<!-- feud-votes:${nextVotes} -->`;

      await ghFetch(env, `/issues/${issueNumber}`, {
        method: "PATCH",
        body: JSON.stringify({ body: updatedBody })
      });

      return new Response(JSON.stringify({ ok: true, votes: nextVotes }), { status: 200, headers });
    }

    // 2. Handle anonymous bug / feature report submission
    if (url.pathname.endsWith("/report")) {
      if (body.website) {
        // Honeypot field for bots
        return new Response(JSON.stringify({ error: "Rejected" }), { status: 400, headers });
      }
      const title = String(body.title || "").trim().slice(0, 140);
      const description = String(body.description || "").trim().slice(0, 4000);
      const category = String(body.category || "Bug").trim().slice(0, 40);
      const diagnosticsMd = String(body.diagnosticsMarkdown || "").trim().slice(0, 3000);
      const diag = body.diagnostics && typeof body.diagnostics === "object" ? body.diagnostics : {};

      if (title.length < 4) {
        return new Response(JSON.stringify({ error: "Please enter a short summary title." }), { status: 400, headers });
      }

      // Check open issues for high-similarity duplicate
      let duplicateOf = null;
      const openRes = await ghFetch(env, "/issues?state=open&per_page=30");
      if (openRes.ok) {
        const openList = await openRes.json();
        for (const existing of Array.isArray(openList) ? openList : []) {
          if (existing.pull_request) continue;
          if (computeOverlap(title, existing.title) >= 0.75) {
            duplicateOf = existing.number;
            break;
          }
        }
      }

      const fullBody = [
        description || "_No additional description provided._",
        "",
        diagnosticsMd,
        "",
        duplicateOf ? `_Possible related open issue: #${duplicateOf}_` : "",
        "<!-- feud-votes:1 -->"
      ]
        .filter(Boolean)
        .join("\n");

      const createRes = await ghFetch(env, "/issues", {
        method: "POST",
        body: JSON.stringify({
          title: `[${category}] ${title}`,
          body: fullBody,
          labels: deriveLabels(category, diag)
        })
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        return new Response(JSON.stringify({ error: errText }), { status: 502, headers });
      }
      const created = await createRes.json();
      return new Response(
        JSON.stringify({
          ok: true,
          issueNumber: created.number,
          url: created.html_url,
          duplicateOf
        }),
        { status: 201, headers }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown route" }), { status: 404, headers });
  }
};
