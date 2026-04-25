// /components/EnergyBar.tsx

'use client';

import { motion } from 'framer-motion';

const BAR_SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;
const SHAKE_THRESHOLD = 60;

interface EnergyBarProps {
  position: number;
  winner: 'A' | 'B' | null;
}

export default function EnergyBar({ position, winner }: EnergyBarProps) {
  const clampedPos = Math.max(-100, Math.min(100, position));
  const indicatorX = `${50 + (clampedPos / 2)}%`;
  const isNearWin = Math.abs(clampedPos) >= SHAKE_THRESHOLD;

  const getBarColor = (): string => {
    if (winner === 'A') return 'bg-purple-500';
    if (winner === 'B') return 'bg-blue-500';
    if (clampedPos < 0) return 'bg-purple-500';
    if (clampedPos > 0) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getGlowIntensity = (): string => {
    const intensity = Math.abs(clampedPos) / 100;
    if (intensity < 0.3) return '';
    return intensity >= 0.6
      ? 'shadow-[0_0_20px_4px_rgba(139,92,246,0.6)]'
      : 'shadow-[0_0_10px_2px_rgba(139,92,246,0.3)]';
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-full bg-gray-800"
      style={{ height: 28 }}
    >
      {/* Zone markers */}
      <div className="absolute inset-0 flex items-center">
        <div className="absolute left-[25%] h-full w-px bg-white/10" />
        <div className="absolute left-[50%] h-full w-px bg-white/20" />
        <div className="absolute left-[75%] h-full w-px bg-white/10" />
      </div>

      {/* Player A side (left) */}
      <div className="absolute left-0 top-0 h-full w-1/2">
        <motion.div
          className="h-full bg-purple-500/20"
          animate={{
            width: `${Math.max(0, -clampedPos / 2)}%`,
          }}
          transition={BAR_SPRING}
        />
      </div>

      {/* Player B side (right) */}
      <div className="absolute right-0 top-0 h-full w-1/2">
        <motion.div
          className="ml-auto h-full bg-blue-500/20"
          animate={{
            width: `${Math.max(0, clampedPos / 2)}%`,
          }}
          transition={BAR_SPRING}
        />
      </div>

      {/* Indicator */}
      <motion.div
        className={`absolute top-0 h-full w-2 -translate-x-1/2 rounded-full ${getBarColor()} ${getGlowIntensity()}`}
        animate={{
          left: indicatorX,
        }}
        transition={BAR_SPRING}
      />

      {/* Near-win shake overlay */}
      {isNearWin && !winner && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ x: [-1, 1, -1, 0] }}
          transition={{ repeat: Infinity, duration: 0.3, ease: 'easeInOut' }}
        />
      )}

      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30" />
    </div>
  );
}
