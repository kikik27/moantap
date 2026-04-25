// /hooks/useHaptics.ts

'use client';

import { useCallback, useRef } from 'react';

type VibrationPattern = number[];

const PATTERNS: Record<string, number[]> = {
  tap: [10],
  combo: [10, 20, 10],
  nearWin: [30],
  win: [50, 30, 50],
  lose: [20, 40],
  countdownTick: [8],
  countdownFinal: [20, 10, 30],
  battleStart: [30, 20, 30, 20, 50],
};

type PatternName = keyof typeof PATTERNS;

const MIN_PATTERN_INTERVAL_MS = 40;

export function useHaptics() {
  const lastVibrationRef = useRef(0);

  const vibrate = useCallback((pattern: VibrationPattern) => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    const now = Date.now();
    if (now - lastVibrationRef.current < MIN_PATTERN_INTERVAL_MS) return;

    lastVibrationRef.current = now;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Silently fail on unsupported platforms
    }
  }, []);

  const tap = useCallback(() => vibrate(PATTERNS.tap), [vibrate]);
  const combo = useCallback(() => vibrate(PATTERNS.combo), [vibrate]);
  const nearWin = useCallback(() => vibrate(PATTERNS.nearWin), [vibrate]);
  const win = useCallback(() => vibrate(PATTERNS.win), [vibrate]);
  const lose = useCallback(() => vibrate(PATTERNS.lose), [vibrate]);
  const countdownTick = useCallback(() => vibrate(PATTERNS.countdownTick), [vibrate]);
  const countdownFinal = useCallback(() => vibrate(PATTERNS.countdownFinal), [vibrate]);
  const battleStart = useCallback(() => vibrate(PATTERNS.battleStart), [vibrate]);

  return {
    tap,
    combo,
    nearWin,
    win,
    lose,
    countdownTick,
    countdownFinal,
    battleStart,
  };
}
