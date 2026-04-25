import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  calculateMultiplier,
  calculateStatePoints,
  getMoanState,
  updateCombo,
  type MoanState,
} from '@/lib/tapLogic'
import { MAX_ENERGY, ENERGY_REGEN_AMOUNT } from '@/lib/tapLogic'

interface GameState {
  score: number
  energy: number
  maxEnergy: number
  combo: number
  lastTapTime: number
  botStrikes: number
  botPausedUntil: number

  // Derived (not persisted, computed on read)
  multiplier: number
  moanState: MoanState
  hasEnergy: boolean
  isBotPaused: boolean

  // Actions
  tap: () => number
  regenEnergy: () => number
  resetCombo: () => void
  resetGame: () => void
  addBotStrike: (reason: string) => void
  addScore: (points: number) => void
  resetScore: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      score: 0,
      energy: MAX_ENERGY,
      maxEnergy: MAX_ENERGY,
      combo: 0,
      lastTapTime: 0,
      botStrikes: 0,
      botPausedUntil: 0,

      get multiplier() {
        return calculateMultiplier(get().combo)
      },
      get moanState() {
        return getMoan(get().combo)
      },
      get hasEnergy() {
        return get().energy > 0
      },
      get isBotPaused() {
        return Date.now() < get().botPausedUntil
      },

      tap: () => {
        const state = get()
        if (state.energy <= 0) return 0

        const now = Date.now()
        const newCombo = updateCombo(state.combo, state.lastTapTime, now)
        const newState = getMoan(newCombo)
        const newMult = calculateMultiplier(newCombo)
        const points = calculateStatePoints(newState, newMult)

        set({
          score: state.score + points,
          energy: Math.max(0, state.energy - 1),
          combo: newCombo,
          lastTapTime: now,
        })

        return points
      },

      regenEnergy: () => {
        const state = get()
        if (state.energy >= MAX_ENERGY) return 0
        const gained = Math.min(ENERGY_REGEN_AMOUNT, MAX_ENERGY - state.energy)
        set({ energy: state.energy + gained })
        return gained
      },

      resetCombo: () => {
        set({ combo: 0 })
      },

      addBotStrike: (reason: string) => {
        const strikes = get().botStrikes + 1
        const penalty = strikes === 1 ? 10_000 : 30_000
        set({
          botStrikes: strikes,
          botPausedUntil: Date.now() + penalty,
          combo: 0,
        })
      },

      addScore: (points: number) => {
        set((state) => ({ score: state.score + points }))
      },

      resetScore: () => {
        set({ score: 0 })
      },

      resetGame: () => {
        set({ score: 0, energy: MAX_ENERGY, combo: 0, lastTapTime: 0, botStrikes: 0, botPausedUntil: 0 })
      },
    }),
    {
      name: 'moantap_game',
      partialize: (state) => ({
        score: state.score,
        energy: state.energy,
        botStrikes: state.botStrikes,
      }),
    },
  ),
)

// Getters for derived state (recomputed on every call)
function getMoan(combo: number): MoanState {
  return getMoanState(combo)
}

// Selector hooks for derived state
export function useMultiplier() {
  return useGameStore((s) => calculateMultiplier(s.combo))
}

export function useMoanState() {
  return useGameStore((s) => getMoanState(s.combo))
}

export function useHasEnergy() {
  return useGameStore((s) => s.energy > 0)
}
