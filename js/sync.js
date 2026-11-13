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

  // Optional Firebase state
  let firebaseReady = false;
  let db = null;
  let authUser = null;
  let unsubscribeFirestore = null;
  let firestoreMod = null;

  let onRemoteStateCallback = null;
  let onConnectionStatusCallback = null;
  let getLocalStateCallback = null;

  function initSyncCallbacks({ onRemoteState, onStatusChange, getLocalState }) {
    onRemoteStateCallback = onRemoteState;
    onConnectionStatusCallback = onStatusChange;
    getLocalStateCallback = getLocalState;

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

    const peerId = PEER_PREFIX + currentCode;
    try {
      peerInstance = new PeerClass(peerId, { debug: 1 });

      peerInstance.on("open", () => {
        updateHostPeerBadge();
      });

      peerInstance.on("connection", (conn) => {
        setupIncomingClientConnection(conn);
      });

      peerInstance.on("disconnected", () => {
        if (peerInstance && !peerInstance.destroyed) {
          try {
            peerInstance.reconnect();
          } catch (e) {}
        }
      });

      peerInstance.on("error", () => {
        notifyStatus(`Room: ${currentCode}`, true);
      });
    } catch (e) {
      notifyStatus(`Room: ${currentCode}`, true);
    }
  }

  function setupIncomingClientConnection(conn) {
    conn.on("open", () => {
      hostConnections.set(conn.peer, { conn, role: "client" });
      updateHostPeerBadge();
      const st = getLocalStateCallback ? getLocalStateCallback() : null;
      if (st) {
        conn.send({ type: "STATE_UPDATE", state: st });
      }
    });

    conn.on("data", (msg) => {
      if (!msg || typeof msg !== "object") return;
      const st = getLocalStateCallback ? getLocalStateCallback() : null;

      if (msg.type === "HELLO") {
        if (msg.role === "host") {
          if (st && String(msg.pin) !== String(st.pin)) {
            conn.send({ type: "AUTH_DENIED", reason: "Incorrect Host PIN!" });
            setTimeout(() => conn.close(), 300);
            return;
          }
        }
        hostConnections.set(conn.peer, { conn, role: msg.role || "client" });
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

  function handleIncomingBuzzOnHost(teamNum) {
    if (teamNum !== 1 && teamNum !== 2) return;
    const st = getLocalStateCallback ? getLocalStateCallback() : null;
    if (!st || st.buzzerWinner !== 0) return;

    const updated = { ...st, buzzerWinner: teamNum, updatedAt: Date.now() };
    Feud.saveRoomStateToStorage(currentCode, updated);
    if (onRemoteStateCallback) onRemoteStateCallback(updated);
    broadcastFromHostToPeers(updated);
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

  async function joinExistingRoomSync({ code, role, pin = "" }) {
    cleanupSync();
    currentCode = code.toUpperCase();
    currentRole = role;
    isPrimaryHostPeer = false;

    openBroadcastChannel(currentCode);

    const localState = Feud.loadRoomStateFromStorage(currentCode);
    if (localState) {
      if (role === "host" && String(localState.pin) !== String(pin)) {
        return { ok: false, error: "❌ Incorrect Host PIN! Access denied." };
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
    return new Promise(async (resolve) => {
      const PeerClass = await loadPeerJs();
      if (!PeerClass) {
        resolve({ ok: false, error: "Network sync unavailable. Try Single-Screen Mode." });
        return;
      }

      let settled = false;
      const finish = (res) => {
        if (!settled) {
          settled = true;
          resolve(res);
        }
      };

      const timeoutId = setTimeout(() => {
        finish({
          ok: false,
          error: `Room "${code}" not found or Host phone is asleep. Check the code on Host phone.`
        });
      }, 8500);

      try {
        peerInstance = new PeerClass({ debug: 1 });

        peerInstance.on("open", () => {
          const conn = peerInstance.connect(PEER_PREFIX + code, { reliable: true });
          clientConn = conn;

          conn.on("open", () => {
            conn.send({ type: "HELLO", role, pin });
            notifyStatus(`Room: ${code} • Live`, true);
          });

          conn.on("data", (msg) => {
            if (!msg || typeof msg !== "object") return;
            if (msg.type === "AUTH_DENIED") {
              clearTimeout(timeoutId);
              finish({ ok: false, error: msg.reason || "❌ Incorrect Host PIN!" });
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
            notifyStatus(`Room: ${code} • Reconnecting…`, false);
            scheduleClientReconnect(code, role, pin);
          });

          conn.on("error", () => {
            clearTimeout(timeoutId);
            finish({ ok: false, error: `Could not connect to Room "${code}".` });
          });
        });

        peerInstance.on("error", (err) => {
          clearTimeout(timeoutId);
          if (err && err.type === "peer-unavailable") {
            finish({
              ok: false,
              error: `Room "${code}" not found. Make sure the Host phone created Room ${code} and has its screen awake.`
            });
          } else {
            finish({ ok: false, error: `Connection error (${(err && err.type) || "network"}).` });
          }
        });
      } catch (e) {
        clearTimeout(timeoutId);
        finish({ ok: false, error: "Could not initialize P2P connection." });
      }
    });
  }

  function scheduleClientReconnect(code, role, pin) {
    clearTimeout(reconnectTimer);
    if (currentRole === "lobby" || currentCode !== code) return;
    reconnectTimer = setTimeout(() => {
      if (currentRole !== "lobby" && (!clientConn || !clientConn.open)) {
        connectPeerClient({ code, role, pin }).catch(() => {});
      }
    }, 2500);
  }

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
          if (!data.buzzerWinner || data.buzzerWinner === 0) {
            tx.update(ref, { buzzerWinner: teamNum, updatedAt: Date.now() });
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

  Object.assign(Feud, {
    initSyncCallbacks,
    startHostRoomSync,
    joinExistingRoomSync,
    syncPushPatch,
    syncSendTeamBuzz,
    cleanupSync
  });
})(window.Feud);
