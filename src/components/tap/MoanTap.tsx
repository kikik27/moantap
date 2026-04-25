'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useTapGame } from '@/hooks/useTapGame';
import { colors } from '@/styles/design-tokens';

const TAP_SPRING = { type: 'spring', stiffness: 400, damping: 17 } as const;

const GLOW_VARIANTS: Record<string, { boxShadow: string }> = {
  idle: { boxShadow: `0 0 24px 4px ${colors.glowPurpleSoft}` },
  tapping: { boxShadow: `0 0 32px 8px ${colors.glowPurpleSoft}` },
  charging: { boxShadow: '0 0 40px 12px rgba(139,92,246,0.5)' },
  epic: { boxShadow: '0 0 60px 20px rgba(99,102,241,0.7)' },
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
      className="pointer-events-none absolute text-base font-bold"
      style={{ left: point.x, top: point.y, color: colors.gold }}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -60, scale: 1.2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      +{point.value}
    </motion.span>
  );
}

export default function MoanTap() {
  const { moanState, asset, handleTap } = useTapGame();
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

      handleTap();

      const id = Date.now() + Math.random();
      setFloatingPoints((prev) => [...prev.slice(-8), { id, value: Math.floor(1 * 1), x, y }]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== id));
      }, 700);
    },
    [handleTap],
  );

  return (
    <div className="flex flex-col items-center select-none">
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
          className="h-48 w-48 rounded-full object-cover"
        />

        <AnimatePresence>
          {floatingPoints.map((point) => (
            <FloatingScore key={point.id} point={point} />
          ))}
        </AnimatePresence>
      </motion.button>

      {/* Pedestal */}
      <div
        className="mt-[-8px] h-3 w-32 rounded-[50%]"
        style={{
          background: `radial-gradient(ellipse, ${colors.glowPurpleSoft}, transparent 70%)`,
          filter: 'blur(2px)',
        }}
      />
    </div>
  );
}
