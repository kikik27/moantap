// /components/PvPBattleRealtime.tsx

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useGameFeedback } from '@/hooks/useGameFeedback';
import { usePvPSocket, type PvPPhase } from '@/hooks/usePvPSocket';
import { getMoanStateFromEnergy } from '@/lib/battleLogic';
import { getMoanAsset, type MoanState } from '@/lib/tapLogic';
import type { PlayerSlot } from '@/lib/wsProtocol';
import EnergyBar from './EnergyBar';
import EnergyBeam from '@/components/fx/EnergyBeam';
import ParticleBurst from '@/components/fx/ParticleBurst';
import PowerMeter from '@/components/fx/PowerMeter';
import ScreenShake from '@/components/fx/ScreenShake';
import PvPMatchmaking from './PvPMatchmaking';
import PvPCountdown from './PvPCountdown';

const TAP_SPRING = { type: 'spring', stiffness: 400, damping: 17 } as const;
const MAX_ENERGY_DISPLAY = 800;

const GLOW_MAP: Record<MoanState, string> = {
  idle: '0 0 0px rgba(0,0,0,0)',
  tapping: '0 0 0px rgba(0,0,0,0)',
  charging: '0 0 30px 8px rgba(139,92,246,0.5)',
  epic: '0 0 50px 16px rgba(99,102,241,0.7)',
};

const OPPONENT_GLOW_MAP: Record<MoanState, string> = {
  idle: '0 0 0px rgba(0,0,0,0)',
  tapping: '0 0 0px rgba(0,0,0,0)',
  charging: '0 0 30px 8px rgba(59,130,246,0.5)',
  epic: '0 0 50px 16px rgba(37,99,235,0.7)',
};

const EPIC_PULSE = {
  scale: [1, 1.05, 1],
  transition: { repeat: Infinity, duration: 0.7, ease: 'easeInOut' as const },
};

interface FloatingPoint {
  id: number;
  value: number;
  x: number;
  y: number;
}

