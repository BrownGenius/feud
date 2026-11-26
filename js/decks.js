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
    if (!/\.json$/i.test(clean)) return true;
    const lower = clean.toLowerCase();
    return (
      lower === "catalog.js" ||
      lower === "manifest.json" ||
      lower === "package.json" ||
      lower === "package-lock.json"
    );
  }

  const DECK_TAG_DEFINITIONS = [
    { id: "all", label: "📚 All Decks" },
    { id: "family-friendly", label: "👨‍👩‍👧‍👦 Family-Friendly" },
    { id: "classic", label: "🎉 Classic / General" },
    { id: "holidays", label: "🦃 Holidays" },
    { id: "movies-music", label: "🎬 Movies & Music" },
    { id: "robotics", label: "🤖 Robotics / FRC" },
    { id: "custom", label: "✨ Custom" }
  ];

  function inferDeckTags(id, deckName, explicitTags) {
    if (Array.isArray(explicitTags) && explicitTags.length > 0) {
      return Array.from(
        new Set(
          explicitTags
            .map((t) => String(t || "").trim().toLowerCase())
            .filter(Boolean)
        )
      );
    }
    const haystack = `${id || ""} ${deckName || ""}`;
    const tags = new Set();
    const isFrc = /frc|robotics|stem/i.test(haystack);

    if (/family-friendly|starter|frc|bollywood|desi/i.test(haystack)) {
      tags.add("family-friendly");
    }
    if (isFrc) {
      tags.add("robotics");
    }
    if (/thanksgiving|christmas|holiday|halloween|diwali/i.test(haystack)) {
      tags.add("holidays");
    }
    if (/bollywood|movie|music/i.test(haystack)) {
      tags.add("movies-music");
    }
    if (/2025|2026|starter|friendly-feud/i.test(haystack) && !isFrc) {
      tags.add("classic");
    }
    if (tags.size === 0) {
      tags.add("classic");
    }
    return Array.from(tags);
  }

  function getDeckTags(item) {
    if (!item) return [];
    if (item.builtin === "starter") {
      return ["family-friendly", "classic"];
    }
    const explicit =
      (item.data && Array.isArray(item.data.tags) && item.data.tags.length > 0
        ? item.data.tags
        : null) ||
      (item.meta && Array.isArray(item.meta.tags) && item.meta.tags.length > 0
        ? item.meta.tags
        : null);
    const deckName =
      (item.data && item.data.deckName) ||
      (item.meta && item.meta.deckName) ||
      item.label ||
      item.id ||
      "";
    const tags = new Set(inferDeckTags(item.id, deckName, explicit));
    if (item.source === "custom-file") {
      tags.add("custom");
    }
    return Array.from(tags);
  }

  function formatFilenameFallbackLabel(fileName) {
    const stem = String(fileName || "")
      .replace(/\.json$/i, "")
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

    const parsed = Feud.parseFeudJson(cleanText);
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
        deckName: parsed.deckName || cleanName.replace(/\.json$/i, ""),
        boardTheme: parsed.boardTheme || "",
        teamPresets: parsed.teamPresets || null,
        tags: Array.isArray(parsed.tags) ? parsed.tags : null,
        rounds: parsed.rounds,
        fastMoney: Array.isArray(parsed.fastMoney) ? parsed.fastMoney : []
      }
    };
  }

  function getSortKey(entry) {
    if (!entry) return "";
    const rawName =
      (entry.data && entry.data.deckName) ||
      (entry.meta && entry.meta.deckName) ||
      entry.label ||
      entry.id ||
      "";
    return String(rawName).toLowerCase();
  }

  function normalizeDeckIdKey(id) {
    return String(id || "")
      .trim()
      .toLowerCase()
      .replace(/^\.?\/?decks\//i, "")
      .replace(/\.json$/i, "");
  }

  function slugifyDeckName(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/\.json$/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function findCatalogDeckMatch(queryOrSlug) {
    const clean = String(queryOrSlug || "").trim();
    if (!clean) return null;
    const catalog = getDeckCatalog();
    const normKey = normalizeDeckIdKey(clean);
    const slug = slugifyDeckName(clean);
    return (
      catalog.find((item) => {
        if (!item || !item.id) return false;
        if (item.id.toLowerCase() === clean.toLowerCase()) return true;
        if (normalizeDeckIdKey(item.id) === normKey) return true;
        if (item.file && item.file.toLowerCase() === clean.toLowerCase()) return true;
        if (slug && slugifyDeckName(item.id) === slug) return true;
        const dName = (item.data && item.data.deckName) || (item.meta && item.meta.deckName) || "";
        return Boolean(dName && slug && slugifyDeckName(dName) === slug);
      }) || null
    );
  }

  function getDeckSignature(entry) {
    if (!entry) return "";
    const name = String(
      (entry.data && entry.data.deckName) ||
        (entry.meta && entry.meta.deckName) ||
        ""
    )
      .trim()
      .toLowerCase();
    if (!name) return "";
    const rounds =
      (entry.data && Array.isArray(entry.data.rounds) && entry.data.rounds.length) ||
      (entry.meta && Number(entry.meta.roundsCount)) ||
      0;
    const fm =
      (entry.data && Array.isArray(entry.data.fastMoney) && entry.data.fastMoney.length) ||
      (entry.meta && Number(entry.meta.fastMoneySets)) ||
      0;
    return `${name}|${rounds}|${fm}`;
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
      const incomingIdKey = normalizeDeckIdKey(incoming.id);
      const incomingSig = getDeckSignature(incoming);
      const incomingNameSlug = slugifyDeckName(
        (incoming.data && incoming.data.deckName) || (incoming.meta && incoming.meta.deckName) || ""
      );
      const existingIdx = catalog.findIndex((item) => {
        if (!item || !item.id || item.builtin === "starter") return false;
        const itemKey = normalizeDeckIdKey(item.id);
        if (itemKey === incomingIdKey) return true;
        if (incoming.source === "remote" && (item.source === "local-folder" || item.source === "custom-file")) {
          if (incomingNameSlug && itemKey === incomingNameSlug) return true;
          if (incomingSig && getDeckSignature(item) === incomingSig) return true;
        }
        return false;
      });

      if (existingIdx !== -1) {
        const cur = catalog[existingIdx];
        if (cur.builtin === "starter") return;
        const shouldDropStaleData =
          !incoming.data &&
          incoming.source === "remote" &&
          incoming.meta &&
          cur.data &&
          getDeckSignature(cur) !== incomingSig;
        catalog[existingIdx] = {
          ...cur,
          ...incoming,
          data: incoming.data || (shouldDropStaleData ? null : cur.data) || null,
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

    const shouldPersist =
      !options.skipSave &&
      (Boolean(replaceSource) ||
        (newEntries || []).some(
          (e) => e && e.data && (e.source === "custom-file" || e.source === "local-folder")
        ));
    if (shouldPersist) {
      saveCacheAsync();
    }
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
      upsertCatalogEntries(restored, { replaceSource: "local-folder", skipSave: true });
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
            description: "Party Feud Decks (.json)",
            accept: {
              "application/json": [".json"]
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

  function uint8ToBase64Url(bytes) {
    let bin = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function base64UrlToUint8(str) {
    const clean = String(str || "").replace(/-/g, "+").replace(/_/g, "/");
    const pad = clean.length % 4 ? "=".repeat(4 - (clean.length % 4)) : "";
    const bin = atob(clean + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i);
    }
    return out;
  }

  async function transformStreamBytes(bytes, streamInstance) {
    const writer = streamInstance.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const res = new Response(streamInstance.readable);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  }

  async function encodeDeckForUrlHash(deckObj) {
    if (!deckObj || !Array.isArray(deckObj.rounds) || deckObj.rounds.length === 0) {
      return "";
    }
    const payload = {
      gameTitle: deckObj.gameTitle || "Party Feud",
      gameIcon: deckObj.gameIcon || "🎉",
      deckName: deckObj.deckName || deckObj.name || "Shared Party Deck",
      boardTheme: deckObj.boardTheme || "",
      teamPresets: Array.isArray(deckObj.teamPresets) ? deckObj.teamPresets : null,
      tags: Array.isArray(deckObj.tags) ? deckObj.tags : null,
      rounds: deckObj.rounds,
      fastMoney: Array.isArray(deckObj.fastMoney) ? deckObj.fastMoney : []
    };
    const jsonBytes = new TextEncoder().encode(JSON.stringify(payload));
    if (typeof CompressionStream === "function" && typeof Response === "function") {
      try {
        const compressed = await transformStreamBytes(jsonBytes, new CompressionStream("deflate-raw"));
        return `z.${uint8ToBase64Url(compressed)}`;
      } catch (e) {}
    }
    return `u.${uint8ToBase64Url(jsonBytes)}`;
  }

  async function decodeDeckFromUrlHash(hashStr) {
    try {
      let raw = String(hashStr || "").trim();
      if (!raw) return null;
      if (raw.startsWith("#")) raw = raw.slice(1);
      const match = raw.match(/(?:^|&)deckData=([^&]+)/);
      const token = match ? decodeURIComponent(match[1]) : raw.replace(/^deckData=/, "");
      if (!token) return null;

      let jsonText = "";
      if (token.startsWith("z.")) {
        if (typeof DecompressionStream !== "function" || typeof Response !== "function") {
          return null;
        }
        const compBytes = base64UrlToUint8(token.slice(2));
        const plainBytes = await transformStreamBytes(compBytes, new DecompressionStream("deflate-raw"));
        jsonText = new TextDecoder().decode(plainBytes);
      } else if (token.startsWith("u.")) {
        const plainBytes = base64UrlToUint8(token.slice(2));
        jsonText = new TextDecoder().decode(plainBytes);
      } else {
        const plainBytes = base64UrlToUint8(token);
        jsonText = new TextDecoder().decode(plainBytes);
      }

      const parsed = parseDeckFileContent("shared-deck.json", jsonText);
      if (!parsed || parsed.kind !== "deck") return null;
      const slugBase = String(parsed.data.deckName || "shared-deck")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const deckId = `${slugBase || "shared-deck"}.json`;
      return {
        id: deckId,
        label: `${parsed.data.gameIcon || "🔗"} ${parsed.data.deckName}`,
        file: null,
        source: "custom-file",
        data: parsed.data
      };
    } catch (e) {
      return null;
    }
  }

  async function discoverRemoteDecksOverHttp() {
    if (typeof window === "undefined" || typeof fetch !== "function") return;
    const protocol = (window.location && window.location.protocol) || "";
    if (protocol !== "http:" && protocol !== "https:") return;

    // 1. Primary path: static decks/manifest.json (1 CDN request, zero API rate limits)
    try {
      const mRes = await fetch("./decks/manifest.json");
      if (mRes.ok) {
        const manifest = await mRes.json();
        if (manifest && Array.isArray(manifest.decks) && manifest.decks.length > 0) {
          const manifestEntries = manifest.decks
            .filter((d) => d && d.id && !isIgnoredDeckFileName(d.id))
            .map((d) => ({
              id: d.id,
              label: formatFilenameFallbackLabel(d.id),
              file: d.file || `./decks/${d.id}`,
              data: null,
              source: "remote",
              meta: {
                deckName: d.deckName || d.id.replace(/\.json$/i, ""),
                gameIcon: d.gameIcon || "🎉",
                boardTheme: d.boardTheme || "",
                roundsCount: Number(d.roundsCount) || 0,
                fastMoneySets: Number(d.fastMoneySets) || 0,
                tags: Array.isArray(d.tags) ? d.tags : null
              }
            }));
          if (manifestEntries.length > 0) {
            upsertCatalogEntries(manifestEntries);
            dispatchDecksUpdated();
            return;
          }
        }
      }
    } catch (e) {}

    // 2. Fallback: GitHub Contents API (*.github.io) or HTTP directory index HTML
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

  function formatDeckJsonLikeOriginal(payload, originalText) {
    let merged = { ...(payload || {}) };
    let eol = "\n";
    let trailingNewline = true;
    let indent = "  ";
    let compactAnswers = true;
    let compactPresets = true;

    if (typeof originalText === "string" && originalText.trim()) {
      eol = /\r\n/.test(originalText) ? "\r\n" : "\n";
      trailingNewline = /\r?\n$/.test(originalText);
      const indentMatch = originalText.match(/^[ \t]+(?=")/m);
      if (indentMatch && indentMatch[0]) {
        indent = indentMatch[0];
      }
      compactAnswers = /\{\s*"text"\s*:[^\r\n]+\}/m.test(originalText);
      compactPresets = /\[\s*"[^"\r\n]*"\s*,\s*"[^"\r\n]*"\s*\]/m.test(originalText);

      try {
        const origObj = JSON.parse(originalText.replace(/^\uFEFF/, ""));
        if (origObj && typeof origObj === "object" && !Array.isArray(origObj)) {
          const ordered = {};
          Object.keys(origObj).forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(merged, k)) {
              if (merged[k] !== undefined) ordered[k] = merged[k];
            } else {
              ordered[k] = origObj[k];
            }
          });
          Object.keys(merged).forEach((k) => {
            if (!Object.prototype.hasOwnProperty.call(ordered, k) && merged[k] !== undefined) {
              ordered[k] = merged[k];
            }
          });
          merged = ordered;
        }
      } catch (e) {}
    }

    let out = JSON.stringify(merged, null, indent);
    if (compactPresets) {
      out = out.replace(
        /\[\n([ \t]+)"((?:\\.|[^"\\])*)",\n\1"((?:\\.|[^"\\])*)"\n[ \t]+\]/g,
        '["$2", "$3"]'
      );
    }
    if (compactAnswers) {
      out = out.replace(
        /\{\n([ \t]+)"text": ("(?:\\.|[^"\\])*"),\n\1"points": (-?\d+(?:\.\d+)?)\n[ \t]+\}/g,
        '{ "text": $2, "points": $3 }'
      );
    }
    if (eol === "\r\n") {
      out = out.replace(/\n/g, "\r\n");
    }
    if (trailingNewline && !out.endsWith(eol)) {
      out += eol;
    }
    return out;
  }

  async function saveDeckToLocalFile(deckId, payload) {
    const cleanName = String(deckId || "")
      .trim()
      .replace(/^\.?\/?decks\//i, "");
    const fallbackSlug = slugifyDeckName((payload && payload.deckName) || "party-feud-deck") || "party-feud-deck";
    const fileName = /\.json$/i.test(cleanName) ? cleanName : `${cleanName || fallbackSlug}.json`;

    // 1. If a scanned local folder handle exists and has write access, write directly back to that file
    try {
      const dirHandle = await loadDirectoryHandle();
      if (dirHandle && typeof dirHandle.getFileHandle === "function") {
        let targetDir = dirHandle;
        try {
          const sub = await dirHandle.getDirectoryHandle("decks");
          if (sub) targetDir = sub;
        } catch (e) {}

        const perm =
          typeof targetDir.queryPermission === "function"
            ? await targetDir.queryPermission({ mode: "readwrite" })
            : "prompt";
        const granted =
          perm === "granted" ||
          (typeof targetDir.requestPermission === "function" &&
            (await targetDir.requestPermission({ mode: "readwrite" })) === "granted");

        if (granted) {
          let fileHandle = null;
          try {
            fileHandle = await targetDir.getFileHandle(fileName, { create: false });
          } catch (e) {}
          if (fileHandle && typeof fileHandle.createWritable === "function") {
            let origText = "";
            try {
              origText = await (await fileHandle.getFile()).text();
            } catch (e) {}
            const jsonText = formatDeckJsonLikeOriginal(payload, origText);
            const writable = await fileHandle.createWritable();
            await writable.write(jsonText);
            await writable.close();
            upsertCatalogEntries([
              {
                id: fileName,
                label: formatFilenameFallbackLabel(fileName),
                file: `./decks/${fileName}`,
                source: "local-folder",
                data: payload
              }
            ]);
            await saveCacheAsync();
            dispatchDecksUpdated();
            return { ok: true, method: "local-folder", fileName };
          }
        }
      }
    } catch (err) {
      if (err && err.name === "AbortError") return { ok: false, aborted: true };
    }

    // 2. Fallback: native Save File Picker (lets user overwrite any local .json file directly)
    if (typeof window !== "undefined" && window.isSecureContext && typeof window.showSaveFilePicker === "function") {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "Party Feud Deck JSON",
              accept: { "application/json": [".json"] }
            }
          ]
        });
        let origText = "";
        try {
          origText = await (await handle.getFile()).text();
        } catch (e) {}
        const jsonText = formatDeckJsonLikeOriginal(payload, origText);
        const writable = await handle.createWritable();
        await writable.write(jsonText);
        await writable.close();
        return { ok: true, method: "save-picker", fileName: handle.name || fileName };
      } catch (err) {
        if (err && err.name === "AbortError") return { ok: false, aborted: true };
      }
    }

    return { ok: false, fallbackDownload: true, fileName };
  }

  function resolveDeckCandidateUrls(rawUrlOrSlug) {
    const clean = String(rawUrlOrSlug || "").trim();
    if (!clean) return [];
    if (/^https?:\/\//i.test(clean) || clean.startsWith("./") || clean.startsWith("/")) {
      return [clean];
    }
    if (/\.json$/i.test(clean)) {
      return [`./decks/${clean}`, clean];
    }
    return [`./decks/${clean}.json`];
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
    DECK_TAG_DEFINITIONS,
    getDeckCatalog,
    slugifyDeckName,
    findCatalogDeckMatch,
    isIgnoredDeckFileName,
    getDeckTags,
    formatFilenameFallbackLabel,
    parseDeckFileContent,
    upsertCatalogEntries,
    encodeDeckForUrlHash,
    decodeDeckFromUrlHash,
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
    formatDeckJsonLikeOriginal,
    saveDeckToLocalFile,
    resolveDeckCandidateUrls
  });
})(window.Feud);
