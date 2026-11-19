// =====================================================================
// UNIFIED DECK DISCOVERY, LOCAL FOLDER SCAN & CUSTOM FILE LOADER (js/decks.js)
// Replaces the static decks/catalog.js bundle across index.html & review.html.
// Supports:
//  1. Local Folder Scanning via File System Access API (showDirectoryPicker + IndexedDB)
//     and <input webkitdirectory> fallback for file://, Firefox, and Safari.
//  2. Custom Deck File Loading via showOpenFilePicker and <input type="file"> fallback.
//  3. Persistent Cache (localStorage + IndexedDB) across reloads and tabs.
//  4. Automatic Remote Discovery on GitHub Pages (Contents API) & HTTP dev servers.
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  const SCANNED_CACHE_KEY = "party_feud_scanned_decks_v1";
  const IDB_NAME = "party_feud_local_decks_db";
  const IDB_VERSION = 1;
  const IDB_STORE_HANDLES = "handles";
  const IDB_STORE_CACHE = "cache";
  const IDB_HANDLE_KEY = "decks_dir";
  const IDB_CACHE_KEY = "scanned_decks";

  const STARTER_ENTRY = {
    id: "starter",
    label: "🎉 Starter Party Deck (6 Rounds)",
    file: null,
    builtin: "starter",
    source: "builtin"
  };

  if (!Array.isArray(Feud.DECK_CATALOG) || Feud.DECK_CATALOG.length === 0) {
    Feud.DECK_CATALOG = [{ ...STARTER_ENTRY }];
  }

  const folderState = {
    hasSavedHandle: false,
    savedDirName: "",
    lastFolderName: "",
    localDeckCount: 0,
    customFileCount: 0
  };

  let lastCacheUpdatedAt = 0;

  function isIgnoredDeckFileName(name) {
    const clean = String(name || "").trim();
    if (!clean) return true;
    if (clean.startsWith(".")) return true;
    if (!/\.(json|csv)$/i.test(clean)) return true;
    const lower = clean.toLowerCase();
    return (
      lower === "catalog.js" ||
      lower === "template.csv" ||
      lower === "package.json" ||
      lower === "package-lock.json"
    );
  }

  function formatFilenameFallbackLabel(fileName) {
    const stem = String(fileName || "")
      .replace(/\.(json|csv)$/i, "")
      .replace(/[-_]+/g, " ")
      .trim();
    const pretty = stem.replace(/\b\w/g, (ch) => ch.toUpperCase());
    return `📄 ${pretty || fileName} (${fileName})`;
  }

  function recomputeCounts() {
    const catalog = getDeckCatalog();
    folderState.localDeckCount = catalog.filter((e) => e.source === "local-folder").length;
    folderState.customFileCount = catalog.filter((e) => e.source === "custom-file").length;
  }

  function getDeckCatalog() {
    if (!Array.isArray(Feud.DECK_CATALOG)) {
      Feud.DECK_CATALOG = [];
    }
    const starterIdx = Feud.DECK_CATALOG.findIndex((e) => e && e.builtin === "starter");
    if (starterIdx === -1) {
      Feud.DECK_CATALOG.unshift({ ...STARTER_ENTRY });
    } else if (starterIdx > 0) {
      const [starter] = Feud.DECK_CATALOG.splice(starterIdx, 1);
      Feud.DECK_CATALOG.unshift(starter);
    }
    return Feud.DECK_CATALOG;
  }

  function dispatchDecksUpdated(detail) {
    try {
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        const evt =
          typeof CustomEvent === "function"
            ? new CustomEvent("feud-decks-updated", { detail: detail || getLocalDecksFolderState() })
            : { type: "feud-decks-updated" };
        window.dispatchEvent(evt);
      }
    } catch (e) {}
  }

  function parseDeckFileContent(fileName, text) {
    const cleanName = String(fileName || "Deck").trim();
    const cleanText = String(text || "").replace(/^\uFEFF/, "");
    const trimmed = cleanText.trim();
    if (!trimmed) return null;

    const isCsv =
      /\.csv$/i.test(cleanName) || (!trimmed.startsWith("{") && !trimmed.startsWith("["));
    const parsed = isCsv ? Feud.parseFeudCsv(cleanText) : Feud.parseFeudJson(cleanText);
    if (!parsed) return null;

    if (parsed.kind === "overrides") {
      return {
        kind: "overrides",
        customRounds: parsed.customRounds,
        fileName: cleanName
      };
    }

    if (parsed.kind !== "deck" || !Array.isArray(parsed.rounds) || parsed.rounds.length === 0) {
      return null;
    }

    return {
      kind: "deck",
      id: cleanName,
      file: `./decks/${cleanName}`,
      data: {
        gameTitle: parsed.gameTitle || "Party Feud",
        gameIcon: parsed.gameIcon || "🎉",
        deckName: parsed.deckName || cleanName.replace(/\.(json|csv)$/i, ""),
        teamPresets: parsed.teamPresets || null,
        rounds: parsed.rounds,
        fastMoney: Array.isArray(parsed.fastMoney) ? parsed.fastMoney : []
      }
    };
  }

  function getSortKey(entry) {
    if (!entry) return "";
    const rawName = (entry.data && entry.data.deckName) || entry.label || entry.id || "";
    return String(rawName).toLowerCase();
  }

  function upsertCatalogEntries(newEntries, options = {}) {
    const replaceSource = options && options.replaceSource ? options.replaceSource : null;
    const catalog = getDeckCatalog();

    if (replaceSource) {
      for (let i = catalog.length - 1; i >= 0; i--) {
        const item = catalog[i];
        if (item && item.builtin !== "starter" && item.source === replaceSource) {
          catalog.splice(i, 1);
        }
      }
    }

    (newEntries || []).forEach((incoming) => {
      if (!incoming || !incoming.id || incoming.builtin === "starter") return;
      const incomingIdLower = String(incoming.id).toLowerCase();
      const existingIdx = catalog.findIndex(
        (item) => item && item.id && String(item.id).toLowerCase() === incomingIdLower
      );

      if (existingIdx !== -1) {
        const cur = catalog[existingIdx];
        if (cur.builtin === "starter") return;
        catalog[existingIdx] = {
          ...cur,
          ...incoming,
          data: incoming.data || cur.data || null,
          file: incoming.file !== undefined ? incoming.file : cur.file || null
        };
      } else {
        catalog.push({
          ...incoming,
          label: incoming.label || formatFilenameFallbackLabel(incoming.id)
        });
      }
    });

    const starter = catalog.find((e) => e && e.builtin === "starter") || { ...STARTER_ENTRY };
    const others = catalog
      .filter((e) => e && e.builtin !== "starter")
      .sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)));

    catalog.length = 0;
    catalog.push(starter, ...others);
    recomputeCounts();
    return catalog;
  }

  function buildCachePayload() {
    const entries = getDeckCatalog()
      .filter((e) => (e.source === "local-folder" || e.source === "custom-file") && e.data)
      .map((e) => ({
        id: e.id,
        file: e.file || null,
        source: e.source,
        data: e.data
      }));
    return {
      updatedAt: Date.now(),
      lastFolderName: folderState.lastFolderName || "",
      entries
    };
  }

  function applyCachePayload(payload) {
    if (!payload || !Array.isArray(payload.entries)) return false;
    const updatedAt = Number(payload.updatedAt) || 0;
    if (updatedAt && updatedAt < lastCacheUpdatedAt) return false;
    if (updatedAt) lastCacheUpdatedAt = updatedAt;
    if (typeof payload.lastFolderName === "string") {
      folderState.lastFolderName = payload.lastFolderName;
    }
    const restored = payload.entries
      .filter((e) => e && e.id && e.data && Array.isArray(e.data.rounds) && e.data.rounds.length > 0)
      .map((e) => ({
        id: e.id,
        label: formatFilenameFallbackLabel(e.id),
        file: e.file || null,
        source: e.source === "custom-file" ? "custom-file" : "local-folder",
        data: e.data
      }));
    if (restored.length > 0) {
      upsertCatalogEntries(restored, { replaceSource: "local-folder" });
      return true;
    }
    return false;
  }

  function loadCacheSync() {
    try {
      if (typeof localStorage === "undefined") return;
      const raw = localStorage.getItem(SCANNED_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      applyCachePayload(parsed);
    } catch (e) {}
  }

  function openDecksDb() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB unavailable"));
        return;
      }
      try {
        const req = indexedDB.open(IDB_NAME, IDB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(IDB_STORE_HANDLES)) {
            db.createObjectStore(IDB_STORE_HANDLES);
          }
          if (!db.objectStoreNames.contains(IDB_STORE_CACHE)) {
            db.createObjectStore(IDB_STORE_CACHE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error("IndexedDB open error"));
      } catch (e) {
        reject(e);
      }
    });
  }

  async function idbGet(storeName, key) {
    try {
      const db = await openDecksDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      });
    } catch (e) {
      return null;
    }
  }

  async function idbSet(storeName, key, val) {
    try {
      const db = await openDecksDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.put(val, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      });
    } catch (e) {
      return false;
    }
  }

  async function saveCacheAsync() {
    const payload = buildCachePayload();
    lastCacheUpdatedAt = payload.updatedAt;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(SCANNED_CACHE_KEY, JSON.stringify(payload));
      }
    } catch (e) {}
    await idbSet(IDB_STORE_CACHE, IDB_CACHE_KEY, payload);
  }

  async function loadCacheFromIdbAsync() {
    const cached = await idbGet(IDB_STORE_CACHE, IDB_CACHE_KEY);
    if (cached && applyCachePayload(cached)) {
      recomputeCounts();
      dispatchDecksUpdated();
    }
  }

  async function saveDirectoryHandle(dirHandle) {
    return idbSet(IDB_STORE_HANDLES, IDB_HANDLE_KEY, dirHandle);
  }

  async function loadDirectoryHandle() {
    return idbGet(IDB_STORE_HANDLES, IDB_HANDLE_KEY);
  }

  function canUseDirectoryPicker() {
    return Boolean(
      typeof window !== "undefined" &&
        window.isSecureContext &&
        typeof window.showDirectoryPicker === "function"
    );
  }

  function canUseFilePicker() {
    return Boolean(
      typeof window !== "undefined" &&
        window.isSecureContext &&
        typeof window.showOpenFilePicker === "function"
    );
  }

  function getLocalDecksFolderState() {
    recomputeCounts();
    return {
      hasSavedHandle: folderState.hasSavedHandle,
      savedDirName: folderState.savedDirName,
      lastFolderName: folderState.lastFolderName,
      localDeckCount: folderState.localDeckCount,
      customFileCount: folderState.customFileCount,
      supportsDirectoryPicker: canUseDirectoryPicker(),
      supportsFilePicker: canUseFilePicker()
    };
  }

  function readFileAsText(file) {
    if (file && typeof file.text === "function") {
      return file.text();
    }
    return new Promise((resolve, reject) => {
      if (typeof FileReader === "undefined") {
        reject(new Error("FileReader unavailable"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Could not read file"));
      reader.readAsText(file);
    });
  }

  async function parseDirectoryHandlesList(dirHandle) {
    const entries = [];
    const skipped = [];
    let decksSubDir = null;

    for await (const handle of dirHandle.values()) {
      if (!handle) continue;
      if (handle.kind === "directory") {
        if (handle.name && handle.name.toLowerCase() === "decks") {
          decksSubDir = handle;
        }
        continue;
      }
      if (handle.kind !== "file") continue;
      if (isIgnoredDeckFileName(handle.name)) continue;

      try {
        const file = await handle.getFile();
        const text = await readFileAsText(file);
        const parsed = parseDeckFileContent(handle.name, text);
        if (parsed && parsed.kind === "deck") {
          entries.push({
            id: parsed.id,
            label: formatFilenameFallbackLabel(parsed.id),
            file: parsed.file,
            source: "local-folder",
            data: parsed.data
          });
        } else {
          skipped.push(handle.name);
        }
      } catch (err) {
        skipped.push(handle.name);
      }
    }

    return { entries, skipped, decksSubDir };
  }

  async function readDecksFromDirectoryHandle(dirHandle) {
    let folderName = dirHandle.name || "decks";
    let { entries, skipped, decksSubDir } = await parseDirectoryHandlesList(dirHandle);

    if (entries.length === 0 && decksSubDir) {
      const subResult = await parseDirectoryHandlesList(decksSubDir);
      if (subResult.entries.length > 0) {
        entries = subResult.entries;
        skipped = skipped.concat(subResult.skipped);
        folderName = `${folderName}/${decksSubDir.name || "decks"}`;
      }
    }

    folderState.lastFolderName = folderName;
    upsertCatalogEntries(entries, { replaceSource: "local-folder" });
    await saveCacheAsync();
    dispatchDecksUpdated();

    return {
      count: entries.length,
      folderName,
      entries,
      skipped
    };
  }

  async function scanLocalDecksWithDirectoryPicker() {
    if (!canUseDirectoryPicker()) {
      return { fallbackRequired: true };
    }
    try {
      const dirHandle = await window.showDirectoryPicker({
        id: "feud-decks",
        mode: "read"
      });
      await saveDirectoryHandle(dirHandle);
      folderState.hasSavedHandle = true;
      folderState.savedDirName = dirHandle.name || "decks";
      return await readDecksFromDirectoryHandle(dirHandle);
    } catch (err) {
      if (err && err.name === "AbortError") {
        return { cancelled: true };
      }
      if (err && (err.name === "SecurityError" || err.name === "NotAllowedError")) {
        return { fallbackRequired: true };
      }
      throw err;
    }
  }

  async function rescanSavedDecksFolder() {
    const dirHandle = await loadDirectoryHandle();
    if (!dirHandle) {
      folderState.hasSavedHandle = false;
      folderState.savedDirName = "";
      return { missingHandle: true };
    }

    try {
      let perm = "prompt";
      if (typeof dirHandle.queryPermission === "function") {
        perm = await dirHandle.queryPermission({ mode: "read" });
      }
      if (perm !== "granted" && typeof dirHandle.requestPermission === "function") {
        perm = await dirHandle.requestPermission({ mode: "read" });
      }
      if (perm !== "granted") {
        return { denied: true, folderName: dirHandle.name || "" };
      }
      folderState.hasSavedHandle = true;
      folderState.savedDirName = dirHandle.name || "decks";
      return await readDecksFromDirectoryHandle(dirHandle);
    } catch (err) {
      return { denied: true, error: err && err.message ? err.message : "Permission error" };
    }
  }

  async function ingestLocalFolderFiles(fileList) {
    const allFiles = Array.from(fileList || []);
    if (allFiles.length === 0) {
      return { count: 0, folderName: "", entries: [], skipped: [] };
    }

    const firstRel = allFiles[0].webkitRelativePath || "";
    const topFolder = firstRel.includes("/") ? firstRel.split("/")[0] : "Local Folder";

    const cleanCandidates = allFiles.filter((file) => {
      if (!file || isIgnoredDeckFileName(file.name)) return false;
      const rel = String(file.webkitRelativePath || file.name);
      const parts = rel.split("/").filter(Boolean);
      if (parts.some((seg) => seg.startsWith(".") || seg === "node_modules")) return false;
      return true;
    });

    // Prefer direct children of the selected folder; if top folder was repo root, prefer its decks/ subfolder
    const hasDirectDeckCandidates = cleanCandidates.some((f) => {
      const parts = String(f.webkitRelativePath || f.name).split("/").filter(Boolean);
      return parts.length <= 2;
    });
    const inDecksSubdir = cleanCandidates.filter((f) => {
      const parts = String(f.webkitRelativePath || f.name).split("/").filter(Boolean);
      return parts.length === 3 && parts[1].toLowerCase() === "decks";
    });

    let targetFiles = cleanCandidates;
    let folderName = topFolder;
    if (inDecksSubdir.length > 0 && topFolder.toLowerCase() !== "decks" && !hasDirectDeckCandidates) {
      targetFiles = inDecksSubdir;
      folderName = `${topFolder}/decks`;
    } else if (hasDirectDeckCandidates) {
      const directOnly = cleanCandidates.filter((f) => {
        const parts = String(f.webkitRelativePath || f.name).split("/").filter(Boolean);
        return parts.length <= 2;
      });
      if (directOnly.length > 0) targetFiles = directOnly;
    }

    const entries = [];
    const skipped = [];

    for (const file of targetFiles) {
      try {
        const text = await readFileAsText(file);
        const parsed = parseDeckFileContent(file.name, text);
        if (parsed && parsed.kind === "deck") {
          entries.push({
            id: parsed.id,
            label: formatFilenameFallbackLabel(parsed.id),
            file: parsed.file,
            source: "local-folder",
            data: parsed.data
          });
        } else {
          skipped.push(file.name);
        }
      } catch (err) {
        skipped.push(file.name);
      }
    }

    // If direct children had no valid deck files and a decks/ subfolder exists, try that subfolder
    if (entries.length === 0 && inDecksSubdir.length > 0 && targetFiles !== inDecksSubdir) {
      folderName = `${topFolder}/decks`;
      for (const file of inDecksSubdir) {
        try {
          const text = await readFileAsText(file);
          const parsed = parseDeckFileContent(file.name, text);
          if (parsed && parsed.kind === "deck") {
            entries.push({
              id: parsed.id,
              label: formatFilenameFallbackLabel(parsed.id),
              file: parsed.file,
              source: "local-folder",
              data: parsed.data
            });
          } else {
            skipped.push(file.name);
          }
        } catch (err) {
          skipped.push(file.name);
        }
      }
    }

    folderState.lastFolderName = folderName;
    upsertCatalogEntries(entries, { replaceSource: "local-folder" });
    await saveCacheAsync();
    dispatchDecksUpdated();

    return {
      count: entries.length,
      folderName,
      entries,
      skipped
    };
  }

  async function ingestCustomDeckFiles(fileList) {
    const files = Array.from(fileList || []);
    const entries = [];
    const overrides = [];
    const errors = [];

    for (const file of files) {
      if (!file) continue;
      const fileName = file.name || "Custom Deck.json";
      try {
        const text = await readFileAsText(file);
        const parsed = parseDeckFileContent(fileName, text);
        if (!parsed) {
          errors.push({ fileName, message: "No valid rounds found." });
          continue;
        }
        if (parsed.kind === "overrides") {
          overrides.push(parsed);
          continue;
        }
        entries.push({
          id: parsed.id,
          label: formatFilenameFallbackLabel(parsed.id),
          file: null,
          source: "custom-file",
          data: parsed.data
        });
      } catch (err) {
        errors.push({
          fileName,
          message: err && err.message ? err.message : "Invalid deck format"
        });
      }
    }

    if (entries.length > 0) {
      upsertCatalogEntries(entries);
      await saveCacheAsync();
      dispatchDecksUpdated();
    }

    return { entries, overrides, errors };
  }

  async function pickCustomDeckFilesWithPicker() {
    if (!canUseFilePicker()) {
      return { fallbackRequired: true };
    }
    try {
      const handles = await window.showOpenFilePicker({
        id: "feud-custom-deck",
        multiple: true,
        types: [
          {
            description: "Party Feud Decks (.json, .csv)",
            accept: {
              "application/json": [".json"],
              "text/csv": [".csv"]
            }
          }
        ]
      });
      const files = [];
      for (const h of handles) {
        files.push(await h.getFile());
      }
      return await ingestCustomDeckFiles(files);
    } catch (err) {
      if (err && err.name === "AbortError") {
        return { cancelled: true };
      }
      if (err && (err.name === "SecurityError" || err.name === "NotAllowedError")) {
        return { fallbackRequired: true };
      }
      throw err;
    }
  }

  function parseDirectoryIndexHtml(html) {
    const text = String(html || "");
    const found = [];
    const seen = new Set();
    const linkRe = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
    let m;

    while ((m = linkRe.exec(text)) !== null) {
      const rawHref = (m[1] ?? m[2] ?? m[3] ?? "").trim();
      if (!rawHref || rawHref.startsWith("?") || rawHref.startsWith("#")) continue;
      if (rawHref === "../" || rawHref === "./" || rawHref === "/") continue;

      const cleanHref = rawHref.split("?")[0].split("#")[0];
      if (!cleanHref || cleanHref.endsWith("/")) continue;

      const lastSlash = cleanHref.lastIndexOf("/");
      const rawName = lastSlash >= 0 ? cleanHref.slice(lastSlash + 1) : cleanHref;
      let fileName = rawName;
      try {
        fileName = decodeURIComponent(rawName);
      } catch (e) {}

      if (isIgnoredDeckFileName(fileName)) continue;
      const lower = fileName.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      found.push(fileName);
    }

    return found;
  }

  async function hydrateRemoteEntriesMetadata(fileNames) {
    if (!Array.isArray(fileNames) || fileNames.length === 0 || typeof fetch !== "function") return;
    let updatedAny = false;

    await Promise.allSettled(
      fileNames.map(async (fileName) => {
        try {
          const res = await fetch(`./decks/${encodeURIComponent(fileName)}`);
          if (!res.ok) return;
          const text = await res.text();
          const parsed = parseDeckFileContent(fileName, text);
          if (parsed && parsed.kind === "deck") {
            upsertCatalogEntries([
              {
                id: parsed.id,
                label: formatFilenameFallbackLabel(parsed.id),
                file: `./decks/${parsed.id}`,
                source: "remote",
                data: parsed.data
              }
            ]);
            updatedAny = true;
          }
        } catch (e) {}
      })
    );

    if (updatedAny) {
      dispatchDecksUpdated();
    }
  }

  async function discoverRemoteDecksOverHttp() {
    if (typeof window === "undefined" || typeof fetch !== "function") return;
    const protocol = (window.location && window.location.protocol) || "";
    if (protocol !== "http:" && protocol !== "https:") return;

    const host = (window.location && window.location.hostname) || "";
    let discoveredNames = [];

    if (host.endsWith(".github.io")) {
      try {
        const owner = host.split(".")[0];
        const pathParts = (window.location.pathname || "").split("/").filter(Boolean);
        const repo = pathParts[0];
        if (owner && repo) {
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/decks`;
          const res = await fetch(apiUrl);
          if (res.ok) {
            const files = await res.json();
            if (Array.isArray(files)) {
              discoveredNames = files
                .map((f) => (f && f.name ? String(f.name) : ""))
                .filter((name) => name && !isIgnoredDeckFileName(name));
            }
          }
        }
      } catch (e) {}
    }

    if (discoveredNames.length === 0) {
      try {
        const res = await fetch("./decks/");
        if (res.ok) {
          const contentType = (res.headers && res.headers.get("content-type")) || "";
          const html = await res.text();
          if (/html/i.test(contentType) || /<a\b/i.test(html)) {
            discoveredNames = parseDirectoryIndexHtml(html);
          }
        }
      } catch (e) {}
    }

    if (discoveredNames.length === 0) return;

    const remoteEntries = discoveredNames.map((fileName) => ({
      id: fileName,
      label: formatFilenameFallbackLabel(fileName),
      file: `./decks/${fileName}`,
      data: null,
      source: "remote"
    }));

    upsertCatalogEntries(remoteEntries);
    dispatchDecksUpdated();
    await hydrateRemoteEntriesMetadata(discoveredNames);
  }

  async function discoverAvailableDecks() {
    await loadCacheFromIdbAsync();

    const dirHandle = await loadDirectoryHandle();
    if (dirHandle) {
      folderState.hasSavedHandle = true;
      folderState.savedDirName = dirHandle.name || "decks";
      dispatchDecksUpdated();
      try {
        if (typeof dirHandle.queryPermission === "function") {
          const perm = await dirHandle.queryPermission({ mode: "read" });
          if (perm === "granted") {
            await readDecksFromDirectoryHandle(dirHandle);
          }
        }
      } catch (e) {}
    } else {
      folderState.hasSavedHandle = false;
      folderState.savedDirName = "";
    }

    await discoverRemoteDecksOverHttp();
  }

  function resolveDeckCandidateUrls(rawUrlOrSlug) {
    const clean = String(rawUrlOrSlug || "").trim();
    if (!clean) return [];
    if (/^https?:\/\//i.test(clean) || clean.startsWith("./") || clean.startsWith("/")) {
      return [clean];
    }
    if (/\.(json|csv)$/i.test(clean)) {
      return [`./decks/${clean}`, clean];
    }
    return [`./decks/${clean}.json`, `./decks/${clean}.csv`];
  }

  loadCacheSync();

  if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("storage", (e) => {
      if (e && e.key === SCANNED_CACHE_KEY) {
        loadCacheSync();
        recomputeCounts();
        dispatchDecksUpdated();
      }
    });
  }

  Object.assign(Feud, {
    getDeckCatalog,
    isIgnoredDeckFileName,
    formatFilenameFallbackLabel,
    parseDeckFileContent,
    upsertCatalogEntries,
    canUseDirectoryPicker,
    canUseFilePicker,
    getLocalDecksFolderState,
    scanLocalDecksWithDirectoryPicker,
    rescanSavedDecksFolder,
    ingestLocalFolderFiles,
    pickCustomDeckFilesWithPicker,
    ingestCustomDeckFiles,
    parseDirectoryIndexHtml,
    discoverAvailableDecks,
    resolveDeckCandidateUrls
  });
})(window.Feud);
