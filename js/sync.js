// =====================================================================
// HYBRID MULTIPLAYER SYNC ENGINE FOR GITHUB PAGES & LOCAL FILE://
//   1. Trystero (WebRTC P2P via Multi-Relay Nostr Signaling) -> Cross-device Wi-Fi & remote
//   2. BroadcastChannel + localStorage -> Instant dual-window HDMI & same-browser sync
//   3. Optional Firebase Firestore -> Cloud persistence if __firebase_config is provided
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  const TRYSTERO_APP_ID = "party-feud-live-v1";
  const MQTT_BROKERS = [
    { url: "wss://iot.coreflux.cloud:443/mqtt", label: "Coreflux-443" },
    {
      url: "wss://public.cloud.shiftr.io:443",
      label: "Shiftr-443",
      options: { username: "public", password: "public" }
    },
    { url: "wss://broker.emqx.io:8084/mqtt", label: "EMQX-8084" },
    { url: "wss://broker.hivemq.com:8884/mqtt", label: "HiveMQ-8884" }
  ];
  const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" }
  ];

  let trysteroRoom = null;
  let sendP2pAction = null;
  let mqttClient = null;
  let mqttConnected = false;
  let hostMqttClients = new Map(); // brokerUrl -> { client, connected, label }
  let clientPendingMqtt = new Set();
  let hostRelayWarnTimer = null;
  let hostRelayWarned = false;
  let activeMqttBrokerUrl = "";
  let hostConnections = new Map(); // peerId -> { peerId, role, clientId, lastSeenAt, open }
  let localBuzzerTabs = new Map();
  let localTvTabs = new Map();
  let clientHostPeerId = null;
  let clientConnOpen = false;
  let broadcastChan = null;
  let currentCode = "";
  let currentRole = "lobby";
  let isPrimaryHostPeer = false;
  let reconnectTimer = null;
  let heartbeatTimer = null;
  let localPresenceTimer = null;
  let hostSweepTimer = null;
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
  let pendingLocalHostProbe = null;

  function getTabClientId() {
    const fresh = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      // Embedded iframes on the same origin share sessionStorage with siblings; keep each isolated.
      if (window.self !== window.top) {
        return `frm-${fresh}`;
      }
      let id = sessionStorage.getItem("party_feud_tab_client_id");
      if (!id) {
        id = fresh;
        sessionStorage.setItem("party_feud_tab_client_id", id);
      }
      return id;
    } catch (e) {
      return `mem-${fresh}`;
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
      if (!entry || !entry.open) return;
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

  function hasRemoteTvConnection() {
    let found = false;
    hostConnections.forEach((entry) => {
      if (entry && entry.open && entry.role === "tv") {
        found = true;
      }
    });
    return found;
  }

  function getConnectedTvCount() {
    let count = 0;
    hostConnections.forEach((entry) => {
      if (entry && entry.open && entry.role === "tv") count += 1;
    });
    const now = Date.now();
    for (const [cid, entry] of Array.from(localTvTabs.entries())) {
      if (!entry || now - (entry.lastSeenAt || 0) > 12000) {
        localTvTabs.delete(cid);
        continue;
      }
      count += 1;
    }
    if (currentRole === "tv" && count === 0) {
      count = 1;
    }
    return count;
  }

  function getConnectedHostMqttCount() {
    let count = 0;
    hostMqttClients.forEach((entry) => {
      if (entry && entry.connected) count += 1;
    });
    return count;
  }

  function getSyncDiagnostics() {
    return {
      mqttConnectedCount: getConnectedHostMqttCount(),
      mqttBrokers: MQTT_BROKERS.map((b) => ({
        url: b.url,
        label: b.label,
        connected: Boolean(hostMqttClients.get(b.url) && hostMqttClients.get(b.url).connected)
      })),
      trysteroReady: Boolean(trysteroRoom),
      relayOk:
        window.location.protocol === "file:"
          ? true
          : getConnectedHostMqttCount() > 0 || firebaseReady || !hostRelayWarned
    };
  }

  function notifyStatus(statusText, isLive = true, extra = {}) {
    if (onConnectionStatusCallback) {
      onConnectionStatusCallback(statusText, isLive);
    }
    const relayOk =
      extra && extra.relayOk !== undefined ? extra.relayOk : Boolean(isLive);
    try {
      window.dispatchEvent(
        new CustomEvent("feud-peer-status", {
          detail: {
            text: statusText,
            ok: isLive,
            relayOk,
            mqttCount: getConnectedHostMqttCount(),
            tvCount: getConnectedTvCount(),
            hasRemoteTv: hasRemoteTvConnection(),
            buzzers: getConnectedBuzzerTeams()
          }
        })
      );
    } catch (e) {}
  }

  let trysteroLoadPromise = null;
  let mqttLoadPromise = null;

  function shouldUseMqttTransport() {
    return (
      window.location.protocol === "http:" ||
      !window.isSecureContext ||
      !window.crypto ||
      !window.crypto.subtle
    );
  }

  function loadMqttJs() {
    if (window.mqtt && typeof window.mqtt.connect === "function") {
      return Promise.resolve(window.mqtt);
    }
    if (mqttLoadPromise) return mqttLoadPromise;
    mqttLoadPromise = new Promise((resolve) => {
      const urls = [
        "https://cdn.jsdelivr.net/npm/mqtt@5/dist/mqtt.min.js",
        "https://unpkg.com/mqtt@5/dist/mqtt.min.js"
      ];
      const tryNext = (idx) => {
        if (idx >= urls.length) {
          mqttLoadPromise = null;
          resolve(null);
          return;
        }
        const script = document.createElement("script");
        script.src = urls[idx];
        script.async = true;
        let settled = false;
        let timer = null;
        const finishAttempt = (ok) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (ok && window.mqtt && typeof window.mqtt.connect === "function") {
            resolve(window.mqtt);
          } else {
            try {
              script.remove();
            } catch (e) {}
            tryNext(idx + 1);
          }
        };
        timer = setTimeout(() => finishAttempt(false), 4500);
        script.onload = () => finishAttempt(true);
        script.onerror = () => finishAttempt(false);
        document.head.appendChild(script);
      };
      tryNext(0);
    });
    return mqttLoadPromise;
  }

  function loadTrystero() {
    if (trysteroLoadPromise) return trysteroLoadPromise;
    trysteroLoadPromise = (async () => {
      const cdns = [
        "https://esm.sh/trystero@0.20.0/nostr",
        "https://cdn.jsdelivr.net/npm/trystero@0.20.0/nostr/+esm",
        "https://esm.run/trystero@0.20.0/nostr"
      ];
      for (const url of cdns) {
        try {
          const timeoutPromise = new Promise((res) => setTimeout(() => res(null), 5000));
          const importPromise = import(url).catch((e) => {
            console.warn(`Trystero CDN load failed (${url}):`, e);
            return null;
          });
          const mod = await Promise.race([importPromise, timeoutPromise]);
          if (mod && typeof mod.joinRoom === "function") {
            return mod;
          }
        } catch (e) {
          console.warn(`Trystero CDN load failed (${url}):`, e);
        }
      }
      trysteroLoadPromise = null;
      return null;
    })();
    return trysteroLoadPromise;
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
      firebaseReady = Boolean(authUser);
      return firebaseReady;
    } catch (e) {
      console.warn("Optional Firebase unavailable, using WebRTC P2P + Local sync.", e);
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

  function hasLocalBuzzerConflict(role, incomingClientId) {
    if (role !== "buzzer1" && role !== "buzzer2" && role !== "buzzer_combo") return false;
    const now = Date.now();
    for (const [cid, entry] of Array.from(localBuzzerTabs.entries())) {
      if (!entry || now - (entry.lastSeenAt || 0) > 12000) {
        localBuzzerTabs.delete(cid);
        continue;
      }
      if (cid === incomingClientId) continue;
      if (buzzerRolesConflict(entry.role, role)) return true;
    }
    return false;
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
        } else if (msg.type === "TEST_BUZZ" && (currentRole === "host" || currentRole === "solo")) {
          handleIncomingTestBuzzOnHost(Number(msg.team), msg.role);
        } else if (
          msg.type === "REQUEST_STATE" &&
          (currentRole === "host" || isPrimaryHostPeer)
        ) {
          const st = getLocalStateCallback ? getLocalStateCallback() : null;
          if (st && broadcastChan) {
            broadcastChan.postMessage({ type: "STATE_UPDATE", state: st });
          }
        } else if (
          msg.type === "LOCAL_HOST_PING" &&
          msg.clientId !== tabClientId &&
          (currentRole === "host" || isPrimaryHostPeer)
        ) {
          const st = getLocalStateCallback ? getLocalStateCallback() : null;
          if (msg.role === "host") {
            if (st && String(msg.pin) !== String(st.pin)) {
              if (broadcastChan) {
                broadcastChan.postMessage({
                  type: "LOCAL_HOST_AUTH_DENIED",
                  targetClientId: msg.clientId,
                  reason: "❌ Incorrect Host PIN! Access denied."
                });
              }
              return;
            }
          }
          if (msg.role === "buzzer1" || msg.role === "buzzer2" || msg.role === "buzzer_combo") {
            const conflict =
              Boolean(findActiveTeamBuzzer(msg.role, msg.clientId || "")) ||
              hasLocalBuzzerConflict(msg.role, msg.clientId || "");
            if (conflict) {
              const label =
                msg.role === "buzzer_combo"
                  ? "A Team Buzzer"
                  : `Team ${msg.role === "buzzer1" ? 1 : 2}'s buzzer`;
              if (broadcastChan) {
                broadcastChan.postMessage({
                  type: "LOCAL_HOST_AUTH_DENIED",
                  targetClientId: msg.clientId,
                  reason: `🔒 ${label} is already open in another tab or device!`
                });
              }
              return;
            }
            localBuzzerTabs.set(msg.clientId, { role: msg.role, lastSeenAt: Date.now() });
            updateHostPeerBadge();
          } else if (msg.role === "tv") {
            const wasPresent = localTvTabs.has(msg.clientId);
            localTvTabs.set(msg.clientId, { lastSeenAt: Date.now() });
            updateHostPeerBadge();
            if (!wasPresent) {
              try {
                window.dispatchEvent(new CustomEvent("feud-tv-connected"));
              } catch (e) {}
            }
          }
          if (broadcastChan) {
            broadcastChan.postMessage({
              type: "LOCAL_HOST_PONG",
              targetClientId: msg.clientId,
              state: st
            });
          }
        } else if (
          msg.type === "LOCAL_HOST_PONG" &&
          msg.targetClientId === tabClientId &&
          pendingLocalHostProbe
        ) {
          pendingLocalHostProbe.resolve({ alive: true, state: msg.state });
        } else if (
          msg.type === "LOCAL_HOST_AUTH_DENIED" &&
          msg.targetClientId === tabClientId &&
          pendingLocalHostProbe
        ) {
          pendingLocalHostProbe.resolve({
            authDenied: true,
            reason: msg.reason || "❌ Access denied!"
          });
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
        } else if (msg.type === "TV_PRESENCE" && msg.clientId !== tabClientId) {
          const prevTv = getConnectedTvCount();
          localTvTabs.set(msg.clientId, { lastSeenAt: Date.now() });
          const nextTv = getConnectedTvCount();
          if (prevTv !== nextTv && isPrimaryHostPeer) {
            updateHostPeerBadge();
          }
        } else if (msg.type === "TV_GOODBYE" && msg.clientId !== tabClientId) {
          if (localTvTabs.delete(msg.clientId) && isPrimaryHostPeer) {
            updateHostPeerBadge();
          }
        } else if (msg.type === "BUZZER_PRESENCE" && msg.clientId !== tabClientId) {
          if (msg.role === "buzzer1" || msg.role === "buzzer2" || msg.role === "buzzer_combo") {
            const prev = getConnectedBuzzerTeams();
            localBuzzerTabs.set(msg.clientId, { role: msg.role, lastSeenAt: Date.now() });
            const next = getConnectedBuzzerTeams();
            if (prev.b1 !== next.b1 || prev.b2 !== next.b2 || prev.combo !== next.combo) {
              if (isPrimaryHostPeer) {
                updateHostPeerBadge();
              } else {
                notifyStatus(`Room: ${currentCode} • Live`, true);
              }
            }
          }
        } else if (msg.type === "BUZZER_GOODBYE" && msg.clientId !== tabClientId) {
          if (localBuzzerTabs.delete(msg.clientId)) {
            if (isPrimaryHostPeer) {
              updateHostPeerBadge();
            } else {
              notifyStatus(`Room: ${currentCode} • Live`, true);
            }
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

  function probeLocalBroadcastHost(role, pin = "", timeoutMs = 300) {
    if (!broadcastChan) {
      return Promise.resolve({ alive: false });
    }
    return new Promise((resolve) => {
      let done = false;
      const finishProbe = (res) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (pendingLocalHostProbe && pendingLocalHostProbe.resolve === finishProbe) {
          pendingLocalHostProbe = null;
        }
        resolve(res);
      };
      const timer = setTimeout(() => finishProbe({ alive: false }), timeoutMs);
      pendingLocalHostProbe = { resolve: finishProbe };
      try {
        broadcastChan.postMessage({
          type: "LOCAL_HOST_PING",
          role,
          pin,
          clientId: tabClientId
        });
      } catch (e) {
        finishProbe({ alive: false });
      }
    });
  }

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
        hostConnections.delete(peerId);
        continue;
      }
      const isAlive = entry.open && now - (entry.lastSeenAt || 0) < 15000;
      if (isAlive) {
        return entry;
      }
      hostConnections.delete(peerId);
    }
    return null;
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
    if (!currentCode || currentCode === "SOLO") return;
    persistActiveBuzzers();
    if (window.location.protocol === "file:") {
      notifyStatus(`Room: ${currentCode} (Local Sync)`, true, { relayOk: true });
    } else if (hostConnections.size > 0) {
      notifyStatus(`Room: ${currentCode} • 📱 ${hostConnections.size} Connected`, true, {
        relayOk: true
      });
    } else if (getConnectedHostMqttCount() > 0 || firebaseReady) {
      hostRelayWarned = false;
      notifyStatus(`Room: ${currentCode} • Ready`, true, { relayOk: true });
    } else if (hostRelayWarned) {
      notifyStatus(`Room: ${currentCode} • ⚠️ Relay Blocked (Local Only)`, false, {
        relayOk: false
      });
    } else {
      notifyStatus(`Room: ${currentCode} • Connecting…`, true, { relayOk: true });
    }
  }

  function startHostStaleSweep() {
    clearInterval(hostSweepTimer);
    hostSweepTimer = setInterval(() => {
      if (!isPrimaryHostPeer || !currentCode) {
        clearInterval(hostSweepTimer);
        return;
      }
      const now = Date.now();
      let changed = false;
      for (const [peerId, entry] of Array.from(hostConnections.entries())) {
        if (!entry || !entry.open || now - (entry.lastSeenAt || 0) > 15000) {
          hostConnections.delete(peerId);
          changed = true;
        }
      }
      for (const [cid, entry] of Array.from(localBuzzerTabs.entries())) {
        if (!entry || now - (entry.lastSeenAt || 0) > 12000) {
          localBuzzerTabs.delete(cid);
          changed = true;
        }
      }
      for (const [cid, entry] of Array.from(localTvTabs.entries())) {
        if (!entry || now - (entry.lastSeenAt || 0) > 12000) {
          localTvTabs.delete(cid);
          changed = true;
        }
      }
      if (changed) updateHostPeerBadge();
    }, 2000);
  }

  function armHostRelayWarnTimer(code) {
    clearTimeout(hostRelayWarnTimer);
    hostRelayWarned = false;
    if (window.location.protocol === "file:" || code === "SOLO") {
      hostRelayWarnTimer = null;
      return;
    }
    hostRelayWarnTimer = setTimeout(() => {
      hostRelayWarnTimer = null;
      if (
        isPrimaryHostPeer &&
        currentCode === code &&
        getConnectedHostMqttCount() === 0 &&
        !firebaseReady &&
        hostConnections.size === 0
      ) {
        hostRelayWarned = true;
        updateHostPeerBadge();
      }
    }, 7000);
  }

  async function startHostRoomSync(code, initialState) {
    cleanupSync();
    currentCode = code.toUpperCase();
    currentRole = code === "SOLO" ? "solo" : "host";
    isPrimaryHostPeer = true;
    startHostStaleSweep();

    Feud.saveRoomStateToStorage(currentCode, initialState);
    openBroadcastChannel(currentCode);

    if (broadcastChan) {
      try {
        broadcastChan.postMessage({ type: "STATE_UPDATE", state: initialState });
      } catch (e) {}
    }

    if (code === "SOLO") {
      notifyStatus("Room: SOLO (Single-Screen)", true, { relayOk: true });
      return;
    }

    if (window.location.protocol === "file:") {
      updateHostPeerBadge();
      return;
    }

    armHostRelayWarnTimer(currentCode);
    updateHostPeerBadge();

    initOptionalFirebase()
      .then(async (hasFb) => {
        if (!hasFb || !isPrimaryHostPeer || currentCode !== code.toUpperCase()) return;
        try {
          await firestoreMod.setDoc(getFirestoreRoomRef(currentCode), initialState);
          if (!isPrimaryHostPeer || currentCode !== code.toUpperCase()) return;
          subscribeFirestoreRoom(currentCode);
          clearTimeout(hostRelayWarnTimer);
          hostRelayWarnTimer = null;
          hostRelayWarned = false;
          updateHostPeerBadge();
        } catch (e) {}
      })
      .catch(() => {});

    startMqttHostSync(currentCode).catch(() => {});

    if (!shouldUseMqttTransport()) {
      loadTrystero()
        .then((trystero) => {
          if (!trystero || !isPrimaryHostPeer || currentCode !== code.toUpperCase()) return;
          try {
            const room = trystero.joinRoom(
              { appId: TRYSTERO_APP_ID, rtcConfig: { iceServers: ICE_SERVERS } },
              `room-${currentCode}`
            );
            trysteroRoom = room;
            const [sendP2p, onP2p] = room.makeAction("feud");
            sendP2pAction = sendP2p;

            room.onPeerJoin((peerId) => {
              if (!isPrimaryHostPeer || trysteroRoom !== room) return;
              const existing = hostConnections.get(peerId);
              if (!existing) {
                hostConnections.set(peerId, {
                  peerId,
                  role: "client",
                  clientId: "",
                  lastSeenAt: Date.now(),
                  open: true
                });
              }
              updateHostPeerBadge();
            });

            room.onPeerLeave((peerId) => {
              if (trysteroRoom !== room) return;
              if (hostConnections.delete(peerId)) {
                updateHostPeerBadge();
              }
            });

            onP2p((msg, peerId) => {
              if (!isPrimaryHostPeer || trysteroRoom !== room || !msg || typeof msg !== "object") {
                return;
              }
              const st = getLocalStateCallback ? getLocalStateCallback() : null;

              if (msg.type === "PING") {
                handleHostPingMsg(msg, peerId, (replyMsg) => {
                  try {
                    sendP2pAction(replyMsg, peerId);
                  } catch (e) {}
                });
                return;
              }

              const existing = hostConnections.get(peerId);
              if (existing) existing.lastSeenAt = Date.now();

              if (msg.type === "BYE") {
                hostConnections.delete(peerId);
                updateHostPeerBadge();
                return;
              }

              if (msg.type === "PROBE_BUZZERS") {
                try {
                  sendP2pAction({ type: "BUZZERS_REPORT", buzzers: getConnectedBuzzerTeams() }, peerId);
                } catch (e) {}
                return;
              }

              if (msg.type === "HELLO") {
                if (msg.role === "host") {
                  if (st && String(msg.pin) !== String(st.pin)) {
                    try {
                      sendP2pAction({ type: "AUTH_DENIED", reason: "Incorrect Host PIN!" }, peerId);
                    } catch (e) {}
                    return;
                  }
                }
                if (msg.role === "buzzer1" || msg.role === "buzzer2" || msg.role === "buzzer_combo") {
                  const active = findActiveTeamBuzzer(msg.role, msg.clientId || "");
                  if (active && active.peerId !== peerId) {
                    const label =
                      msg.role === "buzzer_combo"
                        ? "A Team Buzzer"
                        : `Team ${msg.role === "buzzer1" ? 1 : 2}'s buzzer`;
                    try {
                      sendP2pAction(
                        {
                          type: "AUTH_DENIED",
                          reason: `🔒 ${label} is already open on another device!`
                        },
                        peerId
                      );
                    } catch (e) {}
                    hostConnections.delete(peerId);
                    updateHostPeerBadge();
                    return;
                  }
                }
                hostConnections.set(peerId, {
                  peerId,
                  role: msg.role || "client",
                  clientId: msg.clientId || "",
                  lastSeenAt: Date.now(),
                  open: true
                });
                updateHostPeerBadge();
                try {
                  window.dispatchEvent(
                    new CustomEvent("feud-client-connected", { detail: { role: msg.role || "client" } })
                  );
                } catch (e) {}
                if (msg.role === "tv") {
                  try {
                    window.dispatchEvent(new CustomEvent("feud-tv-connected"));
                  } catch (e) {}
                }
                if (st) {
                  try {
                    sendP2pAction({ type: "STATE_UPDATE", state: st }, peerId);
                  } catch (e) {}
                }
              } else if (msg.type === "BUZZ") {
                handleIncomingBuzzOnHost(Number(msg.team));
              } else if (msg.type === "TEST_BUZZ") {
                handleIncomingTestBuzzOnHost(Number(msg.team), msg.role);
              } else if (msg.type === "HOST_PATCH" && msg.patch && st) {
                const merged = { ...st, ...msg.patch, updatedAt: Date.now() };
                Feud.saveRoomStateToStorage(currentCode, merged);
                if (onRemoteStateCallback) onRemoteStateCallback(merged);
                broadcastFromHostToPeers(merged);
              }
            });
          } catch (e) {}
        })
        .catch(() => {});
    }
  }

  function compactStateForMqtt(st) {
    if (!st || typeof st !== "object") return st;
    const copy = { ...st };
    delete copy.pin;
    delete copy.customDeck;
    delete copy.customRounds;
    return copy;
  }

  function handleHostPingMsg(msg, senderId, replyFn) {
    const existing = hostConnections.get(senderId);
    if (existing) {
      existing.lastSeenAt = Date.now();
      replyFn({ type: "PONG", t: msg.t || 0 });
      return;
    }
    if (msg.role === "buzzer1" || msg.role === "buzzer2" || msg.role === "buzzer_combo") {
      const active = findActiveTeamBuzzer(msg.role, msg.clientId || "");
      if (active && active.peerId !== senderId) {
        const label =
          msg.role === "buzzer_combo"
            ? "A Team Buzzer"
            : `Team ${msg.role === "buzzer1" ? 1 : 2}'s buzzer`;
        replyFn({
          type: "AUTH_DENIED",
          reason: `🔒 ${label} is already open on another device!`
        });
        return;
      }
    }
    if (msg.role) {
      hostConnections.set(senderId, {
        peerId: senderId,
        role: msg.role,
        clientId: msg.clientId || "",
        lastSeenAt: Date.now(),
        open: true
      });
      updateHostPeerBadge();
      replyFn({ type: "PONG", t: msg.t || 0 });
      const st = getLocalStateCallback ? getLocalStateCallback() : null;
      if (st) {
        replyFn({ type: "STATE_UPDATE", state: st });
      }
      return;
    }
    replyFn({ type: "PONG", t: msg.t || 0 });
  }

  function handleHostIncomingMsg(msg, senderId, replyFn) {
    if (!isPrimaryHostPeer || !msg || typeof msg !== "object") return;
    const st = getLocalStateCallback ? getLocalStateCallback() : null;

    if (msg.type === "PING") {
      handleHostPingMsg(msg, senderId, replyFn);
      return;
    }

    const existing = hostConnections.get(senderId);
    if (existing) existing.lastSeenAt = Date.now();

    if (msg.type === "BYE") {
      if (hostConnections.delete(senderId)) updateHostPeerBadge();
      return;
    }
    if (msg.type === "PROBE_BUZZERS") {
      replyFn({ type: "BUZZERS_REPORT", buzzers: getConnectedBuzzerTeams() });
      return;
    }
    if (msg.type === "HELLO") {
      if (msg.role === "host") {
        if (st && String(msg.pin) !== String(st.pin)) {
          replyFn({ type: "AUTH_DENIED", reason: "Incorrect Host PIN!" });
          return;
        }
      }
      if (msg.role === "buzzer1" || msg.role === "buzzer2" || msg.role === "buzzer_combo") {
        const active = findActiveTeamBuzzer(msg.role, msg.clientId || "");
        if (active && active.peerId !== senderId) {
          const label =
            msg.role === "buzzer_combo"
              ? "A Team Buzzer"
              : `Team ${msg.role === "buzzer1" ? 1 : 2}'s buzzer`;
          replyFn({
            type: "AUTH_DENIED",
            reason: `🔒 ${label} is already open on another device!`
          });
          hostConnections.delete(senderId);
          updateHostPeerBadge();
          return;
        }
      }
      hostConnections.set(senderId, {
        peerId: senderId,
        role: msg.role || "client",
        clientId: msg.clientId || "",
        lastSeenAt: Date.now(),
        open: true
      });
      updateHostPeerBadge();
      try {
        window.dispatchEvent(
          new CustomEvent("feud-client-connected", { detail: { role: msg.role || "client" } })
        );
      } catch (e) {}
      if (msg.role === "tv") {
        try {
          window.dispatchEvent(new CustomEvent("feud-tv-connected"));
        } catch (e) {}
      }
      if (st) {
        replyFn({ type: "STATE_UPDATE", state: st });
      }
    } else if (msg.type === "BUZZ") {
      handleIncomingBuzzOnHost(Number(msg.team));
    } else if (msg.type === "TEST_BUZZ") {
      handleIncomingTestBuzzOnHost(Number(msg.team), msg.role);
    } else if (msg.type === "HOST_PATCH" && msg.patch && st) {
      const merged = { ...st, ...msg.patch, updatedAt: Date.now() };
      Feud.saveRoomStateToStorage(currentCode, merged);
      if (onRemoteStateCallback) onRemoteStateCallback(merged);
      broadcastFromHostToPeers(merged);
    }
  }

  async function startMqttHostSync(code) {
    if (window.location.protocol === "file:") {
      updateHostPeerBadge();
      return;
    }
    const mqttLib = await loadMqttJs();
    if (!mqttLib || !isPrimaryHostPeer || currentCode !== code) {
      if (isPrimaryHostPeer && currentCode === code) {
        clearTimeout(hostRelayWarnTimer);
        hostRelayWarnTimer = null;
        if (!firebaseReady && hostConnections.size === 0) {
          hostRelayWarned = true;
        }
        updateHostPeerBadge();
      }
      return;
    }

    MQTT_BROKERS.forEach((broker) => {
      if (!isPrimaryHostPeer || currentCode !== code) return;
      const existingEntry = hostMqttClients.get(broker.url);
      if (existingEntry && existingEntry.client) {
        if (existingEntry.connected) return;
        try {
          existingEntry.client.end(true);
        } catch (e) {}
      }

      const entry = { client: null, connected: false, label: broker.label };
      hostMqttClients.set(broker.url, entry);

      try {
        const client = mqttLib.connect(broker.url, {
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 6000,
          ...(broker.options || {})
        });
        entry.client = client;

        client.on("connect", () => {
          if (entry.client !== client || !isPrimaryHostPeer || currentCode !== code) {
            try {
              client.end(true);
            } catch (e) {}
            return;
          }
          entry.connected = true;
          hostRelayWarned = false;
          clearTimeout(hostRelayWarnTimer);
          hostRelayWarnTimer = null;
          client.subscribe(`party-feud/v1/${code}/host`, { qos: 1 });
          updateHostPeerBadge();
        });

        client.on("message", (topic, payload) => {
          if (entry.client !== client || !isPrimaryHostPeer || currentCode !== code) return;
          try {
            const parsed = JSON.parse(payload.toString());
            const senderId = parsed && parsed.senderId;
            const msg = parsed && parsed.msg;
            if (!senderId || !msg) return;
            handleHostIncomingMsg(msg, senderId, (replyMsg) => {
              if (!entry.connected || entry.client !== client) return;
              const outMsg =
                replyMsg.type === "STATE_UPDATE"
                  ? { ...replyMsg, state: compactStateForMqtt(replyMsg.state) }
                  : replyMsg;
              try {
                client.publish(
                  `party-feud/v1/${code}/reply/${senderId}`,
                  JSON.stringify({ senderId: tabClientId, msg: outMsg }),
                  { qos: 1 }
                );
              } catch (e) {}
            });
          } catch (e) {}
        });

        const handleDrop = () => {
          if (entry.client !== client) return;
          entry.connected = false;
          if (
            isPrimaryHostPeer &&
            currentCode === code &&
            getConnectedHostMqttCount() === 0 &&
            !hostRelayWarnTimer
          ) {
            if (!firebaseReady && hostConnections.size === 0) {
              hostRelayWarned = true;
            }
            updateHostPeerBadge();
          }
        };
        client.on("error", handleDrop);
        client.on("close", handleDrop);
      } catch (e) {
        entry.connected = false;
      }
    });
  }

  function retryHostRelay() {
    if (!isPrimaryHostPeer || !currentCode || currentCode === "SOLO") return;
    if (window.location.protocol === "file:") return;
    for (const [url, entry] of Array.from(hostMqttClients.entries())) {
      if (entry && !entry.connected && entry.client) {
        try {
          entry.client.end(true);
        } catch (e) {}
        hostMqttClients.delete(url);
      }
    }
    armHostRelayWarnTimer(currentCode);
    updateHostPeerBadge();
    startMqttHostSync(currentCode).catch(() => {});
  }

  // Single source of truth for whether a buzz is legal in the current room state.
  // Returns the patch to apply, or null if the buzz must be rejected (late tap / wrong phase).
  function buildBuzzPatch(st, teamNum) {
    if (!st || (teamNum !== 1 && teamNum !== 2)) return null;
    const phase = st.roundPhase || (st.questionRevealed ? "faceoff-buzz" : "faceoff-ready");
    const dur = Number(st.turnTimerDuration) || 10;
    if (st.stage && st.stage !== "main") return null;

    if (phase === "faceoff-buzz" && st.questionRevealed && !st.buzzerWinner) {
      return {
        buzzerWinner: teamNum,
        buzzerWinnerAt: Date.now(),
        buzzerRunnerUpDeltaMs: 0,
        buzzerArmedTeam: 0,
        controllingTeam: teamNum,
        faceoffFirstTeam: teamNum,
        roundPhase: "faceoff-p1",
        questionRevealed: true,
        turnTimerRemaining: dur,
        turnTimerRunning: true
      };
    }

    return null;
  }

  function handleIncomingBuzzOnHost(teamNum) {
    const st = getLocalStateCallback ? getLocalStateCallback() : null;
    const now = Date.now();
    const patch = buildBuzzPatch(st, teamNum);
    if (!patch) {
      // Record runner-up buzz delta so the losing phone can show exact lockout timing
      if (
        st &&
        (teamNum === 1 || teamNum === 2) &&
        st.buzzerWinner &&
        st.buzzerWinner !== teamNum &&
        st.buzzerWinnerAt &&
        !st.buzzerRunnerUpDeltaMs &&
        now - st.buzzerWinnerAt <= 4000
      ) {
        const deltaPatch = {
          buzzerRunnerUpDeltaMs: Math.max(1, now - st.buzzerWinnerAt),
          updatedAt: now
        };
        const updatedDelta = { ...st, ...deltaPatch };
        Feud.saveRoomStateToStorage(currentCode, updatedDelta);
        if (onRemoteStateCallback) onRemoteStateCallback(updatedDelta);
        broadcastFromHostToPeers(updatedDelta);
        if (firebaseReady && db && firestoreMod && currentRole !== "solo") {
          firestoreMod
            .updateDoc(getFirestoreRoomRef(currentCode), deltaPatch)
            .catch(() => {});
        }
      }
      return;
    }

    const updated = { ...st, ...patch, updatedAt: now };
    Feud.saveRoomStateToStorage(currentCode, updated);
    if (onRemoteStateCallback) onRemoteStateCallback(updated);
    broadcastFromHostToPeers(updated);

    if (firebaseReady && db && firestoreMod && currentRole !== "solo") {
      firestoreMod
        .updateDoc(getFirestoreRoomRef(currentCode), { ...patch, updatedAt: Date.now() })
        .catch(() => {});
    }
  }

  function handleIncomingTestBuzzOnHost(teamNum, role) {
    try {
      window.dispatchEvent(
        new CustomEvent("feud-test-buzz", {
          detail: { team: Number(teamNum) || 0, role: String(role || "") }
        })
      );
    } catch (e) {}
  }

  function broadcastFromHostToPeers(fullState) {
    if (broadcastChan) {
      try {
        broadcastChan.postMessage({ type: "STATE_UPDATE", state: fullState });
      } catch (e) {}
    }
    if (sendP2pAction && trysteroRoom) {
      try {
        sendP2pAction({ type: "STATE_UPDATE", state: fullState });
      } catch (e) {}
    }
    if (currentCode && hostMqttClients.size > 0) {
      const payload = JSON.stringify({
        senderId: tabClientId,
        msg: { type: "STATE_UPDATE", state: compactStateForMqtt(fullState) }
      });
      hostMqttClients.forEach((entry) => {
        if (!entry || !entry.connected || !entry.client) return;
        try {
          entry.client.publish(`party-feud/v1/${currentCode}/state`, payload);
        } catch (e) {}
      });
    }
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

  function clearPendingClientMqtt(exceptClient = null) {
    for (const c of Array.from(clientPendingMqtt)) {
      if (c === exceptClient) continue;
      clientPendingMqtt.delete(c);
      try {
        c.end(true);
      } catch (e) {}
    }
  }

  async function joinExistingRoomSync({ code, role, pin = "" }) {
    cleanupSync();
    currentCode = code.toUpperCase();
    currentRole = role;
    isPrimaryHostPeer = false;

    openBroadcastChannel(currentCode);

    const localProbe = await probeLocalBroadcastHost(role, pin, 300);
    if (localProbe && localProbe.authDenied) {
      cleanupSync();
      return { ok: false, error: localProbe.reason || "❌ Access denied!" };
    }
    if (localProbe && localProbe.alive) {
      const stateToUse = localProbe.state || Feud.loadRoomStateFromStorage(currentCode);
      if (role === "host" && stateToUse && String(stateToUse.pin) !== String(pin)) {
        cleanupSync();
        return { ok: false, error: "❌ Incorrect Host PIN! Access denied." };
      }
      hasLocalBroadcastSync = Boolean(broadcastChan);
      lastLocalSyncAt = Date.now();
      if (broadcastChan) {
        if (role === "buzzer1" || role === "buzzer2" || role === "buzzer_combo") {
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
        } else if (role === "tv") {
          clearInterval(localPresenceTimer);
          localPresenceTimer = setInterval(() => {
            if (!broadcastChan) return;
            try {
              broadcastChan.postMessage({
                type: "TV_PRESENCE",
                clientId: tabClientId
              });
            } catch (e) {}
          }, 4000);
        }
      }
      notifyStatus(`Room: ${currentCode} • Live`, true);
      return { ok: true, state: stateToUse };
    }

    hasLocalBroadcastSync = false;
    const localState = Feud.loadRoomStateFromStorage(currentCode);

    if (localState && window.location.protocol === "file:") {
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
          } else if (role === "tv") {
            broadcastChan.postMessage({
              type: "TV_PRESENCE",
              clientId: tabClientId
            });
            clearInterval(localPresenceTimer);
            localPresenceTimer = setInterval(() => {
              if (!broadcastChan) return;
              try {
                broadcastChan.postMessage({
                  type: "TV_PRESENCE",
                  clientId: tabClientId
                });
              } catch (e) {}
            }, 4000);
          }
        } catch (e) {}
      }
      notifyStatus(`Room: ${currentCode} • Live`, true);
      return { ok: true, state: localState };
    }

    if (localState && role === "host") {
      if (String(localState.pin) !== String(pin)) {
        cleanupSync();
        return { ok: false, error: "❌ Incorrect Host PIN! Access denied." };
      }
      await startHostRoomSync(currentCode, localState);
      return { ok: true, state: localState };
    }

    const hasFb = await initOptionalFirebase();
    if (hasFb) {
      try {
        const snap = await firestoreMod.getDoc(getFirestoreRoomRef(currentCode));
        if (snap.exists()) {
          const data = snap.data();
          if (role === "host" && String(data.pin) !== String(pin)) {
            cleanupSync();
            return { ok: false, error: "❌ Incorrect Host PIN! Access denied." };
          }
          subscribeFirestoreRoom(currentCode);
          notifyStatus(`Room: ${currentCode}`, true);
          return { ok: true, state: data };
        }
      } catch (e) {}
    }

    const remoteRes = await connectPeerClient({ code: currentCode, role, pin });
    if (!remoteRes || !remoteRes.ok) {
      cleanupSync();
    }
    return remoteRes;
  }

  function connectMqttClient({ code, role, pin, gen }) {
    clientJoinInfo = { code, role, pin };
    const myGen = gen !== undefined ? gen : ++clientGen;
    const isStale = () => myGen !== clientGen || currentCode !== code || currentRole === "lobby";

    return new Promise(async (resolve) => {
      const mqttLib = await loadMqttJs();
      if (!mqttLib) {
        resolve({ ok: false, error: "Network sync unavailable (could not load relay client)." });
        return;
      }
      if (isStale()) {
        resolve({ ok: false, error: "Connection superseded." });
        return;
      }

      if (mqttClient && !isPrimaryHostPeer) {
        try {
          mqttClient.end(true);
        } catch (e) {}
        mqttClient = null;
        mqttConnected = false;
        clientConnOpen = false;
        activeMqttBrokerUrl = "";
      }
      clearPendingClientMqtt();

      let settled = false;
      let everConnected = false;
      let anyBrokerConnected = false;
      let closedBrokers = 0;
      const attemptClients = new Set();
      const helloTimers = [];

      const clearHelloTimers = () => {
        while (helloTimers.length) {
          clearTimeout(helloTimers.pop());
        }
      };

      const closeAttemptClients = (keepClient = null) => {
        for (const c of Array.from(attemptClients)) {
          if (c === keepClient) continue;
          attemptClients.delete(c);
          clientPendingMqtt.delete(c);
          try {
            c.end(true);
          } catch (e) {}
        }
      };

      const finish = (res) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        clearHelloTimers();
        closeAttemptClients(res && res.ok ? mqttClient : null);
        resolve(res);
      };

      const fail = (res) => {
        finish(res);
        if (!isStale() && (everConnected || reconnectAttempt > 0)) {
          scheduleClientReconnect(code, role, pin);
        }
      };

      const timeoutId = setTimeout(() => {
        fail(
          anyBrokerConnected
            ? {
                ok: false,
                error: `Room "${code}" not found via relay. Check that the Host screen is open and connected.`
              }
            : {
                ok: false,
                error: "Unable to reach cloud relay (check internet or lab firewall)."
              }
        );
      }, 12000);

      const replyTopic = `party-feud/v1/${code}/reply/${tabClientId}`;
      const stateTopic = `party-feud/v1/${code}/state`;

      MQTT_BROKERS.forEach((broker) => {
        if (isStale() || settled) return;
        let client = null;
        let thisFailed = false;
        try {
          client = mqttLib.connect(broker.url, {
            clean: true,
            keepalive: 8,
            connectTimeout: 5000,
            reconnectPeriod: 0,
            ...(broker.options || {}),
            will: {
              topic: `party-feud/v1/${code}/host`,
              payload: JSON.stringify({
                senderId: tabClientId,
                msg: { type: "BYE", role, clientId: tabClientId }
              }),
              qos: 1,
              retain: false
            }
          });
        } catch (e) {
          closedBrokers += 1;
          if (!settled && !anyBrokerConnected && closedBrokers >= MQTT_BROKERS.length) {
            fail({
              ok: false,
              error: "Unable to reach cloud relay (check internet or lab firewall)."
            });
          }
          return;
        }

        attemptClients.add(client);
        clientPendingMqtt.add(client);

        const markBrokerClosed = () => {
          if (thisFailed) return;
          thisFailed = true;
          closedBrokers += 1;
          if (mqttClient === client) {
            mqttConnected = false;
            clientConnOpen = false;
            activeMqttBrokerUrl = "";
            if (everConnected && !isStale()) {
              scheduleClientReconnect(code, role, pin);
            }
          }
          attemptClients.delete(client);
          clientPendingMqtt.delete(client);
          if (!settled && !anyBrokerConnected && closedBrokers >= MQTT_BROKERS.length) {
            fail({
              ok: false,
              error: "Unable to reach cloud relay (check internet or lab firewall)."
            });
          }
        };

        client.on("connect", () => {
          if (isStale() || settled || everConnected) {
            if (mqttClient !== client) {
              attemptClients.delete(client);
              clientPendingMqtt.delete(client);
              try {
                client.end(true);
              } catch (e) {}
            }
            return;
          }
          anyBrokerConnected = true;
          const sendHello = () => {
            if (isStale() || everConnected || (settled && mqttClient !== client) || !client.connected) {
              return;
            }
            try {
              client.publish(
                `party-feud/v1/${code}/host`,
                JSON.stringify({
                  senderId: tabClientId,
                  msg: { type: "HELLO", role, pin, clientId: tabClientId }
                }),
                { qos: 1 }
              );
            } catch (e) {}
          };
          client.subscribe([replyTopic, stateTopic], { qos: 1 }, () => {
            if (isStale() || everConnected) return;
            sendHello();
            helloTimers.push(setTimeout(sendHello, 1200));
            helloTimers.push(setTimeout(sendHello, 3000));
            helloTimers.push(setTimeout(sendHello, 6000));
          });
        });

        client.on("message", (topic, payload) => {
          if (isStale()) return;
          if (everConnected && mqttClient !== client) return;

          let parsed = null;
          try {
            parsed = JSON.parse(payload.toString());
          } catch (e) {
            return;
          }
          const msg = parsed && parsed.msg;
          if (!msg || typeof msg !== "object") return;

          if (msg.type === "AUTH_DENIED") {
            const reason = msg.reason || "❌ Access denied!";
            const wasJoined = everConnected;
            finish({ ok: false, error: reason, authDenied: true });
            cleanupSync();
            if (wasJoined && onForcedExitCallback) {
              onForcedExitCallback(reason);
            }
            return;
          }

          if (msg.type === "PONG") {
            lastPongAt = Date.now();
            if (reconnectAttempt > 0) {
              reconnectAttempt = 0;
              clearTimeout(reconnectTimer);
              notifyStatus(`Room: ${code} • Live`, true);
            }
            return;
          }

          if (msg.type === "STATE_UPDATE" && msg.state) {
            // Require direct /reply/<clientId> handshake on initial join so Host has definitely
            // registered our HELLO before the client marks itself connected.
            if (!everConnected && topic !== replyTopic) {
              return;
            }
            everConnected = true;
            clientConnOpen = true;
            mqttClient = client;
            mqttConnected = true;
            activeMqttBrokerUrl = broker.url;
            clientPendingMqtt.delete(client);
            lastPongAt = Date.now();
            reconnectAttempt = 0;
            clearTimeout(reconnectTimer);
            Feud.saveRoomStateToStorage(code, msg.state);
            notifyStatus(`Room: ${code} • Live`, true);
            startHeartbeat(myGen);
            finish({ ok: true, state: msg.state });
            if (onRemoteStateCallback) onRemoteStateCallback(msg.state);
          }
        });

        client.on("error", markBrokerClosed);
        client.on("close", markBrokerClosed);
      });
    });
  }

  function connectPeerClient({ code, role, pin }) {
    if (shouldUseMqttTransport()) {
      return connectMqttClient({ code, role, pin });
    }
    clientJoinInfo = { code, role, pin };
    const myGen = ++clientGen;
    const isStale = () => myGen !== clientGen || currentCode !== code || currentRole === "lobby";

    // Race MQTT-WSS (port 443 + fallbacks) and Trystero WebRTC P2P in parallel.
    return new Promise((resolve) => {
      let won = false;
      let mqttDone = false;
      let p2pDone = false;
      let mqttResult = null;
      let p2pResult = null;

      const maybeFinishFailure = () => {
        if (won || !mqttDone || !p2pDone) return;
        won = true;
        if (!isStale()) cleanupSync();
        resolve(
          (mqttResult && mqttResult.error ? mqttResult : p2pResult) || {
            ok: false,
            error: `Room "${code}" not found. Check the Host screen and network.`
          }
        );
      };

      const finishWin = (res, source) => {
        if (won) return;
        won = true;
        if (source === "mqtt" && trysteroRoom && !isPrimaryHostPeer) {
          try {
            trysteroRoom.leave();
          } catch (e) {}
          trysteroRoom = null;
          sendP2pAction = null;
          clientHostPeerId = null;
        } else if (source === "p2p" && (mqttClient || clientPendingMqtt.size > 0) && !isPrimaryHostPeer) {
          clearPendingClientMqtt();
          if (mqttClient) {
            try {
              mqttClient.end(true);
            } catch (e) {}
            mqttClient = null;
            mqttConnected = false;
            activeMqttBrokerUrl = "";
          }
        }
        resolve(res);
      };

      connectMqttClient({ code, role, pin, gen: myGen }).then((res) => {
        mqttDone = true;
        mqttResult = res;
        if (won || isStale()) return;
        if (res && (res.ok || res.authDenied)) {
          finishWin(res, "mqtt");
        } else {
          maybeFinishFailure();
        }
      });

      (async () => {
        const markP2pFailed = (errRes) => {
          if (p2pDone) return;
          p2pDone = true;
          p2pResult = errRes || { ok: false, error: "WebRTC P2P unavailable." };
          maybeFinishFailure();
        };

        try {
          const trystero = await loadTrystero();
          if (!trystero || won || isStale() || !window.crypto || !window.crypto.subtle) {
            markP2pFailed();
            return;
          }

          let localRoom = null;
          const p2pTimeout = setTimeout(() => {
            if (!won && localRoom && !clientConnOpen) {
              try {
                localRoom.leave();
              } catch (e) {}
              if (trysteroRoom === localRoom) {
                trysteroRoom = null;
                sendP2pAction = null;
              }
            }
            markP2pFailed({ ok: false, error: "Peer P2P timed out." });
          }, 10000);

          localRoom = trystero.joinRoom(
            { appId: TRYSTERO_APP_ID, rtcConfig: { iceServers: ICE_SERVERS } },
            `room-${code}`
          );
          if (won || isStale()) {
            clearTimeout(p2pTimeout);
            try {
              localRoom.leave();
            } catch (e) {}
            markP2pFailed();
            return;
          }
          trysteroRoom = localRoom;
          const [sendP2p, onP2p] = localRoom.makeAction("feud");
          sendP2pAction = sendP2p;

          localRoom.onPeerJoin((peerId) => {
            if (won || isStale() || trysteroRoom !== localRoom) return;
            try {
              sendP2pAction({ type: "HELLO", role, pin, clientId: tabClientId }, peerId);
            } catch (e) {}
          });

          localRoom.onPeerLeave((peerId) => {
            if (isStale() || trysteroRoom !== localRoom) return;
            if (peerId === clientHostPeerId) {
              clientConnOpen = false;
              scheduleClientReconnect(code, role, pin);
            }
          });

          onP2p((msg, peerId) => {
            if (isStale() || trysteroRoom !== localRoom || !msg || typeof msg !== "object") return;
            lastPongAt = Date.now();
            if (reconnectAttempt > 0) {
              reconnectAttempt = 0;
              clearTimeout(reconnectTimer);
              notifyStatus(`Room: ${code} • Live`, true);
            }
            if (msg.type === "PONG") return;
            if (msg.type === "AUTH_DENIED") {
              clearTimeout(p2pTimeout);
              const reason = msg.reason || "❌ Access denied!";
              const wasJoined = won;
              p2pDone = true;
              finishWin({ ok: false, error: reason, authDenied: true }, "p2p");
              cleanupSync();
              if (wasJoined && onForcedExitCallback) {
                onForcedExitCallback(reason);
              }
              return;
            }
            if (msg.type === "STATE_UPDATE" && msg.state) {
              clearTimeout(p2pTimeout);
              p2pDone = true;
              clientHostPeerId = peerId;
              clientConnOpen = true;
              reconnectAttempt = 0;
              lastPongAt = Date.now();
              Feud.saveRoomStateToStorage(code, msg.state);
              notifyStatus(`Room: ${code} • Live`, true);
              startHeartbeat(myGen);
              finishWin({ ok: true, state: msg.state }, "p2p");
              if (onRemoteStateCallback) onRemoteStateCallback(msg.state);
            }
          });
        } catch (e) {
          markP2pFailed({ ok: false, error: "Peer P2P failed." });
        }
      })();
    });
  }

  function startHeartbeat(gen) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (gen !== clientGen || currentRole === "lobby" || !clientJoinInfo) {
        clearInterval(heartbeatTimer);
        return;
      }
      const pingMsg = {
        type: "PING",
        t: Date.now(),
        role: currentRole,
        clientId: tabClientId
      };
      if (sendP2pAction && clientConnOpen && clientHostPeerId) {
        try {
          sendP2pAction(pingMsg, clientHostPeerId);
        } catch (e) {}
      } else if (mqttClient && mqttConnected && currentCode) {
        try {
          mqttClient.publish(
            `party-feud/v1/${currentCode}/host`,
            JSON.stringify({ senderId: tabClientId, msg: pingMsg })
          );
        } catch (e) {}
      }
      if (Date.now() - lastPongAt > 11000) {
        clearInterval(heartbeatTimer);
        clientConnOpen = false;
        const { code, role, pin } = clientJoinInfo;
        scheduleClientReconnect(code, role, pin, 0);
      }
    }, 2500);
  }

  function scheduleClientReconnect(code, role, pin, forcedDelay) {
    clearTimeout(reconnectTimer);
    if (currentRole === "lobby" || currentCode !== code || isPrimaryHostPeer) return;
    clearInterval(heartbeatTimer);
    reconnectAttempt += 1;
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

  function reconnectNowIfDead() {
    if (!clientJoinInfo || isPrimaryHostPeer || currentRole === "lobby") return;
    if (clientConnOpen && Date.now() - lastPongAt < 14000) return;
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
      if (sendP2pAction && clientConnOpen && clientHostPeerId) {
        try {
          sendP2pAction({ type: "HOST_PATCH", patch }, clientHostPeerId);
        } catch (e) {}
      } else if (mqttClient && mqttConnected && currentCode) {
        try {
          mqttClient.publish(
            `party-feud/v1/${currentCode}/host`,
            JSON.stringify({ senderId: tabClientId, msg: { type: "HOST_PATCH", patch } })
          );
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

    if (sendP2pAction && clientConnOpen && clientHostPeerId) {
      try {
        sendP2pAction({ type: "BUZZ", team: teamNum }, clientHostPeerId);
        setTimeout(() => {
          if (sendP2pAction && clientConnOpen && clientHostPeerId) {
            try {
              sendP2pAction({ type: "BUZZ", team: teamNum }, clientHostPeerId);
            } catch (e) {}
          }
        }, 120);
      } catch (e) {}
    } else if (mqttClient && mqttConnected && currentCode) {
      try {
        mqttClient.publish(
          `party-feud/v1/${currentCode}/host`,
          JSON.stringify({ senderId: tabClientId, msg: { type: "BUZZ", team: teamNum } })
        );
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

  async function syncSendTestBuzz(teamNum, role) {
    if (!currentCode) return;
    const payload = { type: "TEST_BUZZ", team: Number(teamNum) || 0, role: String(role || "") };

    if (broadcastChan) {
      try {
        broadcastChan.postMessage(payload);
      } catch (e) {}
    }

    if (sendP2pAction && clientConnOpen && clientHostPeerId) {
      try {
        sendP2pAction(payload, clientHostPeerId);
      } catch (e) {}
    } else if (mqttClient && mqttConnected && currentCode) {
      try {
        mqttClient.publish(
          `party-feud/v1/${currentCode}/host`,
          JSON.stringify({ senderId: tabClientId, msg: payload })
        );
      } catch (e) {}
    } else {
      reconnectNowIfDead();
    }

    if (isPrimaryHostPeer || currentRole === "solo") {
      handleIncomingTestBuzzOnHost(payload.team, payload.role);
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
    clearTimeout(hostRelayWarnTimer);
    clearInterval(heartbeatTimer);
    clearInterval(localPresenceTimer);
    clearInterval(hostSweepTimer);
    hostRelayWarnTimer = null;
    hostRelayWarned = false;
    localPresenceTimer = null;
    hostSweepTimer = null;
    pendingRoleCheck = null;
    pendingLocalHostProbe = null;
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
        } else if (currentRole === "tv") {
          broadcastChan.postMessage({
            type: "TV_GOODBYE",
            clientId: tabClientId
          });
        }
        broadcastChan.close();
      } catch (e) {}
      broadcastChan = null;
    }
    localBuzzerTabs.clear();
    localTvTabs.clear();
    hostConnections.clear();
    if (sendP2pAction && clientConnOpen && clientHostPeerId) {
      try {
        sendP2pAction({ type: "BYE", role: currentRole, clientId: tabClientId }, clientHostPeerId);
      } catch (e) {}
    }
    if (mqttClient && mqttConnected && currentCode && !isPrimaryHostPeer) {
      try {
        mqttClient.publish(
          `party-feud/v1/${currentCode}/host`,
          JSON.stringify({
            senderId: tabClientId,
            msg: { type: "BYE", role: currentRole, clientId: tabClientId }
          })
        );
      } catch (e) {}
    }
    if (trysteroRoom) {
      try {
        trysteroRoom.leave();
      } catch (e) {}
      trysteroRoom = null;
    }
    clearPendingClientMqtt();
    hostMqttClients.forEach((entry) => {
      if (entry && entry.client) {
        try {
          entry.client.end(true);
        } catch (e) {}
      }
    });
    hostMqttClients.clear();
    if (mqttClient) {
      try {
        mqttClient.end(true);
      } catch (e) {}
      mqttClient = null;
      mqttConnected = false;
    }
    activeMqttBrokerUrl = "";
    sendP2pAction = null;
    clientHostPeerId = null;
    clientConnOpen = false;
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
    } else if (broadcastChan && currentRole === "tv") {
      try {
        broadcastChan.postMessage({
          type: "TV_GOODBYE",
          clientId: tabClientId
        });
      } catch (e) {}
    }
    if (sendP2pAction && clientConnOpen && clientHostPeerId) {
      try {
        sendP2pAction({ type: "BYE", role: currentRole, clientId: tabClientId }, clientHostPeerId);
      } catch (e) {}
    }
    if (mqttClient && mqttConnected && currentCode && !isPrimaryHostPeer) {
      try {
        mqttClient.publish(
          `party-feud/v1/${currentCode}/host`,
          JSON.stringify({
            senderId: tabClientId,
            msg: { type: "BYE", role: currentRole, clientId: tabClientId }
          })
        );
      } catch (e) {}
    }
    if (trysteroRoom) {
      try {
        trysteroRoom.leave();
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
      const trystero = await loadTrystero();
      if (!trystero) return localRes;
      return await new Promise((resolve) => {
        let probeRoom = null;
        let done = false;
        const finishPeer = (res) => {
          if (done) return;
          done = true;
          try {
            if (probeRoom) probeRoom.leave();
          } catch (e) {}
          resolve(res);
        };
        const t = setTimeout(() => finishPeer(localRes), 2800);
        try {
          probeRoom = trystero.joinRoom(
            { appId: TRYSTERO_APP_ID, rtcConfig: { iceServers: ICE_SERVERS } },
            `room-${clean}`
          );
          const [sendProbe, onProbe] = probeRoom.makeAction("feud");
          probeRoom.onPeerJoin((peerId) => {
            try {
              sendProbe({ type: "PROBE_BUZZERS", clientId: tabClientId }, peerId);
            } catch (e) {}
          });
          onProbe((msg) => {
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
    getConnectedTvCount,
    hasRemoteTvConnection,
    getSyncDiagnostics,
    retryHostRelay,
    probeRoomBuzzers,
    startHostRoomSync,
    joinExistingRoomSync,
    syncPushPatch,
    syncSendTeamBuzz,
    syncSendTestBuzz,
    buildBuzzPatch,
    cleanupSync
  });
})(window.Feud);
