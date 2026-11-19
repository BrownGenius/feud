// =====================================================================
// WEB AUDIO API SOUND EFFECTS (ZERO EXTERNAL AUDIO FILES)
// Automatically unlocks AudioContext on first user tap so TV / Mobile
// browsers play all game show sounds reliably.
// =====================================================================

window.Feud = window.Feud || {};

(function (Feud) {
  let audioCtx = null;
  let isMuted = false;

  function unlockAudio() {
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
    } catch (e) {}
    return audioCtx;
  }

  if (typeof document !== "undefined") {
    document.addEventListener("pointerdown", () => unlockAudio(), { passive: true });
    document.addEventListener("keydown", () => unlockAudio(), { passive: true });
  }

  function isAudioMuted() {
    return isMuted;
  }

  function setAudioMuted(muted) {
    isMuted = Boolean(muted);
    if (!isMuted) unlockAudio();
    return isMuted;
  }

  function toggleAudioMute() {
    isMuted = !isMuted;
    if (!isMuted) unlockAudio();
    return isMuted;
  }

  function playDing() {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Rich TV game-show survey reveal bell: crisp transient + shimmering harmonic chord
      const partials = [
        { freq: 1046.5, type: "triangle", gain: 0.3, delay: 0, dur: 0.75 },
        { freq: 1318.51, type: "sine", gain: 0.2, delay: 0.035, dur: 0.72 },
        { freq: 1567.98, type: "sine", gain: 0.22, delay: 0.07, dur: 0.78 },
        { freq: 2093.0, type: "sine", gain: 0.14, delay: 0.07, dur: 0.65 },
        { freq: 3135.96, type: "sine", gain: 0.06, delay: 0.07, dur: 0.45 }
      ];
      partials.forEach((p) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t0 = now + p.delay;
        osc.type = p.type;
        osc.frequency.setValueAtTime(p.freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(p.gain, t0 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + p.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + p.dur + 0.02);
      });
    } catch (e) {}
  }

  function playBuzzerHonk() {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Balanced, warm game-show "bzzzt-bzzzt" wrong-answer buzzer
      const shaper = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 255 - 1;
        curve[i] = Math.tanh(x * 1.8);
      }
      shaper.curve = curve;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1850, now);
      filter.Q.setValueAtTime(1.0, now);

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.26, now);

      filter.connect(shaper);
      shaper.connect(master);
      master.connect(ctx.destination);

      const voices = [
        { freq: 110.0, type: "sawtooth", weight: 0.42 },
        { freq: 116.54, type: "triangle", weight: 0.45 },
        { freq: 164.81, type: "triangle", weight: 0.34 },
        { freq: 220.0, type: "sawtooth", weight: 0.28 }
      ];

      const pulses = [
        { start: 0, dur: 0.13, peak: 0.36 },
        { start: 0.16, dur: 0.46, peak: 0.4 }
      ];
      pulses.forEach((pulse) => {
        voices.forEach((v) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t0 = now + pulse.start;
          osc.type = v.type;
          osc.frequency.setValueAtTime(v.freq, t0);
          osc.frequency.linearRampToValueAtTime(v.freq * 0.97, t0 + pulse.dur);
          const lvl = pulse.peak * v.weight;
          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.linearRampToValueAtTime(lvl, t0 + 0.008);
          gain.gain.setValueAtTime(lvl * 0.9, t0 + pulse.dur * 0.8);
          gain.gain.exponentialRampToValueAtTime(0.0008, t0 + pulse.dur);
          osc.connect(gain);
          gain.connect(filter);
          osc.start(t0);
          osc.stop(t0 + pulse.dur + 0.02);
        });
      });
    } catch (e) {}
  }

  function playFaceOffTone(team) {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Crisp podium ring-in chime, distinct pitch per team
      const notes = team === 1 ? [659.25, 830.61, 987.77] : [739.99, 932.33, 1108.73];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t0 = now + i * 0.045;
        osc.type = i === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.24 - i * 0.03, t0 + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.36);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.38);
      });
    } catch (e) {}
  }

  function playFanfare() {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Celebratory TV game-show win fanfare: rising arpeggio + sustained major chord
      const lead = [
        { freq: 523.25, start: 0.0, dur: 0.16, gain: 0.22 },
        { freq: 659.25, start: 0.09, dur: 0.16, gain: 0.22 },
        { freq: 783.99, start: 0.18, dur: 0.16, gain: 0.24 },
        { freq: 1046.5, start: 0.27, dur: 0.72, gain: 0.28 },
        { freq: 1318.51, start: 0.36, dur: 0.72, gain: 0.18 }
      ];
      lead.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t0 = now + n.start;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(n.gain, t0 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + n.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + n.dur + 0.02);
      });

      // Warm sustained chord underneath
      [261.63, 329.63, 392.0].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t0 = now + 0.27;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.11, t0 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.88);
      });
    } catch (e) {}
  }

  function playTick(urgent = false) {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Crisp percussive studio clock tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const baseFreq = urgent ? 1180 : 840;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, now + 0.045);
      gain.gain.setValueAtTime(urgent ? 0.2 : 0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.055);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  function playBeSpecificBuzz() {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Quick, gentler double "buzz-buzz" to ask for a more specific answer
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(950, now);
      filter.connect(ctx.destination);

      [0, 0.13].forEach((offset) => {
        [240, 320].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t0 = now + offset;
          osc.type = idx === 0 ? "sawtooth" : "triangle";
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.linearRampToValueAtTime(0.14, t0 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.085);
          osc.connect(gain);
          gain.connect(filter);
          osc.start(t0);
          osc.stop(t0 + 0.095);
        });
      });
    } catch (e) {}
  }

  function playTimeUpBell() {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Classic "ding ding ding!" 3-strike game-show timer bell
      [0, 0.16, 0.32].forEach((offset, idx) => {
        const dur = idx === 2 ? 0.55 : 0.24;
        [
          { freq: 1567.98, type: "triangle", gain: 0.28 },
          { freq: 3135.96, type: "sine", gain: 0.12 },
          { freq: 4698.64, type: "sine", gain: 0.05 }
        ].forEach((p) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t0 = now + offset;
          osc.type = p.type;
          osc.frequency.setValueAtTime(p.freq, t0);
          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.linearRampToValueAtTime(p.gain, t0 + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + dur + 0.02);
        });
      });
    } catch (e) {}
  }

  function playTensionTick(secondsLeft = 3) {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      const s = Math.max(1, Math.min(3, Number(secondsLeft) || 3));
      const freq = s === 1 ? 1318.5 : s === 2 ? 1108.7 : 932.3;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.72, now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

      // Subtle low studio pulse underneath
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(s === 1 ? 196 : 164.8, now);
      subGain.gain.setValueAtTime(0.14, now);
      subGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.1);
    } catch (e) {}
  }

  function playIntroJingle() {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Upbeat ~1.2s TV game-show brass-synth intro stinger
      const notes = [
        { freq: 392.0, start: 0.0, dur: 0.14, gain: 0.18 },
        { freq: 523.25, start: 0.11, dur: 0.14, gain: 0.2 },
        { freq: 659.25, start: 0.22, dur: 0.14, gain: 0.22 },
        { freq: 783.99, start: 0.34, dur: 0.2, gain: 0.24 },
        { freq: 659.25, start: 0.56, dur: 0.14, gain: 0.2 },
        { freq: 1046.5, start: 0.72, dur: 0.48, gain: 0.28 }
      ];
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t0 = now + n.start;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(n.gain, t0 + 0.014);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + n.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + n.dur + 0.02);
      });
    } catch (e) {}
  }

  Object.assign(Feud, {
    unlockAudio,
    isAudioMuted,
    setAudioMuted,
    toggleAudioMute,
    playDing,
    playBuzzerHonk,
    playFaceOffTone,
    playFanfare,
    playTick,
    playTensionTick,
    playIntroJingle,
    playBeSpecificBuzz,
    playTimeUpBell
  });
})(window.Feud);
