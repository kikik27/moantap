// /hooks/useTapGame.ts

'use client';

import { useCallback, useRef, useState } from 'react';
import {
  calculateMultiplier,
  calculateTapScore,
  getMoanAsset,
  getMoanState,
  updateCombo,
  type MoanState,
} from '@/lib/tapLogic';

interface TapGameState {
  score: number;
  combo: number;
  multiplier: number;
  moanState: MoanState;
  asset: string;
  handleTap: () => void;
}

export function useTapGame(): TapGameState {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const lastTapTimeRef = useRef(0);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const multiplier = calculateMultiplier(combo);
  const moanState = getMoanState(combo);
  const asset = getMoanAsset(moanState);

  const resetStaleTimer = useCallback(() => {
    if (staleTimerRef.current !== null) {
      clearTimeout(staleTimerRef.current);
    }
    staleTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 800);
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();

    setCombo((prevCombo) => {
      const newCombo = updateCombo(prevCombo, lastTapTimeRef.current, now);
      const newMultiplier = calculateMultiplier(newCombo);
      const points = calculateTapScore(newMultiplier);

      setScore((prev) => prev + points);

      return newCombo;
    });

    lastTapTimeRef.current = now;
    resetStaleTimer();
  }, [resetStaleTimer]);

  return { score, combo, multiplier, moanState, asset, handleTap };
}
