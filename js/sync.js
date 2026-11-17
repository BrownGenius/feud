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
    "wss://broker.emqx.io:8084/mqtt",
    "wss://test.mosquitto.org:8081/mqtt"
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
  let mqttBrokerIdx = 0;
  let hostConnections = new Map(); // peerId -> { peerId, role, clientId, lastSeenAt, open }
  let localBuzzerTabs = new Map();
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
        "https://unpkg.com/mqtt/dist/mqtt.min.js",
        "https://cdn.jsdelivr.net/npm/mqtt/dist/mqtt.min.js"
      ];
      const tryNext = (idx) => {
        if (idx >= urls.length) {
          resolve(null);
          return;
        }
        const script = document.createElement("script");
        script.src = urls[idx];
        script.async = true;
        script.onload = () => {
          if (window.mqtt && typeof window.mqtt.connect === "function") {
            resolve(window.mqtt);
          } else {
            tryNext(idx + 1);
          }
        };
        script.onerror = () => tryNext(idx + 1);
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
        "https://esm.sh/trystero",
        "https://esm.run/trystero",
        "https://cdn.jsdelivr.net/npm/trystero/+esm"
      ];
      for (const url of cdns) {
        try {
          const mod = await import(url);
          if (mod && typeof mod.joinRoom === "function") {
            return mod;
          }
        } catch (e) {
          console.warn(`Trystero CDN load failed (${url}):`, e);
        }
      }
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
    persistActiveBuzzers();
    const count = hostConnections.size;
    if (count > 0) {
      notifyStatus(`Room: ${currentCode} • 📱 ${count} Connected`, true);
    } else {
      notifyStatus(`Room: ${currentCode} • Ready`, true);
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
        if (!entry || !entry.open || now - (entry.lastSeenAt || 0) > 14000) {
          hostConnections.delete(peerId);
          changed = true;
        }
      }
      if (changed) updateHostPeerBadge();
    }, 5000);
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

    const useMqtt = shouldUseMqttTransport();
    const trystero = useMqtt ? null : await loadTrystero();
    if (!trystero) {
      await startMqttHostSync(currentCode);
      return;
    }

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
        const st = getLocalStateCallback ? getLocalStateCallback() : null;
        if (st && sendP2pAction) {
          try {
            sendP2pAction({ type: "STATE_UPDATE", state: st }, peerId);
          } catch (e) {}
        }
      });

      room.onPeerLeave((peerId) => {
        if (trysteroRoom !== room) return;
        if (hostConnections.delete(peerId)) {
          updateHostPeerBadge();
        }
      });

      onP2p((msg, peerId) => {
        if (!isPrimaryHostPeer || trysteroRoom !== room || !msg || typeof msg !== "object") return;
        const st = getLocalStateCallback ? getLocalStateCallback() : null;
        const existing = hostConnections.get(peerId);
        if (existing) existing.lastSeenAt = Date.now();

        if (msg.type === "PING") {
          try {
            sendP2pAction({ type: "PONG", t: msg.t || 0 }, peerId);
          } catch (e) {}
          return;
        }

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
        } else if (msg.type === "HOST_PATCH" && msg.patch && st) {
          const merged = { ...st, ...msg.patch, updatedAt: Date.now() };
          Feud.saveRoomStateToStorage(currentCode, merged);
          if (onRemoteStateCallback) onRemoteStateCallback(merged);
          broadcastFromHostToPeers(merged);
        }
      });

      notifyStatus(`Room: ${currentCode} • Ready`, true);
    } catch (e) {
      await startMqttHostSync(currentCode);
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

  function handleHostIncomingMsg(msg, senderId, replyFn) {
    if (!isPrimaryHostPeer || !msg || typeof msg !== "object") return;
    const st = getLocalStateCallback ? getLocalStateCallback() : null;
    const existing = hostConnections.get(senderId);
    if (existing) existing.lastSeenAt = Date.now();

    if (msg.type === "PING") {
      replyFn({ type: "PONG", t: msg.t || 0 });
      return;
    }
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
    } else if (msg.type === "HOST_PATCH" && msg.patch && st) {
      const merged = { ...st, ...msg.patch, updatedAt: Date.now() };
      Feud.saveRoomStateToStorage(currentCode, merged);
      if (onRemoteStateCallback) onRemoteStateCallback(merged);
      broadcastFromHostToPeers(merged);
    }
  }

  async function startMqttHostSync(code) {
    const mqttLib = await loadMqttJs();
    if (!mqttLib || !isPrimaryHostPeer || currentCode !== code) {
      notifyStatus(`Room: ${code} (Local Sync)`, true);
      return;
    }
    const brokerUrl = MQTT_BROKERS[mqttBrokerIdx % MQTT_BROKERS.length];
    try {
      const client = mqttLib.connect(brokerUrl, {
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000
      });
      mqttClient = client;

      client.on("connect", () => {
        if (mqttClient !== client || !isPrimaryHostPeer || currentCode !== code) return;
        mqttConnected = true;
        client.subscribe(`party-feud/v1/${code}/host`);
        notifyStatus(`Room: ${code} • Ready`, true);
      });

      client.on("message", (topic, payload) => {
        if (mqttClient !== client || !isPrimaryHostPeer || currentCode !== code) return;
        try {
          const parsed = JSON.parse(payload.toString());
          const senderId = parsed && parsed.senderId;
          const msg = parsed && parsed.msg;
          if (!senderId || !msg) return;
          handleHostIncomingMsg(msg, senderId, (replyMsg) => {
            if (!mqttClient || !mqttConnected) return;
            const outMsg =
              replyMsg.type === "STATE_UPDATE"
                ? { ...replyMsg, state: compactStateForMqtt(replyMsg.state) }
                : replyMsg;
            try {
              mqttClient.publish(
                `party-feud/v1/${code}/reply/${senderId}`,
                JSON.stringify({ senderId: tabClientId, msg: outMsg }),
                { qos: 1 }
              );
            } catch (e) {}
          });
        } catch (e) {}
      });

      client.on("error", () => {
        if (mqttClient !== client) return;
        mqttConnected = false;
        mqttBrokerIdx += 1;
      });
      client.on("close", () => {
        if (mqttClient === client) mqttConnected = false;
      });
    } catch (e) {
      notifyStatus(`Room: ${code} (Local Sync)`, true);
    }
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
    if (sendP2pAction && trysteroRoom) {
      try {
        sendP2pAction({ type: "STATE_UPDATE", state: fullState });
      } catch (e) {}
    }
    if (mqttClient && mqttConnected && currentCode) {
      try {
        mqttClient.publish(
          `party-feud/v1/${currentCode}/state`,
          JSON.stringify({
            senderId: tabClientId,
            msg: { type: "STATE_UPDATE", state: compactStateForMqtt(fullState) }
          })
        );
      } catch (e) {}
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

  function connectMqttClient({ code, role, pin }) {
    clientJoinInfo = { code, role, pin };
    const myGen = ++clientGen;
    const isStale = () => myGen !== clientGen || currentCode !== code || currentRole === "lobby";

    return new Promise(async (resolve) => {
      const mqttLib = await loadMqttJs();
      if (!mqttLib) {
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
          error: `Room "${code}" not found via MQTT relay. Check the Host screen.`
        });
      }, 12000);

      if (mqttClient && !isPrimaryHostPeer) {
        try {
          mqttClient.end(true);
        } catch (e) {}
        mqttClient = null;
        mqttConnected = false;
        clientConnOpen = false;
      }

      const brokerUrl = MQTT_BROKERS[mqttBrokerIdx % MQTT_BROKERS.length];
      try {
        const client = mqttLib.connect(brokerUrl, {
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 3000,
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
        mqttClient = client;

        client.on("connect", () => {
          if (isStale() || mqttClient !== client) return;
          mqttConnected = true;
          const sendHello = () => {
            if (isStale() || mqttClient !== client || !mqttConnected || everConnected) return;
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
          client.subscribe(
            [`party-feud/v1/${code}/state`, `party-feud/v1/${code}/reply/${tabClientId}`],
            { qos: 1 },
            () => {
              sendHello();
              setTimeout(sendHello, 1000);
              setTimeout(sendHello, 2500);
              setTimeout(sendHello, 5000);
            }
          );
        });

        client.on("message", (topic, payload) => {
          if (isStale() || mqttClient !== client) return;
          let parsed = null;
          try {
            parsed = JSON.parse(payload.toString());
          } catch (e) {
            return;
          }
          const msg = parsed && parsed.msg;
          if (!msg || typeof msg !== "object") return;
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
            clientConnOpen = true;
            everConnected = true;
            reconnectAttempt = 0;
            clearTimeout(timeoutId);
            Feud.saveRoomStateToStorage(code, msg.state);
            notifyStatus(`Room: ${code} • Live`, true);
            startHeartbeat(myGen);
            finish({ ok: true, state: msg.state });
            if (onRemoteStateCallback) onRemoteStateCallback(msg.state);
          }
        });

        client.on("error", () => {
          if (mqttClient !== client) return;
          mqttConnected = false;
          mqttBrokerIdx += 1;
        });
        client.on("close", () => {
          if (mqttClient === client) {
            mqttConnected = false;
            clientConnOpen = false;
          }
        });
      } catch (e) {
        fail({ ok: false, error: "Could not connect to MQTT relay." });
      }
    });
  }

  function connectPeerClient({ code, role, pin }) {
    if (shouldUseMqttTransport()) {
      return connectMqttClient({ code, role, pin });
    }
    clientJoinInfo = { code, role, pin };
    const myGen = ++clientGen;
    const isStale = () => myGen !== clientGen || currentCode !== code || currentRole === "lobby";

    return new Promise(async (resolve) => {
      const trystero = await loadTrystero();
      if (!trystero) {
        resolve(await connectMqttClient({ code, role, pin }));
        return;
      }
      if (isStale()) {
        resolve({ ok: false, error: "Connection superseded." });
        return;
      }

      let settled = false;
      let everConnected = false;
      let joinStage = "relays";
      const finish = (res) => {
        if (!settled) {
          settled = true;
          resolve(res);
        }
      };
      const fail = (res) => {
        clearTimeout(timeoutId);
        finish(res);
        if (!isStale() && (everConnected || reconnectAttempt > 0)) {
          scheduleClientReconnect(code, role, pin);
        }
      };

      const timeoutId = setTimeout(() => {
        const detailHint =
          joinStage === "relays"
            ? "No P2P peers found — check Host is open"
            : "No response from Host";
        fail({
          ok: false,
          error: `Room "${code}" not found (${detailHint}). Check the Host screen.`
        });
      }, 15000);

      if (trysteroRoom && !isPrimaryHostPeer) {
        try {
          trysteroRoom.leave();
        } catch (e) {}
        trysteroRoom = null;
        sendP2pAction = null;
        clientHostPeerId = null;
        clientConnOpen = false;
      }

      try {
        if (!window.crypto || !window.crypto.subtle) {
          fail({
            ok: false,
            error: "WebRTC P2P requires HTTPS (e.g. GitHub Pages) or localhost — crypto.subtle is blocked on plain http:// LAN IPs."
          });
          return;
        }
        const room = trystero.joinRoom(
          { appId: TRYSTERO_APP_ID, rtcConfig: { iceServers: ICE_SERVERS } },
          `room-${code}`
        );
        trysteroRoom = room;
        const [sendP2p, onP2p] = room.makeAction("feud");
        sendP2pAction = sendP2p;

        room.onPeerJoin((peerId) => {
          if (isStale() || trysteroRoom !== room) return;
          joinStage = "waiting-state";
          try {
            sendP2pAction({ type: "HELLO", role, pin, clientId: tabClientId }, peerId);
          } catch (e) {}
        });

        room.onPeerLeave((peerId) => {
          if (isStale() || trysteroRoom !== room) return;
          if (peerId === clientHostPeerId) {
            clientConnOpen = false;
            fail({ ok: false, error: `Connection to Room "${code}" closed.` });
          }
        });

        onP2p((msg, peerId) => {
          if (isStale() || trysteroRoom !== room || !msg || typeof msg !== "object") return;
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
            clientHostPeerId = peerId;
            clientConnOpen = true;
            everConnected = true;
            reconnectAttempt = 0;
            clearTimeout(timeoutId);
            Feud.saveRoomStateToStorage(code, msg.state);
            notifyStatus(`Room: ${code} • Live`, true);
            startHeartbeat(myGen);
            finish({ ok: true, state: msg.state });
            if (onRemoteStateCallback) onRemoteStateCallback(msg.state);
          }
        });
      } catch (e) {
        fail({
          ok: false,
          error: `Could not initialize WebRTC P2P connection (${(e && e.message) || "unknown error"}).`
        });
      }
    });
  }

  function startHeartbeat(gen) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (gen !== clientGen || currentRole === "lobby" || !clientJoinInfo) {
        clearInterval(heartbeatTimer);
        return;
      }
      if (sendP2pAction && clientConnOpen && clientHostPeerId) {
        try {
          sendP2pAction({ type: "PING", t: Date.now() }, clientHostPeerId);
        } catch (e) {}
      } else if (mqttClient && mqttConnected && currentCode) {
        try {
          mqttClient.publish(
            `party-feud/v1/${currentCode}/host`,
            JSON.stringify({ senderId: tabClientId, msg: { type: "PING", t: Date.now() } })
          );
        } catch (e) {}
      }
      if (Date.now() - lastPongAt > 14000) {
        clearInterval(heartbeatTimer);
        clientConnOpen = false;
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
    clearInterval(heartbeatTimer);
    clearInterval(localPresenceTimer);
    clearInterval(hostSweepTimer);
    localPresenceTimer = null;
    hostSweepTimer = null;
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
    if (mqttClient) {
      try {
        if (mqttConnected && currentCode && !isPrimaryHostPeer) {
          mqttClient.publish(
            `party-feud/v1/${currentCode}/host`,
            JSON.stringify({
              senderId: tabClientId,
              msg: { type: "BYE", role: currentRole, clientId: tabClientId }
            })
          );
        }
        mqttClient.end(true);
      } catch (e) {}
      mqttClient = null;
      mqttConnected = false;
    }
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
    probeRoomBuzzers,
    startHostRoomSync,
    joinExistingRoomSync,
    syncPushPatch,
    syncSendTeamBuzz,
    buildBuzzPatch,
    cleanupSync
  });
})(window.Feud);
