// /components/PvPBattleEnhanced.tsx

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePvPBattle } from '@/hooks/usePvPBattle';
import { useGameFeedback } from '@/hooks/useGameFeedback';
import { getMoanAsset, type MoanState } from '@/lib/tapLogic';
import { computeBattleSignals } from '@/lib/battleLogic';
import EnergyBar from './EnergyBar';
import EnergyBeam from '@/components/fx/EnergyBeam';
import ParticleBurst from '@/components/fx/ParticleBurst';
import PowerMeter from '@/components/fx/PowerMeter';
import ScreenShake from '@/components/fx/ScreenShake';
import PvPCountdown from './PvPCountdown';

const TAP_SPRING = { type: 'spring', stiffness: 400, damping: 17 } as const;

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

const MAX_ENERGY_DISPLAY = 800;

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

function TapBurstRing({ burst }: { burst: number }) {
  if (burst < 0.1) return null;

  const size = 120 + burst * 40;
  const opacity = burst * 0.6;

  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-400"
      animate={{
        width: size,
        height: size,
        opacity,
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    />
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

function ResultOverlay({
  winner,
  onRestart,
}: {
  winner: 'A' | 'B' | null;
  onRestart: () => void;
}) {
  const label = winner === 'A' ? 'YOU WIN' : winner === 'B' ? 'YOU LOSE' : 'DRAW';
  const color =
    winner === 'A'
      ? 'text-purple-400'
      : winner === 'B'
        ? 'text-blue-400'
        : 'text-white';

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        className={`text-4xl font-black ${color}`}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {label}
      </motion.span>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 active:scale-95"
      >
        Play Again
      </button>
    </motion.div>
  );
}

export default function PvPBattleEnhanced() {
  const {
    battle,
    playerTPS,
    opponentTPS,
    tapBurst,
    handleTap,
    isRunning,
    startBattle,
    resetBattle,
  } = usePvPBattle();

  const feedback = useGameFeedback();

  const [showCountdown, setShowCountdown] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const prevEnergyARef = useRef(0);
  const prevEnergyBRef = useRef(0);

  const currentEnergyA = battle.playerA.energy;
  const currentEnergyB = battle.playerB.energy;

  const signals = useMemo(
    () =>
      computeBattleSignals(
        battle,
        playerTPS,
        opponentTPS,
        prevEnergyARef.current,
        prevEnergyBRef.current,
        tapBurst,
      ),
    [battle, playerTPS, opponentTPS, tapBurst],
  );

  prevEnergyARef.current = currentEnergyA;
  prevEnergyBRef.current = currentEnergyB;

  // Feedback: tension + game end
  useEffect(() => {
    if (isRunning) feedback.onTensionChange(signals.tension);
  }, [signals.tension, isRunning, feedback]);

  useEffect(() => {
    if (battle.winner !== null) feedback.onGameEnd(battle.winner);
  }, [battle.winner, feedback]);

  const onPlayerTap = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isRunning || battle.winner !== null) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      handleTap();
      feedback.onPlayerTap();

      const id = Date.now() + Math.random();
      setFloatingPoints((prev) => [...prev.slice(-8), { id, value: 10, x, y }]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== id));
      }, 800);
    },
    [handleTap, isRunning, battle.winner],
  );

  // FX-driving values (tapBurst contributes to shake + particles)
  const fxShakeTension = Math.max(signals.tension, tapBurst > 0.6 ? tapBurst * 0.5 : 0);
  const fxParticleIntensity = Math.max(signals.intensity, tapBurst);
  const fxBeamIntensity = Math.min(signals.intensity + tapBurst * 0.3, 1);

  // Pre-battle screen
  if (!isRunning && battle.winner === null && !showCountdown) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <motion.h2
          className="text-2xl font-black text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          PvP BATTLE
        </motion.h2>
        <p className="text-xs text-white/40">Tap to overpower your opponent</p>
        <motion.button
          type="button"
          onClick={() => {
            feedback.reset();
            setShowCountdown(true);
          }}
          className="rounded-2xl bg-purple-600 px-10 py-3.5 text-lg font-bold text-white shadow-lg shadow-purple-600/30 transition-colors hover:bg-purple-500 active:scale-95"
          whileTap={{ scale: 0.95 }}
        >
          START BATTLE
        </motion.button>
      </div>
    );
  }

  // Countdown phase
  if (showCountdown && !isRunning) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <PvPCountdown
          onComplete={() => {
            startBattle();
            feedback.onBattleStart();
            setShowCountdown(false);
          }}
        />
      </div>
    );
  }

  return (
    <ScreenShake tension={fxShakeTension} momentum={signals.momentum}>
      <div className="relative flex flex-col gap-3 py-3">
        {/* ── Timer ── */}
        <div className="text-center">
          <motion.span
            className="text-2xl font-black tabular-nums text-white"
            animate={
              battle.timeRemaining <= 10
                ? { color: ['#ffffff', '#ef4444', '#ffffff'] }
                : {}
            }
            transition={{
              repeat: battle.timeRemaining <= 10 ? Infinity : 0,
              duration: 0.8,
            }}
          >
            {String(Math.floor(battle.timeRemaining / 60)).padStart(2, '0')}:
            {String(battle.timeRemaining % 60).padStart(2, '0')}
          </motion.span>
        </div>

        {/* ── Opponent (B) ── */}
        <div className="flex flex-col items-center gap-2">
          <MoanAvatar
            moanState={battle.playerB.moanState}
            glowStyle={OPPONENT_GLOW_MAP[battle.playerB.moanState]}
            label="OPPONENT"
          />
          <PowerMeter
            energy={battle.playerB.energy}
            maxEnergy={MAX_ENERGY_DISPLAY}
            player="B"
          />
          <span className="text-[10px] tabular-nums text-white/30">
            {battle.playerB.taps} taps · {opponentTPS} tps
          </span>
        </div>

        {/* ── Beam + Energy Bar (GLOBAL FX) ── */}
        <div className="relative flex flex-col items-center gap-1">
          <EnergyBeam
            intensity={fxBeamIntensity}
            dominance={signals.dominance}
          />

          <ParticleBurst
            intensity={fxParticleIntensity}
            momentum={signals.momentum}
            dominance={signals.dominance}
            side="A"
          />
          <ParticleBurst
            intensity={fxParticleIntensity}
            momentum={signals.momentum}
            dominance={signals.dominance}
            side="B"
          />

          <div className="w-full px-2">
            <EnergyBar
              position={battle.energyBarPosition}
              winner={battle.winner}
            />
          </div>
        </div>

        {/* ── Player (A) — TAP ZONE (LOCAL FX) ── */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {/* Localized burst ring */}
            <TapBurstRing burst={tapBurst} />

            <motion.button
              type="button"
              className="relative rounded-full touch-none focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              animate={{
                ...(battle.playerA.moanState === 'epic'
                  ? EPIC_PULSE
                  : { scale: 1 }),
                boxShadow: GLOW_MAP[battle.playerA.moanState],
              }}
              whileTap={{ scale: 0.88 }}
              transition={TAP_SPRING}
              onPointerDown={onPlayerTap}
            >
              <Image
                src={getMoanAsset(battle.playerA.moanState)}
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

          <PowerMeter
            energy={battle.playerA.energy}
            maxEnergy={MAX_ENERGY_DISPLAY}
            player="A"
          />
          <span className="text-[10px] tabular-nums text-white/30">
            {battle.playerA.taps} taps · {playerTPS} tps
          </span>
        </div>

        {/* ── Dominance Flash (GLOBAL) ── */}
        {signals.dominance === 'A' && signals.intensity > 0.4 && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-purple-500/5"
            animate={{ opacity: [0.03, 0.12, 0.03] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
        {signals.dominance === 'B' && signals.intensity > 0.4 && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-blue-500/5"
            animate={{ opacity: [0.03, 0.12, 0.03] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}

        {/* ── Result ── */}
        {battle.winner !== null && (
          <ResultOverlay winner={battle.winner} onRestart={() => {
            feedback.reset();
            resetBattle();
          }} />
        )}
      </div>
    </ScreenShake>
  );
}
