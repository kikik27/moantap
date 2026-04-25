interface TapSample {
  time: number;
  x: number;
  y: number;
}

interface BotCheckResult {
  isBot: boolean;
  reason: 'interval' | 'position' | null;
}

const WINDOW_SIZE = 20;
const MIN_SAMPLES = 10;
const CV_THRESHOLD = 0.05;
const POSITION_DISTANCE_THRESHOLD = 5;

export function createBotDetector() {
  const samples: TapSample[] = [];

  function addSample(time: number, x: number, y: number) {
    samples.push({ time, x, y });
    if (samples.length > WINDOW_SIZE) {
      samples.shift();
    }
  }

  function isIntervalConstant(): boolean {
    if (samples.length < MIN_SAMPLES) return false;

    const intervals: number[] = [];
    for (let i = 1; i < samples.length; i++) {
      intervals.push(samples[i].time - samples[i - 1].time);
    }

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (mean === 0) return false;

    const variance =
      intervals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    return cv < CV_THRESHOLD;
  }

  function isPositionConstant(): boolean {
    if (samples.length < MIN_SAMPLES) return false;

    const recent = samples.slice(-MIN_SAMPLES);
    let totalDist = 0;
    let pairs = 0;

    for (let i = 0; i < recent.length; i++) {
      for (let j = i + 1; j < recent.length; j++) {
        const dx = recent[i].x - recent[j].x;
        const dy = recent[i].y - recent[j].y;
        totalDist += Math.sqrt(dx * dx + dy * dy);
        pairs++;
      }
    }

    if (pairs === 0) return false;
    const avgDist = totalDist / pairs;

    return avgDist < POSITION_DISTANCE_THRESHOLD;
  }

  function check(time: number, x: number, y: number): BotCheckResult {
    addSample(time, x, y);

    if (isIntervalConstant()) {
      return { isBot: true, reason: 'interval' };
    }
    if (isPositionConstant()) {
      return { isBot: true, reason: 'position' };
    }

    return { isBot: false, reason: null };
  }

  function reset() {
    samples.length = 0;
  }

  return { check, reset };
}
