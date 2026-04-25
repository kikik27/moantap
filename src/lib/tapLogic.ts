// /lib/tapLogic.ts — Pure tap game logic (no React)

import type { MoanState } from '@/types/tap';
export type { MoanState };

const MULTIPLIER_THRESHOLDS = [
  { min: 30, value: 3.0 },
  { min: 20, value: 2.0 },
  { min: 10, value: 1.5 },
  { min: 5, value: 1.2 },
  { min: 0, value: 1.0 },
] as const;

const MOAN_STATE_THRESHOLDS = [
  { min: 40, state: 'epic' as MoanState },
  { min: 25, state: 'charging' as MoanState },
  { min: 1, state: 'tapping' as MoanState },
  { min: 0, state: 'idle' as MoanState },
] as const;

const MOAN_ASSET_MAP: Record<MoanState, string> = {
  idle: '/assets/moan/idle.png',
  tapping: '/assets/moan/tapping.png',
  charging: '/assets/moan/charging.png',
  epic: '/assets/moan/epic.png',
};

export function calculateMultiplier(combo: number): number {
  for (const { min, value } of MULTIPLIER_THRESHOLDS) {
    if (combo >= min) return value;
  }
  return 1.0;
}

export function calculateTapScore(multiplier: number): number {
  return Math.floor(1 * multiplier);
}

export function updateCombo(
  currentCombo: number,
  lastTapTime: number,
  now: number,
): number {
  const elapsed = now - lastTapTime;
  if (elapsed < 800) return currentCombo + 1;
  return 1;
}

export function getMoanState(combo: number): MoanState {
  for (const { min, state } of MOAN_STATE_THRESHOLDS) {
    if (combo >= min) return state;
  }
  return 'idle';
}

export function getMoanAsset(state: MoanState): string {
  return MOAN_ASSET_MAP[state];
}

export function isComboStale(lastTapTime: number, now: number): boolean {
  return now - lastTapTime > 800;
}
