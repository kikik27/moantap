// /components/fx/PowerMeter.tsx

'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

const METER_SPRING = { type: 'spring', stiffness: 180, damping: 22 } as const;

const COLOR_TIERS = [
  { threshold: 0.75, color: '#F59E0B', glow: '0 0 12px 3px rgba(245,158,11,0.5)' },
  { threshold: 0.5, color: '#A78BFA', glow: '0 0 8px 2px rgba(167,139,250,0.4)' },
  { threshold: 0.25, color: '#8B5CF6', glow: '0 0 4px 1px rgba(139,92,246,0.3)' },
  { threshold: 0, color: '#4B5563', glow: 'none' },
] as const;

const PLAYER_COLORS = {
  A: { base: '#8B5CF6', bright: '#A78BFA', gold: '#F59E0B' },
  B: { base: '#3B82F6', bright: '#60A5FA', gold: '#F59E0B' },
} as const;

interface PowerMeterProps {
  energy: number;
  maxEnergy: number;
  player: 'A' | 'B';
}

function getTierStyle(percent: number, player: 'A' | 'B') {
  const colors = PLAYER_COLORS[player];

  for (const tier of COLOR_TIERS) {
    if (percent >= tier.threshold) {
      if (percent >= 0.75) {
        return {
          color: colors.gold,
          glow: `0 0 12px 3px rgba(245,158,11,0.5)`,
        };
      }
      if (percent >= 0.5) {
        return {
          color: colors.bright,
          glow: `0 0 8px 2px ${colors.bright}66`,
        };
      }
      return {
        color: colors.base,
        glow: `0 0 4px 1px ${colors.base}44`,
      };
    }
  }

  return { color: '#374151', glow: 'none' };
}

function PowerMeter({ energy, maxEnergy, player }: PowerMeterProps) {
  const clampedMax = Math.max(maxEnergy, 1);
  const percent = Math.min(energy / clampedMax, 1);
  const { color, glow } = getTierStyle(percent, player);
  const widthPercent = percent * 100;

  return (
    <div className="flex w-full items-center gap-2">
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-gray-800"
        role="progressbar"
        aria-valuenow={energy}
        aria-valuemin={0}
        aria-valuemax={clampedMax}
      >
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: color, boxShadow: glow }}
          animate={{ width: `${widthPercent}%` }}
          transition={METER_SPRING}
        />
      </div>
      <span className="min-w-[36px] text-right text-[10px] font-bold tabular-nums text-white/60">
        {energy}
      </span>
    </div>
  );
}

export default memo(PowerMeter);
