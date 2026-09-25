export function createAudio({ volume = 0.55, muted = false } = {}) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let context = null;
  let master = null;
  let engineGain = null;
  let engineOscillator = null;
  let engineFilter = null;
  let masterVolume = volume;
  let isMuted = muted;
  let disposed = false;

  const ensureContext = () => {
    if (disposed || !AudioContextClass) return null;
    if (!context) {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = isMuted ? 0 : masterVolume;
      master.connect(context.destination);
      engineOscillator = context.createOscillator();
      engineFilter = context.createBiquadFilter();
      engineGain = context.createGain();
      engineOscillator.type = "sawtooth";
      engineOscillator.frequency.value = 42;
      engineFilter.type = "lowpass";
      engineFilter.frequency.value = 240;
      engineGain.gain.value = 0;
      engineOscillator.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(master);
      engineOscillator.start();
    }
    return context;
  };

  const tone = ({ type = "square", from = 440, to = from, duration = 0.12, gain = 0.08, delay = 0 }) => {
    const activeContext = ensureContext();
    if (!activeContext || activeContext.state !== "running") return;
    const start = activeContext.currentTime + delay;
    const oscillator = activeContext.createOscillator();
    const envelope = activeContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(1, from), start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope);
    envelope.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };

  const sounds = {
    ui: () => tone({ type: "square", from: 620, to: 760, duration: 0.06, gain: 0.035 }),
    laser: () => tone({ type: "square", from: 1200, to: 260, duration: 0.09, gain: 0.075 }),
    enemyLaser: () => tone({ type: "sawtooth", from: 420, to: 130, duration: 0.12, gain: 0.055 }),
    hit: () => tone({ type: "square", from: 160, to: 55, duration: 0.16, gain: 0.1 }),
    destroy: () => {
      tone({ type: "sawtooth", from: 220, to: 38, duration: 0.42, gain: 0.1 });
      tone({ type: "square", from: 90, to: 30, duration: 0.52, gain: 0.06, delay: 0.03 });
    },
    coin: () => {
      tone({ type: "square", from: 760, to: 980, duration: 0.07, gain: 0.045 });
      tone({ type: "square", from: 980, to: 1320, duration: 0.09, gain: 0.045, delay: 0.07 });
    },
    refuel: () => tone({ type: "triangle", from: 150, to: 460, duration: 0.3, gain: 0.055 }),
    dock: () => {
      tone({ type: "triangle", from: 300, to: 520, duration: 0.2, gain: 0.06 });
      tone({ type: "triangle", from: 520, to: 760, duration: 0.24, gain: 0.05, delay: 0.16 });
    },
    jump: () => {
      tone({ type: "sawtooth", from: 80, to: 1400, duration: 0.75, gain: 0.075 });
      tone({ type: "square", from: 400, to: 1800, duration: 0.8, gain: 0.035, delay: 0.12 });
    },
    alarm: () => {
      tone({ type: "square", from: 760, to: 480, duration: 0.16, gain: 0.07 });
      tone({ type: "square", from: 760, to: 480, duration: 0.16, gain: 0.07, delay: 0.2 });
    },
    gameover: () => tone({ type: "sawtooth", from: 260, to: 35, duration: 1.1, gain: 0.08 })
  };

  return {
    async unlock() {
      const activeContext = ensureContext();
      if (activeContext?.state === "suspended") await activeContext.resume();
    },
    play(name) {
      sounds[name]?.();
    },
    setEngine(throttle, active = true) {
      if (!context || !engineGain || !engineOscillator) return;
      const now = context.currentTime;
      engineGain.gain.cancelScheduledValues(now);
      engineGain.gain.setTargetAtTime(active ? 0.018 + Math.abs(throttle) * 0.028 : 0, now, 0.08);
      engineOscillator.frequency.setTargetAtTime(38 + Math.abs(throttle) * 72, now, 0.06);
      engineFilter.frequency.setTargetAtTime(180 + Math.abs(throttle) * 440, now, 0.08);
    },
    stopEngine() {
      if (!context || !engineGain) return;
      engineGain.gain.setTargetAtTime(0, context.currentTime, 0.03);
    },
    setMasterVolume(value) {
      masterVolume = Math.max(0, Math.min(1, Number(value) || 0));
      if (context && master) master.gain.setTargetAtTime(isMuted ? 0 : masterVolume, context.currentTime, 0.03);
    },
    setMuted(value) {
      isMuted = Boolean(value);
      if (context && master) master.gain.setTargetAtTime(isMuted ? 0 : masterVolume, context.currentTime, 0.03);
    },
    suspend() {
      if (context?.state === "running") context.suspend();
    },
    resume() {
      if (context?.state === "suspended") context.resume();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      try {
        engineOscillator?.stop();
      } catch {
        engineOscillator = null;
      }
      engineOscillator?.disconnect();
      engineFilter?.disconnect();
      engineGain?.disconnect();
      master?.disconnect();
      context?.close();
    }
  };
}
