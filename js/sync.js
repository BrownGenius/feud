// =====================================================================
// HYBRID MULTIPLAYER SYNC ENGINE FOR GITHUB PAGES & LOCAL FILE://
// Combines:
//  1. PeerJS (WebRTC P2P) — Zero-config 4-phone sync across devices
//  2. BroadcastChannel + localStorage — Instant offline multi-window sync
//  3. Optional Firebase Firestore — Cloud sync if FIREBASE_CONFIG is set
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  const PEER_PREFIX = "party-feud-live-room-";

  let peerInstance = null;
  let hostConnections = new Map();
  let localBuzzerTabs = new Map();
  let clientConn = null;
  let broadcastChan = null;
  let currentCode = "";
  let currentRole = "lobby";
  let isPrimaryHostPeer = false;
  let reconnectTimer = null;
  let hostRetryTimer = null;
  let heartbeatTimer = null;
  let localPresenceTimer = null;
  let lastPongAt = 0;
  let hasLocalBroadcastSync = false;
  let lastLocalSyncAt = 0;
  let clientGen = 0;
  let reconnectAttempt = 0;
  let clientJoinInfo = null;

  // Optional Firebase state
  let firebaseReady = false;
  let db = null;
  let authUser = null;
  let unsubscribeFirestore = null;
  let firestoreMod = null;

  let onRemoteStateCallback = null;
  let onConnectionStatusCallback = null;
  let getLocalStateCallback = null;
  let onForcedExitCallback = null;
  let pendingRoleCheck = null;

  function getTabClientId() {
    try {
      let id = sessionStorage.getItem("party_feud_tab_client_id");
      if (!id) {
        id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem("party_feud_tab_client_id", id);
      }
      return id;
    } catch (e) {
      return `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    }
  }
  const tabClientId = getTabClientId();

  function initSyncCallbacks({ onRemoteState, onStatusChange, getLocalState, onForcedExit }) {
    onRemoteStateCallback = onRemoteState;
    onConnectionStatusCallback = onStatusChange;
    getLocalStateCallback = getLocalState;
    onForcedExitCallback = onForcedExit || null;

    window.addEventListener("storage", (e) => {
      if (!currentCode || currentRole === "lobby") return;
      if (e.key === `party_feud_room_state_${currentCode}` && e.newValue) {
        try {
          const incoming = JSON.parse(e.newValue);
          if (onRemoteStateCallback) onRemoteStateCallback(incoming);
        } catch (err) {}
      }
    });
  }

  function getConnectedBuzzerTeams() {
    let b1 = false;
    let b2 = false;
    let combo = false;
    const now = Date.now();

    hostConnections.forEach((entry) => {
      if (!entry || !entry.conn || !entry.conn.open) return;
      if (entry.role === "buzzer1") b1 = true;
      if (entry.role === "buzzer2") b2 = true;
      if (entry.role === "buzzer_combo") combo = true;
    });

    for (const [cid, entry] of Array.from(localBuzzerTabs.entries())) {
      if (!entry || now - (entry.lastSeenAt || 0) > 12000) {
        localBuzzerTabs.delete(cid);
        continue;
      }
      if (entry.role === "buzzer1") b1 = true;
      if (entry.role === "buzzer2") b2 = true;
      if (entry.role === "buzzer_combo") combo = true;
    }

    if (currentRole === "buzzer1") b1 = true;
    if (currentRole === "buzzer2") b2 = true;
    if (currentRole === "buzzer_combo") combo = true;

    return { t1: b1 || combo, t2: b2 || combo, b1, b2, combo };
  }

  function notifyStatus(statusText, isLive = true) {
    if (onConnectionStatusCallback) {
      onConnectionStatusCallback(statusText, isLive);
    }
    try {
      window.dispatchEvent(
        new CustomEvent("feud-peer-status", {
          detail: { text: statusText, ok: isLive, buzzers: getConnectedBuzzerTeams() }
        })
      );
    } catch (e) {}
  }

  let peerJsLoadPromise = null;

  function loadPeerJs() {
    if (window.Peer) return Promise.resolve(window.Peer);
    if (peerJsLoadPromise) return peerJsLoadPromise;

    peerJsLoadPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
      script.async = true;
      script.onload = () => resolve(window.Peer || null);
      script.onerror = () => {
        console.warn("PeerJS CDN fallback failed; using local/BroadcastChannel sync.");
        resolve(null);
      };
      document.head.appendChild(script);
    });

    return peerJsLoadPromise;
  }

  async function initOptionalFirebase() {
    if (firebaseReady) return true;
    try {
      const rawConfig =
        window.FIREBASE_CONFIG ||
        (typeof __firebase_config !== "undefined" && __firebase_config
          ? JSON.parse(__firebase_config)
          : null);
      if (!rawConfig) return false;

      const appMod = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
      const authMod = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
      firestoreMod = await import(
        "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"
      );

      const app = appMod.initializeApp(rawConfig);
      const auth = authMod.getAuth(app);
      db = firestoreMod.getFirestore(app);

      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        const cred = await authMod.signInWithCustomToken(auth, __initial_auth_token);
        authUser = cred.user;
      } else {
        const cred = await authMod.signInAnonymously(auth);
        authUser = cred.user;
      }
      firebaseReady = Boolean(db && authUser);
      return firebaseReady;
    } catch (err) {
      firebaseReady = false;
      return false;
    }
  }

  function getFirestoreRoomRef(code) {
    const appId = typeof __app_id !== "undefined" ? __app_id : "party-feud-app";
    return firestoreMod.doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "feud_rooms",
      code.toUpperCase()
    );
  }

  function openBroadcastChannel(code) {
    if (broadcastChan) {
      try {
        broadcastChan.close();
      } catch (e) {}
      broadcastChan = null;
    }
    if (typeof BroadcastChannel === "undefined") return;

    try {
      broadcastChan = new BroadcastChannel(`party_feud_channel_${code.toUpperCase()}`);
      broadcastChan.onmessage = (ev) => {
        const msg = ev.data;
        if (!msg || typeof msg !== "object") return;

        if (msg.type === "STATE_UPDATE" && msg.state) {
          lastLocalSyncAt = Date.now();
          if (!isPrimaryHostPeer && reconnectAttempt > 0) {
            reconnectAttempt = 0;
            notifyStatus(`Room: ${currentCode} • Live`, true);
          }
          if (onRemoteStateCallback) onRemoteStateCallback(msg.state);
        } else if (msg.type === "BUZZ" && (currentRole === "host" || currentRole === "solo")) {
          handleIncomingBuzzOnHost(msg.team);
        } else if (
          msg.type === "REQUEST_STATE" &&
          (currentRole === "host" || isPrimaryHostPeer)
        ) {
          const st = getLocalStateCallback ? getLocalStateCallback() : null;
          if (st && broadcastChan) {
            broadcastChan.postMessage({ type: "STATE_UPDATE", state: st });
          }
        } else if (msg.type === "CLAIM_ROLE_CHECK" && msg.clientId !== tabClientId) {
          const selfConflicts =
            (currentRole === "buzzer1" ||
              currentRole === "buzzer2" ||
              currentRole === "buzzer_combo") &&
            buzzerRolesConflict(currentRole, msg.role);
          const hostConflicts =
            isPrimaryHostPeer && Boolean(findActiveTeamBuzzer(msg.role, msg.clientId));
          if ((selfConflicts || hostConflicts) && broadcastChan) {
            broadcastChan.postMessage({
              type: "ROLE_IN_USE",
              role: msg.role,
              targetClientId: msg.clientId
            });
          }
        } else if (
          msg.type === "ROLE_IN_USE" &&
          msg.targetClientId === tabClientId &&
          pendingRoleCheck &&
          pendingRoleCheck.role === msg.role
        ) {
          pendingRoleCheck.resolve(true);
        } else if (msg.type === "BUZZER_PRESENCE" && msg.clientId !== tabClientId) {
          if (msg.role === "buzzer1" || msg.role === "buzzer2" || msg.role === "buzzer_combo") {
            const prev = getConnectedBuzzerTeams();
            localBuzzerTabs.set(msg.clientId, { role: msg.role, lastSeenAt: Date.now() });
            const next = getConnectedBuzzerTeams();
            if (prev.b1 !== next.b1 || prev.b2 !== next.b2 || prev.combo !== next.combo) {
              persistActiveBuzzers();
              notifyStatus(`Room: ${currentCode} • Live`, true);
            }
          }
        } else if (msg.type === "BUZZER_GOODBYE" && msg.clientId !== tabClientId) {
          if (localBuzzerTabs.delete(msg.clientId)) {
            persistActiveBuzzers();
            notifyStatus(`Room: ${currentCode} • Live`, true);
          }
        } else if (msg.type === "PROBE_BUZZERS" && msg.clientId !== tabClientId) {
          const isBuzzerOrHost =
            isPrimaryHostPeer ||
            currentRole === "buzzer1" ||
            currentRole === "buzzer2" ||
            currentRole === "buzzer_combo";
          if (isBuzzerOrHost && broadcastChan) {
            broadcastChan.postMessage({
              type: "BUZZERS_REPORT",
              targetClientId: msg.clientId,
              buzzers: getConnectedBuzzerTeams()
            });
          }
        }
      };
    } catch (e) {}
  }

  async function startHostRoomSync(code, initialState) {
    cleanupSync();
    currentCode = code.toUpperCase();
    currentRole = code === "SOLO" ? "solo" : "host";
    isPrimaryHostPeer = true;

    Feud.saveRoomStateToStorage(currentCode, initialState);
    openBroadcastChannel(currentCode);

    if (broadcastChan) {
      try {
        broadcastChan.postMessage({ type: "STATE_UPDATE", state: initialState });
      } catch (e) {}
    }

    if (code === "SOLO") {
      notifyStatus("Room: SOLO (Single-Screen)", true);
      return;
    }

    const hasFb = await initOptionalFirebase();
    if (hasFb) {
      try {
        await firestoreMod.setDoc(getFirestoreRoomRef(currentCode), initialState);
        subscribeFirestoreRoom(currentCode);
      } catch (e) {}
    }

    const PeerClass = await loadPeerJs();
    if (!PeerClass) {
      notifyStatus(`Room: ${currentCode} (Local Sync)`, true);
      return;
    }

    createHostPeer(PeerClass, currentCode, 0);
  }

  // Creates (or re-creates) the Host's listening peer. If the room ID is still held by a stale session
  // (e.g. after a page reload) or the peer dies, it keeps retrying so phones can always reconnect.
  function createHostPeer(PeerClass, code, attempt) {
    if (!isPrimaryHostPeer || currentCode !== code) return;
    if (peerInstance) {
      try {
        peerInstance.destroy();
      } catch (e) {}
      peerInstance = null;
    }

    const retry = (delayMs) => {
      clearTimeout(hostRetryTimer);
      hostRetryTimer = setTimeout(() => createHostPeer(PeerClass, code, attempt + 1), delayMs);
    };

    try {
      const peer = new PeerClass(PEER_PREFIX + code, {
        debug: 1,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ]
        }
      });
      peerInstance = peer;

      peer.on("open", () => {
        clearTimeout(hostRetryTimer);
        updateHostPeerBadge();
      });

      peer.on("connection", (conn) => {
        setupIncomingClientConnection(conn);
      });

      peer.on("disconnected", () => {
        if (peerInstance !== peer || peer.destroyed) return;
        notifyStatus(`Room: ${code} • Re-registering…`, false);
        try {
          peer.reconnect();
        } catch (e) {
          retry(3000);
        }
        clearTimeout(hostRetryTimer);
        hostRetryTimer = setTimeout(() => {
          if (peerInstance === peer && peer.disconnected && !peer.destroyed) {
            createHostPeer(PeerClass, code, attempt + 1);
          }
        }, 4500);
      });

      peer.on("close", () => {
        if (peerInstance === peer) retry(3000);
      });

      peer.on("error", (err) => {
        if (peerInstance !== peer) return;
        const type = (err && err.type) || "";
        if (type === "unavailable-id") {
          // Previous session still owns the ID on the signaling server; it frees up within ~a minute
          notifyStatus(`Room: ${code} • Reclaiming room…`, false);
          retry(Math.min(10000, 2500 + attempt * 1000));
        } else if (
          type === "network" ||
          type === "server-error" ||
          type === "socket-error" ||
          type === "socket-closed"
        ) {
          notifyStatus(`Room: ${code} • Network issue, retrying…`, false);
          retry(4000);
        } else {
          updateHostPeerBadge();
        }
      });
    } catch (e) {
      retry(4000);
    }
  }

  // Checks if a team's podium buzzer is already actively held by another tab/device.
  // Cleans up any stale or same-tab connections along the way.
  function buzzerRolesConflict(r1, r2) {
    if (r1 === r2) return true;
    if (r1 === "buzzer_combo" && (r2 === "buzzer1" || r2 === "buzzer2")) return true;
    if (r2 === "buzzer_combo" && (r1 === "buzzer1" || r1 === "buzzer2")) return true;
    return false;
  }

  function findActiveTeamBuzzer(role, incomingClientId) {
    if (role !== "buzzer1" && role !== "buzzer2" && role !== "buzzer_combo") return null;
    const now = Date.now();
    for (const [peerId, entry] of Array.from(hostConnections.entries())) {
      if (!buzzerRolesConflict(entry.role, role)) continue;
      if (incomingClientId && entry.clientId === incomingClientId) {
        try {
          entry.conn.close();
        } catch (e) {}
        hostConnections.delete(peerId);
        continue;
      }
      const isAlive = entry.conn && entry.conn.open && now - (entry.lastSeenAt || 0) < 12000;
      if (isAlive) {
        return entry;
      }
      try {
        entry.conn.close();
      } catch (e) {}
      hostConnections.delete(peerId);
    }
    return null;
  }

  function setupIncomingClientConnection(conn) {
    const onOpen = () => {
      hostConnections.set(conn.peer, { conn, role: "client", clientId: "", lastSeenAt: Date.now() });
      updateHostPeerBadge();
      const st = getLocalStateCallback ? getLocalStateCallback() : null;
      if (st) {
        try {
          conn.send({ type: "STATE_UPDATE", state: st });
        } catch (e) {}
      }
    };
    if (conn.open) {
      onOpen();
    } else {
      conn.on("open", onOpen);
    }

    conn.on("data", (msg) => {
      if (!msg || typeof msg !== "object") return;
      const st = getLocalStateCallback ? getLocalStateCallback() : null;
      const existing = hostConnections.get(conn.peer);
      if (existing) existing.lastSeenAt = Date.now();

      if (msg.type === "PING") {
        try {
          conn.send({ type: "PONG", t: msg.t || 0 });
        } catch (e) {}
        return;
      }

      if (msg.type === "BYE") {
        hostConnections.delete(conn.peer);
        updateHostPeerBadge();
        try {
          conn.close();
        } catch (e) {}
        return;
      }

      if (msg.type === "PROBE_BUZZERS") {
        try {
          conn.send({ type: "BUZZERS_REPORT", buzzers: getConnectedBuzzerTeams() });
        } catch (e) {}
        return;
      }

      if (msg.type === "HELLO") {
        if (msg.role === "host") {
          if (st && String(msg.pin) !== String(st.pin)) {
            conn.send({ type: "AUTH_DENIED", reason: "Incorrect Host PIN!" });
            setTimeout(() => conn.close(), 300);
            return;
          }
        }
        if (msg.role === "buzzer1" || msg.role === "buzzer2" || msg.role === "buzzer_combo") {
          const active = findActiveTeamBuzzer(msg.role, msg.clientId || "");
          if (active) {
            const label =
              msg.role === "buzzer_combo"
                ? "A Team Buzzer"
                : `Team ${msg.role === "buzzer1" ? 1 : 2}'s buzzer`;
            conn.send({
              type: "AUTH_DENIED",
              reason: `🔒 ${label} is already open on another device!`
            });
            hostConnections.delete(conn.peer);
            updateHostPeerBadge();
            setTimeout(() => {
              try {
                conn.close();
              } catch (e) {}
            }, 300);
            return;
          }
        }
        hostConnections.set(conn.peer, {
          conn,
          role: msg.role || "client",
          clientId: msg.clientId || "",
          lastSeenAt: Date.now()
        });
        updateHostPeerBadge();
        if (st) conn.send({ type: "STATE_UPDATE", state: st });
      } else if (msg.type === "BUZZ") {
        handleIncomingBuzzOnHost(Number(msg.team));
      } else if (msg.type === "HOST_PATCH" && msg.patch) {
        if (st) {
          const merged = { ...st, ...msg.patch, updatedAt: Date.now() };
          Feud.saveRoomStateToStorage(currentCode, merged);
          if (onRemoteStateCallback) onRemoteStateCallback(merged);
          broadcastFromHostToPeers(merged);
        }
      }
    });

    const handleClose = () => {
      hostConnections.delete(conn.peer);
      updateHostPeerBadge();
    };
    conn.on("close", handleClose);
    conn.on("error", handleClose);
  }

  function persistActiveBuzzers() {
    if (!isPrimaryHostPeer || !currentCode) return;
    try {
      const bz = getConnectedBuzzerTeams();
      localStorage.setItem(
        `party_feud_active_buzzers_${currentCode}`,
        JSON.stringify({ ...bz, updatedAt: Date.now() })
      );
    } catch (e) {}
  }

  function updateHostPeerBadge() {
    persistActiveBuzzers();
    const count = hostConnections.size;
    if (count > 0) {
      notifyStatus(`Room: ${currentCode} • 📱 ${count} Connected`, true);
    } else {
      notifyStatus(`Room: ${currentCode} • Ready`, true);
    }
  }

  // Single source of truth for whether a buzz is legal in the current room state.
  // Returns the patch to apply, or null if the buzz must be rejected (late tap / wrong phase).
  function buildBuzzPatch(st, teamNum) {
    if (!st || (teamNum !== 1 && teamNum !== 2)) return null;
    const phase = st.roundPhase || (st.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    const dur = Number(st.turnTimerDuration) || 10;
    if (st.stage && st.stage !== "main") return null;

    // The podium buzzers are ONLY active during faceoff-buzz once the question is revealed on TV;
    // all earlier or later taps are locked out until the next round's Face-Off question is shown.
    if (phase === "faceoff-buzz" && st.questionRevealed && !st.buzzerWinner) {
      return {
        buzzerWinner: teamNum,
        buzzerArmedTeam: 0,
        controllingTeam: teamNum,
        faceoffFirstTeam: teamNum,
        roundPhase: "faceoff-p1",
        questionRevealed: true,
        turnTimerRemaining: dur,
        turnTimerRunning: true
      };
    }

    return null; // Locked out
  }

  function handleIncomingBuzzOnHost(teamNum) {
    const st = getLocalStateCallback ? getLocalStateCallback() : null;
    const patch = buildBuzzPatch(st, teamNum);
    if (!patch) return;

    const updated = { ...st, ...patch, updatedAt: Date.now() };
    Feud.saveRoomStateToStorage(currentCode, updated);
    if (onRemoteStateCallback) onRemoteStateCallback(updated);
    broadcastFromHostToPeers(updated);

    if (firebaseReady && db && firestoreMod && currentRole !== "solo") {
      firestoreMod
        .updateDoc(getFirestoreRoomRef(currentCode), { ...patch, updatedAt: Date.now() })
        .catch(() => {});
    }
  }

  function broadcastFromHostToPeers(fullState) {
    if (broadcastChan) {
      try {
        broadcastChan.postMessage({ type: "STATE_UPDATE", state: fullState });
      } catch (e) {}
    }
    hostConnections.forEach(({ conn }) => {
      if (conn && conn.open) {
        try {
          conn.send({ type: "STATE_UPDATE", state: fullState });
        } catch (e) {}
      }
    });
  }

  function checkSameBrowserRoleInUse(role) {
    if (
      !broadcastChan ||
      (role !== "buzzer1" && role !== "buzzer2" && role !== "buzzer_combo")
    ) {
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (pendingRoleCheck && pendingRoleCheck.role === role) {
          pendingRoleCheck = null;
        }
        resolve(false);
      }, 220);
      pendingRoleCheck = {
        role,
        resolve: (inUse) => {
          clearTimeout(timer);
          pendingRoleCheck = null;
          resolve(Boolean(inUse));
        }
      };
      try {
        broadcastChan.postMessage({
          type: "CLAIM_ROLE_CHECK",
          role,
          clientId: tabClientId
        });
      } catch (e) {
        clearTimeout(timer);
        pendingRoleCheck = null;
        resolve(false);
      }
    });
  }

  async function joinExistingRoomSync({ code, role, pin = "" }) {
    cleanupSync();
    currentCode = code.toUpperCase();
    currentRole = role;
    isPrimaryHostPeer = false;

    openBroadcastChannel(currentCode);

    const localState = Feud.loadRoomStateFromStorage(currentCode);
    if (localState) {
      if (role === "host" && String(localState.pin) !== String(pin)) {
        cleanupSync();
        return { ok: false, error: "❌ Incorrect Host PIN! Access denied." };
      }
      if (role === "buzzer1" || role === "buzzer2" || role === "buzzer_combo") {
        const alreadyOpen = await checkSameBrowserRoleInUse(role);
        if (alreadyOpen) {
          const label =
            role === "buzzer_combo"
              ? "A Team Buzzer"
              : `Team ${role === "buzzer1" ? 1 : 2}'s buzzer`;
          cleanupSync();
          return {
            ok: false,
            error: `🔒 ${label} is already open in another tab or device!`
          };
        }
      }
      hasLocalBroadcastSync = Boolean(broadcastChan);
      lastLocalSyncAt = Date.now();
      if (broadcastChan) {
        try {
          broadcastChan.postMessage({ type: "REQUEST_STATE" });
          if (role === "buzzer1" || role === "buzzer2" || role === "buzzer_combo") {
            broadcastChan.postMessage({
              type: "BUZZER_PRESENCE",
              role,
              clientId: tabClientId
            });
            clearInterval(localPresenceTimer);
            localPresenceTimer = setInterval(() => {
              if (!broadcastChan) return;
              try {
                broadcastChan.postMessage({
                  type: "BUZZER_PRESENCE",
                  role,
                  clientId: tabClientId
                });
              } catch (e) {}
            }, 4000);
          }
        } catch (e) {}
      }
      connectPeerClient({ code: currentCode, role, pin }).catch(() => {});
      notifyStatus(`Room: ${currentCode} • Live`, true);
      return { ok: true, state: localState };
    }

    const hasFb = await initOptionalFirebase();
    if (hasFb) {
      try {
        const snap = await firestoreMod.getDoc(getFirestoreRoomRef(currentCode));
        if (snap.exists()) {
          const data = snap.data();
          if (role === "host" && String(data.pin) !== String(pin)) {
            return { ok: false, error: "❌ Incorrect Host PIN! Access denied." };
          }
          subscribeFirestoreRoom(currentCode);
          notifyStatus(`Room: ${currentCode}`, true);
          return { ok: true, state: data };
        }
      } catch (e) {}
    }

    return await connectPeerClient({ code: currentCode, role, pin });
  }

  function connectPeerClient({ code, role, pin, initialRetriesLeft = 2 }) {
    clientJoinInfo = { code, role, pin };
    const myGen = ++clientGen;
    const isStale = () => myGen !== clientGen || currentCode !== code || currentRole === "lobby";

    return new Promise(async (resolve) => {
      const PeerClass = await loadPeerJs();
      if (!PeerClass) {
        resolve({ ok: false, error: "Network sync unavailable." });
        return;
      }
      if (isStale()) {
        resolve({ ok: false, error: "Connection superseded." });
        return;
      }

      let settled = false;
      let everConnected = false;
      let joinStage = "signaling";
      const finish = (res) => {
        if (!settled) {
          settled = true;
          resolve(res);
        }
      };
      // Any failure after the first successful join (or during a background retry) -> keep retrying
      const fail = (res) => {
        clearTimeout(timeoutId);
        finish(res);
        if (!isStale() && (everConnected || reconnectAttempt > 0)) {
          scheduleClientReconnect(code, role, pin);
        }
      };

      const timeoutId = setTimeout(() => {
        const detailHint =
          joinStage === "signaling"
            ? "Signaling server unreachable"
            : joinStage === "ice-connecting"
            ? "WebRTC P2P blocked or Host offline"
            : "No response from Host";
        fail({
          ok: false,
          error: `Room "${code}" not found (${detailHint}). Check the Host screen.`
        });
      }, 12000);

      // Tear down any previous (dead) client peer before creating a new one
      if (clientConn) {
        try {
          clientConn.close();
        } catch (e) {}
        clientConn = null;
      }
      if (peerInstance && !isPrimaryHostPeer) {
        try {
          peerInstance.destroy();
        } catch (e) {}
        peerInstance = null;
      }

      try {
        const peer = new PeerClass({
          debug: 1,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" }
            ]
          }
        });
        peerInstance = peer;

        peer.on("open", () => {
          if (isStale()) return;
          joinStage = "ice-connecting";
          const conn = peer.connect(PEER_PREFIX + code, { reliable: true });
          clientConn = conn;

          conn.on("open", () => {
            if (isStale()) return;
            joinStage = "waiting-state";
            everConnected = true;
            reconnectAttempt = 0;
            lastPongAt = Date.now();
            conn.send({ type: "HELLO", role, pin, clientId: tabClientId });
            notifyStatus(`Room: ${code} • Live`, true);
            startHeartbeat(myGen);
          });

          conn.on("data", (msg) => {
            if (isStale() || !msg || typeof msg !== "object") return;
            lastPongAt = Date.now();
            if (reconnectAttempt > 0) {
              reconnectAttempt = 0;
              clearTimeout(reconnectTimer);
              notifyStatus(`Room: ${code} • Live`, true);
            }
            if (msg.type === "PONG") return;
            if (msg.type === "AUTH_DENIED") {
              clearTimeout(timeoutId);
              const reason = msg.reason || "❌ Access denied!";
              const wasAlreadyJoined = settled;
              cleanupSync();
              finish({ ok: false, error: reason });
              if (wasAlreadyJoined && onForcedExitCallback) {
                onForcedExitCallback(reason);
              }
              return;
            }
            if (msg.type === "STATE_UPDATE" && msg.state) {
              clearTimeout(timeoutId);
              Feud.saveRoomStateToStorage(code, msg.state);
              finish({ ok: true, state: msg.state });
              if (onRemoteStateCallback) onRemoteStateCallback(msg.state);
            }
          });

          conn.on("close", () => {
            if (isStale()) return;
            fail({ ok: false, error: `Connection to Room "${code}" closed.` });
          });

          conn.on("error", () => {
            if (isStale()) return;
            fail({ ok: false, error: `Could not connect to Room "${code}".` });
          });
        });

        peer.on("disconnected", () => {
          // Lost the signaling server only — the data channel may still be fine; re-register quietly
          if (isStale() || peer.destroyed) return;
          try {
            peer.reconnect();
          } catch (e) {}
        });

        peer.on("error", (err) => {
          if (isStale()) return;
          // If the P2P data channel is already open, don't tear it down for a signaling blip
          if (clientConn && clientConn.open) return;
          if (err && err.type === "peer-unavailable") {
            if (!everConnected && initialRetriesLeft > 0 && !isStale()) {
              clearTimeout(timeoutId);
              setTimeout(() => {
                if (isStale()) return;
                connectPeerClient({
                  code,
                  role,
                  pin,
                  initialRetriesLeft: initialRetriesLeft - 1
                }).then(finish);
              }, 1200);
              return;
            }
            fail({
              ok: false,
              error: `Room "${code}" not found. Make sure the Host phone created Room ${code} and has its screen awake.`
            });
          } else {
            const errType = (err && err.type) || "network";
            if (
              !everConnected &&
              initialRetriesLeft > 0 &&
              !isStale() &&
              (errType === "network" ||
                errType === "socket-error" ||
                errType === "server-error" ||
                errType === "webrtc")
            ) {
              clearTimeout(timeoutId);
              setTimeout(() => {
                if (isStale()) return;
                connectPeerClient({
                  code,
                  role,
                  pin,
                  initialRetriesLeft: initialRetriesLeft - 1
                }).then(finish);
              }, 1200);
              return;
            }
            fail({ ok: false, error: `Connection error (${errType}).` });
          }
        });
      } catch (e) {
        fail({ ok: false, error: "Could not initialize P2P connection." });
      }
    });
  }

  // Sends a PING every 4s; if nothing has been heard from the Host for 12s, the link is presumed dead
  // (common when a phone sleeps or switches Wi-Fi/cell) and a fresh connection is made.
  function startHeartbeat(gen) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (gen !== clientGen || currentRole === "lobby" || !clientJoinInfo) {
        clearInterval(heartbeatTimer);
        return;
      }
      if (clientConn && clientConn.open) {
        try {
          clientConn.send({ type: "PING", t: Date.now() });
        } catch (e) {}
      }
      if (Date.now() - lastPongAt > 12000) {
        clearInterval(heartbeatTimer);
        const { code, role, pin } = clientJoinInfo;
        scheduleClientReconnect(code, role, pin, 0);
      }
    }, 4000);
  }

  function scheduleClientReconnect(code, role, pin, forcedDelay) {
    clearTimeout(reconnectTimer);
    if (currentRole === "lobby" || currentCode !== code || isPrimaryHostPeer) return;
    clearInterval(heartbeatTimer);
    reconnectAttempt += 1;
    // If same-browser BroadcastChannel/localStorage sync is active, stay green instead of alarming the user
    if (hasLocalBroadcastSync || Date.now() - lastLocalSyncAt < 20000) {
      notifyStatus(`Room: ${code} • Live`, true);
    } else {
      notifyStatus(`Room: ${code} • Reconnecting… (try ${reconnectAttempt})`, false);
    }
    const delay =
      forcedDelay !== undefined ? forcedDelay : Math.min(10000, 1500 + reconnectAttempt * 1000);
    reconnectTimer = setTimeout(() => {
      if (currentRole === "lobby" || currentCode !== code) return;
      connectPeerClient({ code, role, pin }).catch(() => {});
    }, delay);
  }

  // Reconnect immediately when a phone wakes up or regains network
  function reconnectNowIfDead() {
    if (!clientJoinInfo || isPrimaryHostPeer || currentRole === "lobby") return;
    if (clientConn && clientConn.open && Date.now() - lastPongAt < 12000) return;
    const { code, role, pin } = clientJoinInfo;
    if (code !== currentCode) return;
    scheduleClientReconnect(code, role, pin, 0);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") reconnectNowIfDead();
  });
  window.addEventListener("online", reconnectNowIfDead);
  window.addEventListener("focus", reconnectNowIfDead);

  async function syncPushPatch(patch, fullUpdatedState) {
    if (!currentCode) return;

    Feud.saveRoomStateToStorage(currentCode, fullUpdatedState);

    if (isPrimaryHostPeer) {
      broadcastFromHostToPeers(fullUpdatedState);
    } else {
      if (broadcastChan) {
        try {
          broadcastChan.postMessage({ type: "STATE_UPDATE", state: fullUpdatedState });
        } catch (e) {}
      }
      if (clientConn && clientConn.open) {
        try {
          clientConn.send({ type: "HOST_PATCH", patch });
        } catch (e) {}
      }
    }

    if (firebaseReady && db && currentRole !== "solo") {
      try {
        await firestoreMod.updateDoc(getFirestoreRoomRef(currentCode), {
          ...patch,
          updatedAt: Date.now()
        });
      } catch (e) {}
    }
  }

  async function syncSendTeamBuzz(teamNum) {
    if (!currentCode) return;

    if (broadcastChan) {
      try {
        broadcastChan.postMessage({ type: "BUZZ", team: teamNum });
      } catch (e) {}
    }

    if (clientConn && clientConn.open) {
      try {
        clientConn.send({ type: "BUZZ", team: teamNum });
        // Idempotent 120ms backup burst in case a waking socket drops the first frame
        setTimeout(() => {
          if (clientConn && clientConn.open) {
            try {
              clientConn.send({ type: "BUZZ", team: teamNum });
            } catch (e) {}
          }
        }, 120);
      } catch (e) {}
    } else {
      reconnectNowIfDead();
    }

    if (isPrimaryHostPeer || currentRole === "solo") {
      handleIncomingBuzzOnHost(teamNum);
    }

    if (firebaseReady && db && firestoreMod && firestoreMod.runTransaction) {
      try {
        const ref = getFirestoreRoomRef(currentCode);
        await firestoreMod.runTransaction(db, async (tx) => {
          const snap = await tx.get(ref);
          if (!snap.exists()) return;
          const data = snap.data();
          const patch = buildBuzzPatch(data, teamNum);
          if (patch) {
            tx.update(ref, { ...patch, updatedAt: Date.now() });
          }
        });
      } catch (e) {}
    }
  }

  function subscribeFirestoreRoom(code) {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    if (!firebaseReady || !db) return;

    unsubscribeFirestore = firestoreMod.onSnapshot(
      getFirestoreRoomRef(code),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        Feud.saveRoomStateToStorage(code, data);
        if (onRemoteStateCallback) onRemoteStateCallback(data);
      },
      (err) => console.warn("Firestore snapshot error:", err)
    );
  }

  function cleanupSync() {
    clearTimeout(reconnectTimer);
    clearTimeout(hostRetryTimer);
    clearInterval(heartbeatTimer);
    clearInterval(localPresenceTimer);
    localPresenceTimer = null;
    pendingRoleCheck = null;
    hasLocalBroadcastSync = false;
    lastLocalSyncAt = 0;
    clientGen += 1;
    clientJoinInfo = null;
    reconnectAttempt = 0;
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    if (broadcastChan) {
      try {
        if (
          currentRole === "buzzer1" ||
          currentRole === "buzzer2" ||
          currentRole === "buzzer_combo"
        ) {
          broadcastChan.postMessage({
            type: "BUZZER_GOODBYE",
            role: currentRole,
            clientId: tabClientId
          });
        }
        broadcastChan.close();
      } catch (e) {}
      broadcastChan = null;
    }
    localBuzzerTabs.clear();
    hostConnections.forEach(({ conn }) => {
      try {
        conn.close();
      } catch (e) {}
    });
    hostConnections.clear();
    if (clientConn) {
      try {
        if (clientConn.open) {
          clientConn.send({ type: "BYE", role: currentRole, clientId: tabClientId });
        }
        clientConn.close();
      } catch (e) {}
      clientConn = null;
    }
    if (peerInstance) {
      try {
        peerInstance.destroy();
      } catch (e) {}
      peerInstance = null;
    }
    isPrimaryHostPeer = false;
    currentCode = "";
    currentRole = "lobby";
  }

  window.addEventListener("pagehide", () => {
    if (
      broadcastChan &&
      (currentRole === "buzzer1" || currentRole === "buzzer2" || currentRole === "buzzer_combo")
    ) {
      try {
        broadcastChan.postMessage({
          type: "BUZZER_GOODBYE",
          role: currentRole,
          clientId: tabClientId
        });
      } catch (e) {}
    }
    if (clientConn && clientConn.open) {
      try {
        clientConn.send({ type: "BYE", role: currentRole, clientId: tabClientId });
      } catch (e) {}
    }
    if (isPrimaryHostPeer && peerInstance && !peerInstance.destroyed) {
      try {
        peerInstance.destroy();
      } catch (e) {}
    }
  });

  function probeRoomBuzzers(code, opts = {}) {
    const clean = String(code || "").trim().toUpperCase();
    const merged = { t1: false, t2: false, b1: false, b2: false, combo: false };
    if (clean.length < 4) {
      return Promise.resolve(merged);
    }

    try {
      const raw = localStorage.getItem(`party_feud_active_buzzers_${clean}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Date.now() - (parsed.updatedAt || 0) < 15000) {
          if (parsed.b1) merged.b1 = true;
          if (parsed.b2) merged.b2 = true;
          if (parsed.combo) merged.combo = true;
        }
      }
    } catch (e) {}

    const bcProbe = new Promise((resolve) => {
      if (typeof BroadcastChannel === "undefined") {
        resolve(merged);
        return;
      }
      let ch = null;
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        try {
          if (ch) ch.close();
        } catch (e) {}
        merged.t1 = merged.b1 || merged.combo;
        merged.t2 = merged.b2 || merged.combo;
        resolve(merged);
      };
      const timer = setTimeout(finish, 180);
      try {
        ch = new BroadcastChannel(`party_feud_channel_${clean}`);
        ch.onmessage = (ev) => {
          const msg = ev.data;
          if (!msg || msg.type !== "BUZZERS_REPORT" || msg.targetClientId !== tabClientId) return;
          const b = msg.buzzers || {};
          if (b.b1) merged.b1 = true;
          if (b.b2) merged.b2 = true;
          if (b.combo) merged.combo = true;
          clearTimeout(timer);
          setTimeout(finish, 40);
        };
        ch.postMessage({ type: "PROBE_BUZZERS", clientId: tabClientId });
      } catch (e) {
        clearTimeout(timer);
        finish();
      }
    });

    return bcProbe.then(async (localRes) => {
      if (
        localRes.b1 ||
        localRes.b2 ||
        localRes.combo ||
        !opts.allowPeer ||
        window.location.protocol === "file:"
      ) {
        return localRes;
      }
      const PeerClass = await loadPeerJs();
      if (!PeerClass) return localRes;
      return await new Promise((resolve) => {
        let p = null;
        let conn = null;
        let done = false;
        const finishPeer = (res) => {
          if (done) return;
          done = true;
          try {
            if (conn) conn.close();
          } catch (e) {}
          try {
            if (p) p.destroy();
          } catch (e) {}
          resolve(res);
        };
        const t = setTimeout(() => finishPeer(localRes), 2500);
        try {
          p = new PeerClass();
          p.on("open", () => {
            conn = p.connect(`${PEER_PREFIX}${clean}`, { reliable: true });
            conn.on("open", () => {
              try {
                conn.send({ type: "PROBE_BUZZERS", clientId: tabClientId });
              } catch (e) {}
            });
            conn.on("data", (msg) => {
              if (msg && msg.type === "BUZZERS_REPORT" && msg.buzzers) {
                clearTimeout(t);
                const b = msg.buzzers;
                finishPeer({
                  b1: Boolean(b.b1),
                  b2: Boolean(b.b2),
                  combo: Boolean(b.combo),
                  t1: Boolean(b.b1 || b.combo),
                  t2: Boolean(b.b2 || b.combo)
                });
              }
            });
            conn.on("error", () => {
              clearTimeout(t);
              finishPeer(localRes);
            });
          });
          p.on("error", () => {
            clearTimeout(t);
            finishPeer(localRes);
          });
        } catch (e) {
          clearTimeout(t);
          finishPeer(localRes);
        }
      });
    });
  }

  Object.assign(Feud, {
    initSyncCallbacks,
    getConnectedBuzzerTeams,
    probeRoomBuzzers,
    startHostRoomSync,
    joinExistingRoomSync,
    syncPushPatch,
    syncSendTeamBuzz,
    buildBuzzPatch,
    cleanupSync
  });
})(window.Feud);
