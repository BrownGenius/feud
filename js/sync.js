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
  let clientConn = null;
  let broadcastChan = null;
  let currentCode = "";
  let currentRole = "lobby";
  let isPrimaryHostPeer = false;
  let reconnectTimer = null;
  let hostRetryTimer = null;
  let heartbeatTimer = null;
  let lastPongAt = 0;
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

  function notifyStatus(statusText, isLive = true) {
    if (onConnectionStatusCallback) {
      onConnectionStatusCallback(statusText, isLive);
    }
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
          const isSameActiveBuzzer =
            (msg.role === "buzzer1" || msg.role === "buzzer2") &&
            (currentRole === msg.role ||
              (isPrimaryHostPeer && Boolean(findActiveTeamBuzzer(msg.role, msg.clientId))));
          if (isSameActiveBuzzer && broadcastChan) {
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
      const peer = new PeerClass(PEER_PREFIX + code, { debug: 1 });
      peerInstance = peer;

      peer.on("open", () => {
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
  function findActiveTeamBuzzer(role, incomingClientId) {
    if (role !== "buzzer1" && role !== "buzzer2") return null;
    const now = Date.now();
    for (const [peerId, entry] of Array.from(hostConnections.entries())) {
      if (entry.role !== role) continue;
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

      if (msg.type === "HELLO") {
        if (msg.role === "host") {
          if (st && String(msg.pin) !== String(st.pin)) {
            conn.send({ type: "AUTH_DENIED", reason: "Incorrect Host PIN!" });
            setTimeout(() => conn.close(), 300);
            return;
          }
        }
        if (msg.role === "buzzer1" || msg.role === "buzzer2") {
          const active = findActiveTeamBuzzer(msg.role, msg.clientId || "");
          if (active) {
            const teamNum = msg.role === "buzzer1" ? 1 : 2;
            conn.send({
              type: "AUTH_DENIED",
              reason: `🔒 Team ${teamNum}'s buzzer is already open on another device!`
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

  function updateHostPeerBadge() {
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

    // The podium buzzers are ONLY used at the start of each Face-Off: once the question is shown,
    // the first buzz wins and every later tap is locked out until the next round's Face-Off.
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
    if (!broadcastChan || (role !== "buzzer1" && role !== "buzzer2")) {
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
      if (role === "buzzer1" || role === "buzzer2") {
        const alreadyOpen = await checkSameBrowserRoleInUse(role);
        if (alreadyOpen) {
          const teamNum = role === "buzzer1" ? 1 : 2;
          cleanupSync();
          return {
            ok: false,
            error: `🔒 Team ${teamNum}'s buzzer is already open in another tab or device!`
          };
        }
      }
      if (broadcastChan) {
        try {
          broadcastChan.postMessage({ type: "REQUEST_STATE" });
        } catch (e) {}
      }
      connectPeerClient({ code: currentCode, role, pin }).catch(() => {});
      notifyStatus(`Room: ${currentCode}`, true);
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

  function connectPeerClient({ code, role, pin }) {
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
        fail({
          ok: false,
          error: `Room "${code}" not found or Host phone is asleep. Check the code on Host phone.`
        });
      }, 8500);

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
        const peer = new PeerClass({ debug: 1 });
        peerInstance = peer;

        peer.on("open", () => {
          if (isStale()) return;
          const conn = peer.connect(PEER_PREFIX + code, { reliable: true });
          clientConn = conn;

          conn.on("open", () => {
            if (isStale()) return;
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
          if (err && err.type === "peer-unavailable") {
            fail({
              ok: false,
              error: `Room "${code}" not found. Make sure the Host phone created Room ${code} and has its screen awake.`
            });
          } else {
            fail({ ok: false, error: `Connection error (${(err && err.type) || "network"}).` });
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
    notifyStatus(`Room: ${code} • Reconnecting… (try ${reconnectAttempt})`, false);
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
      } catch (e) {}
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
    pendingRoleCheck = null;
    clientGen += 1;
    clientJoinInfo = null;
    reconnectAttempt = 0;
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    if (broadcastChan) {
      try {
        broadcastChan.close();
      } catch (e) {}
      broadcastChan = null;
    }
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
    if (clientConn && clientConn.open) {
      try {
        clientConn.send({ type: "BYE", role: currentRole, clientId: tabClientId });
      } catch (e) {}
    }
  });

  Object.assign(Feud, {
    initSyncCallbacks,
    startHostRoomSync,
    joinExistingRoomSync,
    syncPushPatch,
    syncSendTeamBuzz,
    buildBuzzPatch,
    cleanupSync
  });
})(window.Feud);
