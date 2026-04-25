// /hooks/useAudio.ts

'use client';

import { useCallback, useRef } from 'react';
import { getAudioEngine } from '@/lib/audioEngine';

export function useAudio() {
  const engineRef = useRef<ReturnType<typeof getAudioEngine> | null>(null);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = getAudioEngine();
    }
    return engineRef.current;
  }, []);

  const ensureInit = useCallback(() => {
    const engine = getEngine();
    engine.init();
    return engine;
  }, []);

  const playTap = useCallback((pitchShift = 0) => {
    ensureInit().playTap(pitchShift);
  }, [ensureInit]);

  const playCombo = useCallback((level: number) => {
    ensureInit().playCombo(level);
  }, [ensureInit]);

  const playCountdownTick = useCallback(() => {
    ensureInit().playCountdownTick();
  }, [ensureInit]);

  const playCountdownFinal = useCallback(() => {
    ensureInit().playCountdownFinal();
  }, [ensureInit]);

  const playBattleStart = useCallback(() => {
    ensureInit().playBattleStart();
  }, [ensureInit]);

  const playWin = useCallback(() => {
    ensureInit().playWin();
  }, [ensureInit]);

  const playLose = useCallback(() => {
    ensureInit().playLose();
  }, [ensureInit]);

  return {
    playTap,
    playCombo,
    playCountdownTick,
    playCountdownFinal,
    playBattleStart,
    playWin,
    playLose,
  };
}
