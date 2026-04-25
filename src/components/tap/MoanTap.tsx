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
  const { moanState, asset, handleTap, hasEnergy, botWarning, isBotPaused } = useTapGame();
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);

  const onTap = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!hasEnergy || isBotPaused) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const points = handleTap(x, y);
      if (points <= 0) return;

      const id = Date.now() + Math.random();
      setFloatingPoints((prev) => [...prev.slice(-8), { id, value: points, x, y }]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== id));
      }, 700);
    },
    [handleTap, hasEnergy, isBotPaused],
  );

  return (
    <div className="flex flex-col items-center select-none">
      <motion.button
        type="button"
        className="relative rounded-full touch-none focus:outline-none"
        style={{
          WebkitTapHighlightColor: 'transparent',
          opacity: hasEnergy && !isBotPaused ? 1 : 0.4,
        }}
        animate={{
          ...(moanState === 'epic' && hasEnergy && !isBotPaused ? PULSE_VARIANTS.epic : { scale: 1 }),
          ...(hasEnergy && !isBotPaused ? GLOW_VARIANTS[moanState] : { boxShadow: 'none' }),
        }}
        whileTap={hasEnergy && !isBotPaused ? { scale: 0.95 } : undefined}
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

      {/* Bot warning overlay */}
      <AnimatePresence>
        {botWarning && (
          <motion.div
            className="mt-3 rounded-xl px-4 py-2 text-center"
            style={{ background: `${colors.primary}20`, border: `1px solid ${colors.primary}40` }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-bold" style={{ color: colors.primarySoft }}>
              Bot behavior detected
            </p>
            <p className="text-[10px]" style={{ color: colors.textMuted }}>
              {botWarning.reason}. Tapping paused.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasEnergy && !isBotPaused && (
        <motion.p
          className="mt-3 text-xs font-semibold"
          style={{ color: colors.textMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Out of energy — wait to recharge
        </motion.p>
      )}

      {/* Pedestal */}
      <div
        className="mt-[-8px] h-3 w-32 rounded-[50%]"
        style={{
          background: `radial-gradient(ellipse, ${hasEnergy && !isBotPaused ? colors.glowPurpleSoft : 'transparent'}, transparent 70%)`,
          filter: 'blur(2px)',
        }}
      />
    </div>
  );
}
