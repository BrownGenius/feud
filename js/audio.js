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
      // Warm, punchy low-pass filtered game-show "EH-EHHH" double-pulse buzzer
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(820, now);
      filter.Q.setValueAtTime(2.5, now);
      filter.connect(ctx.destination);

      const pulses = [
        { start: 0, dur: 0.16, peak: 0.28 },
        { start: 0.2, dur: 0.44, peak: 0.32 }
      ];
      pulses.forEach((pulse) => {
        [92.5, 98.0, 138.6].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t0 = now + pulse.start;
          osc.type = idx === 2 ? "square" : "sawtooth";
          osc.frequency.setValueAtTime(freq, t0);
          osc.frequency.linearRampToValueAtTime(freq * 0.94, t0 + pulse.dur);
          const lvl = idx === 2 ? pulse.peak * 0.45 : pulse.peak;
          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.linearRampToValueAtTime(lvl, t0 + 0.015);
          gain.gain.setValueAtTime(lvl * 0.85, t0 + pulse.dur * 0.72);
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

  Object.assign(Feud, {
    unlockAudio,
    isAudioMuted,
    toggleAudioMute,
    playDing,
    playBuzzerHonk,
    playFaceOffTone,
    playFanfare,
    playTick
  });
})(window.Feud);
