// /lib/audioEngine.ts

type OscType = OscillatorType;

interface SynthParams {
  freq: number;
  duration: number;
  type: OscType;
  gain: number;
  attack: number;
  release: number;
}

const MASTER_GAIN = 0.35;

// ── Synth presets ──

const TAP_BASE: SynthParams = {
  freq: 520,
  duration: 0.08,
  type: 'sine',
  gain: 0.25,
  attack: 0.005,
  release: 0.06,
};

const COMBO_LEVELS: SynthParams[] = [
  { freq: 580, duration: 0.1, type: 'sine', gain: 0.3, attack: 0.005, release: 0.08 },
  { freq: 660, duration: 0.1, type: 'triangle', gain: 0.35, attack: 0.005, release: 0.08 },
  { freq: 780, duration: 0.12, type: 'triangle', gain: 0.4, attack: 0.005, release: 0.1 },
];

const COUNTDOWN_TICK: SynthParams = {
  freq: 880,
  duration: 0.12,
  type: 'square',
  gain: 0.15,
  attack: 0.005,
  release: 0.1,
};

const COUNTDOWN_FINAL: SynthParams = {
  freq: 1200,
  duration: 0.3,
  type: 'square',
  gain: 0.3,
  attack: 0.005,
  release: 0.25,
};

const BATTLE_START: SynthParams = {
  freq: 440,
  duration: 0.4,
  type: 'sawtooth',
  gain: 0.25,
  attack: 0.02,
  release: 0.3,
};

const WIN_PARAMS: SynthParams[] = [
  { freq: 523, duration: 0.15, type: 'sine', gain: 0.3, attack: 0.01, release: 0.1 },
  { freq: 659, duration: 0.15, type: 'sine', gain: 0.3, attack: 0.01, release: 0.1 },
  { freq: 784, duration: 0.3, type: 'sine', gain: 0.35, attack: 0.01, release: 0.2 },
];

const LOSE_PARAMS: SynthParams[] = [
  { freq: 440, duration: 0.2, type: 'sine', gain: 0.2, attack: 0.01, release: 0.15 },
  { freq: 330, duration: 0.3, type: 'sine', gain: 0.15, attack: 0.01, release: 0.25 },
];

// ── Engine ──

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private initialized = false;

  init(): void {
    if (this.initialized) return;

    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.initialized = true;
  }

  ensureResumed(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private synth(params: SynthParams, startOffset = 0): void {
    if (!this.ctx || !this.master) return;

    const now = this.ctx.currentTime + startOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = params.type;
    osc.frequency.setValueAtTime(params.freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(params.gain, now + params.attack);
    gain.gain.linearRampToValueAtTime(0, now + params.attack + params.release);

    osc.connect(gain);
    gain.connect(this.master);

    osc.start(now);
    osc.stop(now + params.duration + 0.05);
  }

  playTap(pitchShift = 0): void {
    this.ensureResumed();
    this.synth({
      ...TAP_BASE,
      freq: TAP_BASE.freq + pitchShift * 15,
      gain: TAP_BASE.gain + Math.min(pitchShift * 0.01, 0.1),
    });
  }

  playCombo(level: number): void {
    this.ensureResumed();
    const idx = Math.min(level, COMBO_LEVELS.length - 1);
    this.synth(COMBO_LEVELS[idx]);
  }

  playCountdownTick(): void {
    this.ensureResumed();
    this.synth(COUNTDOWN_TICK);
  }

  playCountdownFinal(): void {
    this.ensureResumed();
    this.synth(COUNTDOWN_FINAL);
  }

  playBattleStart(): void {
    this.ensureResumed();
    this.synth(BATTLE_START);
    this.synth(
      { ...BATTLE_START, freq: 660, duration: 0.3 },
      0.15,
    );
  }

  playWin(): void {
    this.ensureResumed();
    WIN_PARAMS.forEach((p, i) => {
      this.synth(p, i * 0.12);
    });
  }

  playLose(): void {
    this.ensureResumed();
    LOSE_PARAMS.forEach((p, i) => {
      this.synth(p, i * 0.15);
    });
  }

  destroy(): void {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.master = null;
      this.initialized = false;
    }
  }
}

// Singleton — one AudioContext for the entire app
let instance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!instance) {
    instance = new AudioEngine();
  }
  return instance;
}
