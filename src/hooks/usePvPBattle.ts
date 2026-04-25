// /hooks/usePvPBattle.ts

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyTapsToPlayer,
  calculateEnergyBarPosition,
  createInitialBattleState,
  detectWinner,
  getRandomOpponentInterval,
  getRandomOpponentTaps,
  type BattleState,
} from '@/lib/battleLogic';

const RAPID_TAP_THRESHOLD_MS = 200;
const TAP_BURST_INCREMENT = 0.18;
const TAP_BURST_RAPID_BONUS = 0.22;
const TAP_BURST_MAX = 1;
const TAP_BURST_DECAY_AMOUNT = 0.04;
const TAP_BURST_DECAY_INTERVAL_MS = 50;

interface UsePvPBattleReturn {
  battle: BattleState;
  playerTPS: number;
  opponentTPS: number;
  tapBurst: number;
  handleTap: () => void;
  isRunning: boolean;
  startBattle: () => void;
  resetBattle: () => void;
}

export function usePvPBattle(): UsePvPBattleReturn {
  const [battle, setBattle] = useState<BattleState>(createInitialBattleState);
  const [isRunning, setIsRunning] = useState(false);
  const [playerTPS, setPlayerTPS] = useState(0);
  const [opponentTPS, setOpponentTPS] = useState(0);
  const [tapBurst, setTapBurst] = useState(0);

  const playerTapTimestampsRef = useRef<number[]>([]);
  const opponentTapTimestampsRef = useRef<number[]>([]);
  const lastPlayerTapRef = useRef(0);
  const opponentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstDecayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (opponentTimeoutRef.current !== null) {
      clearTimeout(opponentTimeoutRef.current);
      opponentTimeoutRef.current = null;
    }
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (tpsIntervalRef.current !== null) {
      clearInterval(tpsIntervalRef.current);
      tpsIntervalRef.current = null;
    }
    if (burstDecayRef.current !== null) {
      clearInterval(burstDecayRef.current);
      burstDecayRef.current = null;
    }
  }, []);

  const scheduleOpponentTick = useCallback(() => {
    const delay = getRandomOpponentInterval();
    opponentTimeoutRef.current = setTimeout(() => {
      const taps = getRandomOpponentTaps();
      const now = Date.now();

      opponentTapTimestampsRef.current.push(...Array(taps).fill(now));

      setBattle((prev) => {
        if (prev.winner !== null) return prev;

        const newPlayerB = applyTapsToPlayer(prev.playerB, taps);
        const position = calculateEnergyBarPosition(
          prev.playerA.energy,
          newPlayerB.energy,
        );

        return {
          ...prev,
          playerB: newPlayerB,
          energyBarPosition: position,
        };
      });

      scheduleOpponentTick();
    }, delay);
  }, []);

  const startBattle = useCallback(() => {
    const initial = createInitialBattleState();
    playerTapTimestampsRef.current = [];
    opponentTapTimestampsRef.current = [];
    lastPlayerTapRef.current = 0;

    setBattle(initial);
    setIsRunning(true);
    setPlayerTPS(0);
    setOpponentTPS(0);
    setTapBurst(0);

    timerIntervalRef.current = setInterval(() => {
      setBattle((prev) => {
        if (prev.winner !== null) return prev;

        const newTime = prev.timeRemaining - 1;
        const winner =
          newTime <= 0
            ? detectWinner(
                prev.energyBarPosition,
                prev.playerA.energy,
                prev.playerB.energy,
                newTime,
              )
            : null;

        if (winner !== null) {
          setIsRunning(false);
        }

        return { ...prev, timeRemaining: newTime, winner };
      });
    }, 1000);

    tpsIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const oneSecondAgo = now - 1000;

      const playerRecent = playerTapTimestampsRef.current.filter(
        (t) => t > oneSecondAgo,
      );
      const opponentRecent = opponentTapTimestampsRef.current.filter(
        (t) => t > oneSecondAgo,
      );

      playerTapTimestampsRef.current = playerRecent;
      opponentTapTimestampsRef.current = opponentRecent;

      setPlayerTPS(playerRecent.length);
      setOpponentTPS(opponentRecent.length);
    }, 250);

    burstDecayRef.current = setInterval(() => {
      setTapBurst((prev) => {
        const next = prev - TAP_BURST_DECAY_AMOUNT;
        return next <= 0 ? 0 : next;
      });
    }, TAP_BURST_DECAY_INTERVAL_MS);

    scheduleOpponentTick();
  }, [scheduleOpponentTick]);

  const resetBattle = useCallback(() => {
    clearAllTimers();
    setBattle(createInitialBattleState());
    setIsRunning(false);
    setPlayerTPS(0);
    setOpponentTPS(0);
    setTapBurst(0);
    playerTapTimestampsRef.current = [];
    opponentTapTimestampsRef.current = [];
    lastPlayerTapRef.current = 0;
  }, [clearAllTimers]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const interval = now - lastPlayerTapRef.current;
    lastPlayerTapRef.current = now;

    const isRapid = interval < RAPID_TAP_THRESHOLD_MS;
    const burstDelta = isRapid
      ? TAP_BURST_INCREMENT + TAP_BURST_RAPID_BONUS
      : TAP_BURST_INCREMENT;

    setTapBurst((prev) => Math.min(prev + burstDelta, TAP_BURST_MAX));

    setBattle((prev) => {
      if (prev.winner !== null || prev.timeRemaining <= 0) return prev;

      const newPlayerA = applyTapsToPlayer(prev.playerA, 1);
      const position = calculateEnergyBarPosition(
        newPlayerA.energy,
        prev.playerB.energy,
      );

      return {
        ...prev,
        playerA: newPlayerA,
        energyBarPosition: position,
      };
    });

    playerTapTimestampsRef.current.push(now);
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    battle,
    playerTPS,
    opponentTPS,
    tapBurst,
    handleTap,
    isRunning,
    startBattle,
    resetBattle,
  };
}