function FloatingScore({ point }: { point: FloatingPoint }) {
  const xOffset = (Math.random() - 0.5) * 20;
  return (
    <motion.span
      className="pointer-events-none absolute whitespace-nowrap text-base font-bold text-yellow-300 drop-shadow-lg"
      initial={{ opacity: 1, y: 0, x: xOffset, scale: 0.8 }}
      animate={{ opacity: 0, y: -60, x: xOffset + 5, scale: 1.3 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{ left: point.x - 10, top: point.y - 10 }}
    >
      +{point.value}
    </motion.span>
  );
}

function MoanAvatar({
  moanState,
  glowStyle,
  label,
}: {
  moanState: MoanState;
  glowStyle: string;
  label: string;
}) {
  const asset = getMoanAsset(moanState);
  const isEpic = moanState === 'epic';

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-white/30">
        {label}
      </span>
      <motion.div
        className="rounded-full"
        animate={{
          ...(isEpic ? EPIC_PULSE : { scale: 1 }),
          boxShadow: glowStyle,
        }}
        transition={TAP_SPRING}
      >
        <Image
          src={asset}
          alt={`${label} MOAN`}
          width={80}
          height={80}
          className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}

function computeSimpleSignals(energyA: number, energyB: number) {
  const total = energyA + energyB;
  const intensity = Math.min(total / 600, 1);
  const dominance: 'A' | 'B' | null =
    total > 0 ? ((energyA > energyB ? 'A' : energyB > energyA ? 'B' : null)) : null;
  const rawPos = total > 0 ? ((energyB - energyA) / total) * 100 : 0;
  const absPos = Math.abs(rawPos);
  const tension = Math.max(0, (absPos - 30) / 70);

  return { intensity, dominance, tension, barPosition: rawPos, momentum: intensity * 0.5 };
}

export default function PvPBattleRealtime() {
  const {
    phase,
    slot,
    opponent,
    state,
    countdownValue,
    error,
    connect,
    sendTap,
    leave,
  } = usePvPSocket();

  const feedback = useGameFeedback();
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);

  const handleStartPvP = useCallback(() => {
    const playerId = `player_${Date.now()}`;
    const playerName = 'You';
    connect(playerId, playerName);
  }, [connect]);

  const handleCancelQueue = useCallback(() => {
    leave();
  }, [leave]);

  const onPlayerTap = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (phase !== 'battle' || !state) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      sendTap();
      feedback.onPlayerTap();

      const id = Date.now() + Math.random();
      setFloatingPoints((prev) => [...prev.slice(-8), { id, value: 10, x, y }]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== id));
      }, 800);
    },
    [phase, state, sendTap, feedback],
  );

  // ── Phase: idle → entry screen ──
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <motion.h2
          className="text-2xl font-black text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          REAL PvP
        </motion.h2>
        <p className="text-xs text-white/40">Battle a real player online</p>
        <motion.button
          type="button"
          onClick={handleStartPvP}
          className="rounded-2xl bg-purple-600 px-10 py-3.5 text-lg font-bold text-white shadow-lg shadow-purple-600/30 transition-colors hover:bg-purple-500 active:scale-95"
          whileTap={{ scale: 0.95 }}
        >
          FIND MATCH
        </motion.button>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }

  // ── Phase: connecting / queue ──
  if (phase === 'connecting' || phase === 'queue') {
    return <PvPMatchmaking onCancel={handleCancelQueue} />;
  }

  // ── Phase: matched (brief flash) ──
  if (phase === 'matched') {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <motion.div
          className="text-lg font-bold text-purple-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          OPPONENT FOUND
        </motion.div>
        {opponent && (
          <span className="text-sm text-white/60">{opponent.name}</span>
        )}
      </div>
    );
  }

  // ── Phase: countdown ──
  if (phase === 'countdown' && countdownValue !== null) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        {opponent && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">vs {opponent.name}</span>
          </div>
        )}
        <PvPCountdown count={countdownValue} />
      </div>
    );
  }

  // ── Phase: ended ──
  if (phase === 'ended' && state) {
    const isWin = state.winner === slot;
    const label = isWin ? 'YOU WIN' : state.winner === null ? 'DRAW' : 'YOU LOSE';
    const color = isWin ? 'text-purple-400' : 'text-blue-400';

    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <motion.span
          className={`text-4xl font-black ${color}`}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {label}
        </motion.span>

        <div className="flex gap-6 text-sm text-white/50">
          <span>Your energy: {slot === 'A' ? state.energyA : state.energyB}</span>
          <span>Their energy: {slot === 'A' ? state.energyB : state.energyA}</span>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="button"
          onClick={leave}
          className="rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 active:scale-95"
        >
          Back
        </button>
      </div>
    );
  }

  // ── Phase: battle ──
  if (phase !== 'battle' || !state || !slot) return null;

  const myEnergy = slot === 'A' ? state.energyA : state.energyB;
  const oppEnergy = slot === 'A' ? state.energyB : state.energyA;
  const myTaps = slot === 'A' ? state.tapsA : state.tapsB;
  const oppTaps = slot === 'A' ? state.tapsB : state.tapsA;
  const myState = getMoanStateFromEnergy(myEnergy);
  const oppState = getMoanStateFromEnergy(oppEnergy);

  // Normalize bar position: positive = opponent winning, negative = you winning
  const total = state.energyA + state.energyB || 1;
  const rawBar = ((state.energyB - state.energyA) / total) * 100;
  const barPos = slot === 'A' ? rawBar : -rawBar;

  const signals = computeSimpleSignals(myEnergy, oppEnergy);
  const fxShakeTension = signals.tension;

  return (
    <ScreenShake tension={fxShakeTension} momentum={signals.momentum}>
      <div className="relative flex flex-col gap-3 py-3">
        {/* Timer */}
        <div className="text-center">
          <motion.span
            className="text-2xl font-black tabular-nums text-white"
            animate={state.timeRemaining <= 10 ? { color: ['#ffffff', '#ef4444', '#ffffff'] } : {}}
            transition={state.timeRemaining <= 10 ? { repeat: Infinity, duration: 0.8 } : {}}
          >
            {String(Math.floor(state.timeRemaining / 60)).padStart(2, '0')}:
            {String(state.timeRemaining % 60).padStart(2, '0')}
          </motion.span>
        </div>

        {/* Opponent */}
        <div className="flex flex-col items-center gap-2">
          <MoanAvatar
            moanState={oppState}
            glowStyle={OPPONENT_GLOW_MAP[oppState]}
            label={opponent?.name ?? 'OPPONENT'}
          />
          <PowerMeter energy={oppEnergy} maxEnergy={MAX_ENERGY_DISPLAY} player={slot === 'A' ? 'B' : 'A'} />
          <span className="text-[10px] tabular-nums text-white/30">{oppTaps} taps</span>
        </div>

        {/* Beam + Bar */}
        <div className="relative flex flex-col items-center gap-1">
          <EnergyBeam intensity={signals.intensity} dominance={signals.dominance} />
          <ParticleBurst intensity={signals.intensity} momentum={signals.momentum} dominance={signals.dominance} side="A" />
          <ParticleBurst intensity={signals.intensity} momentum={signals.momentum} dominance={signals.dominance} side="B" />
          <div className="w-full px-2">
            <EnergyBar position={barPos} winner={state.winner === slot ? 'A' : state.winner ? 'B' : null} />
          </div>
        </div>

        {/* Player tap zone */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <motion.button
              type="button"
              className="relative rounded-full touch-none focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              animate={{
                ...(myState === 'epic' ? EPIC_PULSE : { scale: 1 }),
                boxShadow: GLOW_MAP[myState],
              }}
              whileTap={{ scale: 0.88 }}
              transition={TAP_SPRING}
              onPointerDown={onPlayerTap}
            >
              <Image
                src={getMoanAsset(myState)}
                alt="Your MOAN"
                width={140}
                height={140}
                className="h-[120px] w-[120px] rounded-full object-cover sm:h-36 sm:w-36"
                draggable={false}
              />
              <AnimatePresence>
                {floatingPoints.map((point) => (
                  <FloatingScore key={point.id} point={point} />
                ))}
              </AnimatePresence>
            </motion.button>
          </div>
          <PowerMeter energy={myEnergy} maxEnergy={MAX_ENERGY_DISPLAY} player={slot} />
          <span className="text-[10px] tabular-nums text-white/30">{myTaps} taps</span>
        </div>
      </div>
    </ScreenShake>
  );
}
