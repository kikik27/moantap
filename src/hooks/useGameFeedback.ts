// /hooks/useGameFeedback.ts

'use client';

import { useCallback, useRef } from 'react';
import { useAudio } from './useAudio';
import { useHaptics } from './useHaptics';

const RAPID_TAP_WINDOW_MS = 400;
const MAX_PITCH_SHIFT = 5;

export function useGameFeedback() {
  const audio = useAudio();
  const haptics = useHaptics();

  const tapTimestampsRef = useRef<number[]>([]);
  const lastComboRef = useRef(0);
  const lastWinnerRef = useRef<string | null>(null);
  const lastTensionRef = useRef(0);

  const onPlayerTap = useCallback(() => {
    const now = Date.now();
    tapTimestampsRef.current.push(now);
    tapTimestampsRef.current = tapTimestampsRef.current.filter(
      (t) => now - t < RAPID_TAP_WINDOW_MS,
    );

    const rapidCount = tapTimestampsRef.current.length;
    const pitchShift = Math.min(rapidCount, MAX_PITCH_SHIFT);

    audio.playTap(pitchShift);
    haptics.tap();
  }, [audio, haptics]);

  const onComboChange = useCallback(
    (combo: number) => {
      if (combo <= lastComboRef.current) {
        lastComboRef.current = combo;
        return;
      }
      lastComboRef.current = combo;

      const level = combo < 10 ? 0 : combo < 20 ? 1 : 2;
      audio.playCombo(level);
      if (level >= 2) haptics.combo();
    },
    [audio, haptics],
  );

  const onTensionChange = useCallback(
    (tension: number) => {
      if (tension > 0.7 && lastTensionRef.current <= 0.7) {
        haptics.nearWin();
      }
      lastTensionRef.current = tension;
    },
    [haptics],
  );

  const onGameEnd = useCallback(
    (winner: 'A' | 'B' | null) => {
      const key = winner ?? 'draw';
      if (key === lastWinnerRef.current) return;
      lastWinnerRef.current = key;

      if (winner === 'A') {
        audio.playWin();
        haptics.win();
      } else {
        audio.playLose();
        haptics.lose();
      }
    },
    [audio, haptics],
  );

  const onCountdownTick = useCallback(
    (secondsLeft: number) => {
      if (secondsLeft <= 3) {
        audio.playCountdownFinal();
        haptics.countdownFinal();
      } else {
        audio.playCountdownTick();
        haptics.countdownTick();
      }
    },
    [audio, haptics],
  );

  const onBattleStart = useCallback(() => {
    audio.playBattleStart();
    haptics.battleStart();
  }, [audio, haptics]);

  const reset = useCallback(() => {
    lastComboRef.current = 0;
    lastWinnerRef.current = null;
    lastTensionRef.current = 0;
    tapTimestampsRef.current = [];
  }, []);

  return {
    onPlayerTap,
    onComboChange,
    onTensionChange,
    onGameEnd,
    onCountdownTick,
    onBattleStart,
    reset,
  };
}
