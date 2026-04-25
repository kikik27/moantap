// /components/PvPBattle.tsx

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { usePvPBattle } from '@/hooks/usePvPBattle';
import { getMoanAsset } from '@/lib/tapLogic';
import EnergyBar from './EnergyBar';

const TAP_SPRING = { type: 'spring', stiffness: 400, damping: 17 } as const;

const GLOW_VARIANTS = {
  idle: { boxShadow: '0 0 0px rgba(0,0,0,0)' },
  tapping: { boxShadow: '0 0 0px rgba(0,0,0,0)' },
  charging: { boxShadow: '0 0 30px 8px rgba(139,92,246,0.5)' },
  epic: { boxShadow: '0 0 50px 16px rgba(99,102,241,0.7)' },
} as const;

const OPPONENT_GLOW_VARIANTS = {
  idle: { boxShadow: '0 0 0px rgba(0,0,0,0)' },
  tapping: { boxShadow: '0 0 0px rgba(0,0,0,0)' },
  charging: { boxShadow: '0 0 30px 8px rgba(59,130,246,0.5)' },
  epic: { boxShadow: '0 0 50px 16px rgba(37,99,235,0.7)' },
} as const;

const PULSE_VARIANTS: Record<string, { scale: number | number[]; transition?: object }> = {
  idle: { scale: 1 },
  tapping: { scale: 1 },
  charging: { scale: 1 },
  epic: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 0.7, ease: 'easeInOut' },
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
      className="pointer-events-none absolute text-base font-bold text-yellow-300 drop-shadow-lg"
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -60, scale: 1.2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{ left: point.x, top: point.y }}
    >
      +{point.value}
    </motion.span>
  );
}

function PlayerPanel({
  label,
  energy,
  taps,
  tps,
  moanState,
  glowVariants,
  isOpponent,
}: {
  label: string;
  energy: number;
  taps: number;
  tps: number;
  moanState: string;
  glowVariants: Record<string, { boxShadow: string }>;
  isOpponent: boolean;
}) {
  const asset = getMoanAsset(moanState as never);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </span>

      <motion.div
        className="rounded-full"
        animate={{
          ...(moanState === 'epic' ? PULSE_VARIANTS.epic : { scale: 1 }),
          ...glowVariants[moanState as keyof typeof glowVariants],
        }}
        transition={TAP_SPRING}
      >
        <Image
          src={asset}
          alt={`${label} character`}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover"
          draggable={false}
        />
      </motion.div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-bold text-white">{energy}</span>
        <span className="text-[10px] text-white/40">
          {taps} taps · {tps} tps
        </span>
      </div>
    </div>
  );
}

function ResultOverlay({
  winner,
  onRestart,
}: {
  winner: 'A' | 'B' | null;
  onRestart: () => void;
}) {
  const label = winner === 'A' ? 'YOU WIN' : winner === 'B' ? 'YOU LOSE' : 'DRAW';
  const color = winner === 'A' ? 'text-purple-400' : winner === 'B' ? 'text-blue-400' : 'text-white';

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        className={`text-3xl font-black ${color}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {label}
      </motion.span>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
      >
        Play Again
      </button>
    </motion.div>
  );
}

export default function PvPBattle() {
  const {
    battle,
    playerTPS,
    opponentTPS,
    handleTap,
    isRunning,
    startBattle,
    resetBattle,
  } = usePvPBattle();

  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);

  const onPlayerTap = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isRunning || battle.winner !== null) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      handleTap();

      const id = Date.now() + Math.random();
      setFloatingPoints((prev) => [
        ...prev.slice(-6),
        { id, value: 10, x, y },
      ]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== id));
      }, 800);
    },
    [handleTap, isRunning, battle.winner],
  );

  if (!isRunning && battle.winner === null) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="text-xl font-bold text-white">PvP Battle</h2>
        <button
          type="button"
          onClick={startBattle}
          className="rounded-xl bg-purple-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-purple-500"
        >
          START BATTLE
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-4 py-4">
      {/* Timer */}
      <div className="text-center">
        <span className="text-2xl font-black tabular-nums text-white">
          {String(Math.floor(battle.timeRemaining / 60)).padStart(2, '0')}:
          {String(battle.timeRemaining % 60).padStart(2, '0')}
        </span>
      </div>

      {/* Players row */}
      <div className="flex items-center justify-between px-2">
        <PlayerPanel
          label="YOU"
          energy={battle.playerA.energy}
          taps={battle.playerA.taps}
          tps={playerTPS}
          moanState={battle.playerA.moanState}
          glowVariants={GLOW_VARIANTS}
          isOpponent={false}
        />

        <span className="text-lg font-black text-white/20">VS</span>

        <PlayerPanel
          label="OPPONENT"
          energy={battle.playerB.energy}
          taps={battle.playerB.taps}
          tps={opponentTPS}
          moanState={battle.playerB.moanState}
          glowVariants={OPPONENT_GLOW_VARIANTS}
          isOpponent
        />
      </div>

      {/* Energy Bar */}
      <div className="px-2">
        <EnergyBar
          position={battle.energyBarPosition}
          winner={battle.winner}
        />
      </div>

      {/* Tap Area */}
      <div className="flex justify-center pt-2">
        <motion.button
          type="button"
          className="relative rounded-full touch-none focus:outline-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          animate={{
            ...(battle.playerA.moanState === 'epic'
              ? PULSE_VARIANTS.epic
              : { scale: 1 }),
            ...GLOW_VARIANTS[battle.playerA.moanState],
          }}
          whileTap={{ scale: 0.92 }}
          transition={TAP_SPRING}
          onPointerDown={onPlayerTap}
        >
          <Image
            src={getMoanAsset(battle.playerA.moanState)}
            alt="Your MOAN"
            width={140}
            height={140}
            className="h-32 w-32 rounded-full object-cover sm:h-36 sm:w-36"
            draggable={false}
          />

          <AnimatePresence>
            {floatingPoints.map((point) => (
              <FloatingScore key={point.id} point={point} />
            ))}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Dominance flash */}
      {battle.energyBarPosition < -50 && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl bg-purple-500/5"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
      {battle.energyBarPosition > 50 && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl bg-blue-500/5"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {/* Result overlay */}
      {battle.winner !== null && (
        <ResultOverlay winner={battle.winner} onRestart={resetBattle} />
      )}
    </div>
  );
}
