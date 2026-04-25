// /components/MoanTap.tsx

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useTapGame } from '@/hooks/useTapGame';

const TAP_SPRING = { type: 'spring', stiffness: 400, damping: 17 } as const;

const GLOW_VARIANTS: Record<string, { boxShadow: string }> = {
  idle: { boxShadow: '0 0 0px rgba(0,0,0,0)' },
  tapping: { boxShadow: '0 0 0px rgba(0,0,0,0)' },
  charging: {
    boxShadow: '0 0 40px 12px rgba(139,92,246,0.5)',
  },
  epic: {
    boxShadow: '0 0 60px 20px rgba(99,102,241,0.7)',
  },
};

const PULSE_VARIANTS: Record<string, { scale: number | number[]; transition?: object }> = {
  idle: { scale: 1 },
  tapping: { scale: 1 },
  charging: { scale: 1 },
  epic: {
    scale: [1, 1.04, 1],
    transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
  },
};

interface FloatingPoint {
  id: number;
  value: number;
  x: number;
  y: number;
}

function FloatingScore({ point }: { point: FloatingPoint }) {
  return (
    <motion.span
      className="pointer-events-none absolute text-lg font-bold text-yellow-300 drop-shadow-lg"
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -80, scale: 1.3 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ left: point.x, top: point.y }}
    >
      +{point.value}
    </motion.span>
  );
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">
        {label}
      </span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

export default function MoanTap() {
  const { score, combo, multiplier, moanState, asset, handleTap } = useTapGame();
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);

  const onTap = useCallback(
    (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let clientX: number;
      let clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const points = Math.floor(1 * multiplier);

      handleTap();

      const id = Date.now() + Math.random();
      setFloatingPoints((prev) => [...prev.slice(-8), { id, value: points, x, y }]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== id));
      }, 900);
    },
    [handleTap, multiplier],
  );

  return (
    <div className="flex flex-col items-center justify-center gap-6 select-none">
      {/* Stats row */}
      <div className="flex gap-6">
        <StatBadge label="Score" value={score.toLocaleString()} />
        <StatBadge label="Combo" value={combo} />
        <StatBadge label="Multiplier" value={`${multiplier}x`} />
      </div>

      {/* Tap area */}
      <motion.button
        type="button"
        className="relative rounded-full touch-none focus:outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        animate={{
          ...(moanState === 'epic' ? PULSE_VARIANTS.epic : { scale: 1 }),
          ...GLOW_VARIANTS[moanState],
        }}
        whileTap={{ scale: 0.95 }}
        transition={TAP_SPRING}
        onPointerDown={onTap}
      >
        <img
          src={asset}
          alt="MOAN character"
          draggable={false}
          className="h-56 w-56 rounded-full object-cover sm:h-64 sm:w-64"
        />

        {/* Floating +score */}
        <AnimatePresence>
          {floatingPoints.map((point) => (
            <FloatingScore key={point.id} point={point} />
          ))}
        </AnimatePresence>
      </motion.button>

      {/* State label */}
      <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {moanState}
      </span>
    </div>
  );
}
