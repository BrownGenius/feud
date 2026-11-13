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
      [1046.5, 2093, 2637].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(i === 0 ? 0.35 : 0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      });
    } catch (e) {}
  }

  function playBuzzerHonk() {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      [110, 117].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 0.9, now + 0.65);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.68);
      });
    } catch (e) {}
  }

  function playFaceOffTone(team) {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      const f = team === 1 ? 440 : 587.33;
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.setValueAtTime(f * 1.25, now + 0.08);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {}
  }

  function playFanfare() {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        const start = now + i * 0.1;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch (e) {}
  }

  function playTick(urgent = false) {
    if (isMuted) return;
    try {
      const ctx = unlockAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(urgent ? 880 : 660, now);
      gain.gain.setValueAtTime(urgent ? 0.18 : 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
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
