// /lib/battleLogic.ts — Pure battle logic (no React)

import type { MoanState } from '@/types/tap';
import type { PlayerState, BattleState, BattleSignals } from '@/types/pvp';

export type { PlayerState, BattleState, BattleSignals };

const ENERGY_PER_TAP = 10;
const BATTLE_DURATION_SECONDS = 30;
const ENERGY_BAR_MIN = -100;
const ENERGY_BAR_MAX = 100;

const MOAN_STATE_ENERGY_THRESHOLDS = [
  { min: 400, state: 'epic' as MoanState },
  { min: 250, state: 'charging' as MoanState },
  { min: 1, state: 'tapping' as MoanState },
  { min: 0, state: 'idle' as MoanState },
] as const;

const OPPONENT_INTERVAL_MIN_MS = 400;
const OPPONENT_INTERVAL_MAX_MS = 600;
const OPPONENT_MAX_TAPS_PER_TICK = 3;

export function getEnergyPerTap(): number {
  return ENERGY_PER_TAP;
}

export function getBattleDuration(): number {
  return BATTLE_DURATION_SECONDS;
}

export function getMoanStateFromEnergy(energy: number): MoanState {
  for (const { min, state } of MOAN_STATE_ENERGY_THRESHOLDS) {
    if (energy >= min) return state;
  }
  return 'idle';
}

export function calculateEnergyBarPosition(
  energyA: number,
  energyB: number,
): number {
  const total = energyA + energyB;
  if (total === 0) return 0;

  const raw = ((energyB - energyA) / total) * 100;
  return Math.max(ENERGY_BAR_MIN, Math.min(ENERGY_BAR_MAX, raw));
}

export function detectWinner(
  position: number,
  energyA: number,
  energyB: number,
  timeRemaining: number,
): 'A' | 'B' | null {
  if (timeRemaining > 0) return null;

  if (energyA > energyB) return 'A';
  if (energyB > energyA) return 'B';
  return null;
}

export function createInitialPlayer(): PlayerState {
  return { energy: 0, taps: 0, moanState: 'idle' };
}

export function createInitialBattleState(): BattleState {
  return {
    playerA: createInitialPlayer(),
    playerB: createInitialPlayer(),
    timeRemaining: BATTLE_DURATION_SECONDS,
    energyBarPosition: 0,
    winner: null,
  };
}

export function getRandomOpponentInterval(): number {
  return (
    OPPONENT_INTERVAL_MIN_MS +
    Math.random() * (OPPONENT_INTERVAL_MAX_MS - OPPONENT_INTERVAL_MIN_MS)
  );
}

export function getRandomOpponentTaps(): number {
  return Math.floor(Math.random() * (OPPONENT_MAX_TAPS_PER_TICK + 1));
}

export function applyTapsToPlayer(
  player: PlayerState,
  tapCount: number,
): PlayerState {
  if (tapCount <= 0) return player;

  const energyGained = tapCount * ENERGY_PER_TAP;
  const newEnergy = player.energy + energyGained;
  const newTaps = player.taps + tapCount;

  return {
    energy: newEnergy,
    taps: newTaps,
    moanState: getMoanStateFromEnergy(newEnergy),
  };
}

const SIGNAL_ENERGY_SCALE = 600;
const TENSION_NEAR_WIN_POSITION = 70;
const MOMENTUM_SMOOTHING = 0.3;

export function computeBattleSignals(
  battle: BattleState,
  playerTPS: number,
  opponentTPS: number,
  prevEnergyA: number,
  prevEnergyB: number,
  tapBurst: number,
): BattleSignals {
  const { playerA, playerB, energyBarPosition } = battle;

  const totalEnergy = playerA.energy + playerB.energy;
  const totalTPS = playerTPS + opponentTPS;
  const energyFactor = Math.min(totalEnergy / SIGNAL_ENERGY_SCALE, 1);
  const tpsFactor = Math.min(totalTPS / 12, 1);
  const intensity = Math.min((energyFactor * 0.5 + tpsFactor * 0.3 + tapBurst * 0.2), 1);

  const dominance: 'A' | 'B' | null =
    energyBarPosition < -5 ? 'A' : energyBarPosition > 5 ? 'B' : null;

  const absPos = Math.abs(energyBarPosition);
  const positionTension = Math.max(0, (absPos - 30) / TENSION_NEAR_WIN_POSITION);
  const timePressure = battle.timeRemaining <= 10
    ? 1 - battle.timeRemaining / 10
    : 0;
  const tension = Math.min(positionTension * 0.7 + timePressure * 0.3, 1);

  const rawDelta =
    (playerA.energy - prevEnergyA) - (playerB.energy - prevEnergyB);
  const momentum = Math.min(Math.abs(rawDelta) / 30, 1) * MOMENTUM_SMOOTHING +
    Math.abs(energyBarPosition) / 100 * (1 - MOMENTUM_SMOOTHING);

  return { intensity, dominance, tension, momentum, tapBurst };
}
