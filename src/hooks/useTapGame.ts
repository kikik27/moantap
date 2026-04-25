'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import {
  getMoanAsset,
  calculateMultiplier,
  getMoanState,
  MAX_ENERGY,
  ENERGY_REGEN_INTERVAL,
} from '@/lib/tapLogic';
import { createBotDetector } from '@/hooks/useBotDetection';

export function useTapGame() {
  const score = useGameStore((s) => s.score)
  const energy = useGameStore((s) => s.energy)
  const combo = useGameStore((s) => s.combo)
  const multiplier = useGameStore((s) => calculateMultiplier(s.combo))
  const moanState = useGameStore((s) => getMoanState(s.combo))
  const hasEnergy = useGameStore((s) => s.energy > 0)
  const isBotPaused = useGameStore((s) => s.isBotPaused)
  const tap = useGameStore((s) => s.tap)
  const regenEnergy = useGameStore((s) => s.regenEnergy)
  const resetCombo = useGameStore((s) => s.resetCombo)
  const addBotStrike = useGameStore((s) => s.addBotStrike)
  const botPausedUntil = useGameStore((s) => s.botPausedUntil)
  const addScoreAction = useGameStore((s) => s.addScore)
  const resetScore = useGameStore((s) => s.resetScore)
  const updateScore = useUserStore((s) => s.updateScore)
  const addTaps = useUserStore((s) => s.addTaps)
  const addCoins = useUserStore((s) => s.addCoins)
  const currentUserWallet = useUserStore((s) => s.currentUserWallet)

  const asset = getMoanAsset(moanState)
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const regenTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const botDetection = useMemo(() => createBotDetector(), [])

  // Energy regen — returns amount gained so component can show floating text
  const onEnergyRegenRef = useRef<((amount: number) => void) | null>(null)

  // Bot warning state
  const [botWarning, setBotWarning] = useState<{ reason: string; resumeAt: number } | null>(null)

  // Clear bot warning when pause expires
  useEffect(() => {
    if (!botWarning) return
    if (Date.now() >= botWarning.resumeAt) {
      setBotWarning(null)
      return
    }
    const timer = setTimeout(() => setBotWarning(null), botWarning.resumeAt - Date.now())
    return () => clearTimeout(timer)
  }, [botWarning])

  useEffect(() => {
    regenTimerRef.current = setInterval(() => {
      const gained = regenEnergy()
      if (gained > 0 && onEnergyRegenRef.current) {
        onEnergyRegenRef.current(gained)
      }
    }, ENERGY_REGEN_INTERVAL)
    return () => {
      if (regenTimerRef.current) clearInterval(regenTimerRef.current)
    }
  }, [regenEnergy])

  const setOnEnergyRegen = useCallback((fn: (amount: number) => void) => {
    onEnergyRegenRef.current = fn
  }, [])

  // Combo stale reset
  const resetStaleTimer = useCallback(() => {
    if (staleTimerRef.current !== null) {
      clearTimeout(staleTimerRef.current)
    }
    staleTimerRef.current = setTimeout(() => {
      resetCombo()
    }, 800)
  }, [resetCombo])

  // Persist best score to user store
  const syncScore = useCallback((currentScore: number) => {
    if (!currentUserWallet) return
    updateScore(currentUserWallet, currentScore)
    addTaps(currentUserWallet, 1)
  }, [currentUserWallet, updateScore, addTaps])

  const handleTap = useCallback((x: number, y: number): number => {
    if (isBotPaused) return 0

    const now = Date.now()
    const { isBot, reason } = botDetection.check(now, x, y)

    if (isBot && reason) {
      addBotStrike(reason)
      const strikes = useGameStore.getState().botStrikes
      const penalty = strikes === 1 ? 10_000 : 30_000
      setBotWarning({
        reason: reason === 'interval' ? 'Constant click interval detected' : 'Same position detected',
        resumeAt: now + penalty,
      })
      botDetection.reset()
      return 0
    }

    const points = tap()
    if (points > 0) {
      syncScore(useGameStore.getState().score)
      resetStaleTimer()
    }
    return points
  }, [tap, syncScore, resetStaleTimer, isBotPaused, addBotStrike, botDetection])

  const convertToCoins = useCallback((): { success: boolean; coins: number } => {
    const currentScore = useGameStore.getState().score
    if (currentScore === 0 || !currentUserWallet) return { success: false, coins: 0 }

    addCoins(currentUserWallet, currentScore)
    resetScore()
    return { success: true, coins: currentScore }
  }, [currentUserWallet, addCoins, resetScore])

  return {
    score,
    combo,
    multiplier,
    moanState,
    asset,
    energy,
    maxEnergy: MAX_ENERGY,
    hasEnergy,
    handleTap,
    setOnEnergyRegen,
    botWarning,
    isBotPaused,
    convertToCoins,
    addScore: addScoreAction,
  }
}
