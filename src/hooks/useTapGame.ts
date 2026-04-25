'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import {
  getMoanAsset,
  calculateMultiplier,
  getMoanState,
  MAX_ENERGY,
  ENERGY_REGEN_INTERVAL,
} from '@/lib/tapLogic';

export function useTapGame() {
  const score = useGameStore((s) => s.score)
  const energy = useGameStore((s) => s.energy)
  const combo = useGameStore((s) => s.combo)
  const multiplier = useGameStore((s) => calculateMultiplier(s.combo))
  const moanState = useGameStore((s) => getMoanState(s.combo))
  const hasEnergy = useGameStore((s) => s.energy > 0)
  const tap = useGameStore((s) => s.tap)
  const regenEnergy = useGameStore((s) => s.regenEnergy)
  const resetCombo = useGameStore((s) => s.resetCombo)
  const updateScore = useUserStore((s) => s.updateScore)
  const addTaps = useUserStore((s) => s.addTaps)
  const currentUserWallet = useUserStore((s) => s.currentUserWallet)

  const asset = getMoanAsset(moanState)
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const regenTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Energy regen — returns amount gained so component can show floating text
  const onEnergyRegenRef = useRef<((amount: number) => void) | null>(null)

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

  const handleTap = useCallback((): number => {
    const points = tap()
    if (points > 0) {
      syncScore(useGameStore.getState().score)
      resetStaleTimer()
    }
    return points
  }, [tap, syncScore, resetStaleTimer])

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
  }
}
