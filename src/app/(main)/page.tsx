'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import MoanTap from '@/components/tap/MoanTap';
import { useUser } from '@/contexts/UserContext';
import { useTapGame } from '@/hooks/useTapGame';
import { colors, gradients, shadows, spacing } from '@/styles/design-tokens';

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header
        className="flex items-center justify-between"
        style={{ paddingTop: spacing.md, paddingBottom: spacing.sm }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/assets/logo-moantap.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
            priority
          />
          <span className="text-xs font-bold tracking-tight" style={{ color: colors.textSecondary }}>
            MOANTAP
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-6 w-6 overflow-hidden rounded-full"
            style={{ background: gradients.primary }}
          >
            <Image
              src="/assets/moan/idle.png"
              alt=""
              width={24}
              height={24}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-[10px] font-medium max-w-[80px] truncate" style={{ color: colors.textMuted }}>
            {user?.username}
          </span>
        </div>
      </header>

      {/* Coin balance */}
      <CoinBalance />

      {/* Tap area */}
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 2 }}
        >
          <MoanTap />
        </motion.div>
      </div>

      {/* Bottom section: Energy + PvP + Daily card */}
      <div className="flex flex-col gap-2.5 pb-2">
        <EnergyBar />
        <PvPButton />
        {/* <DailyCard /> */}
      </div>
    </div>
  );
}

function CoinBalance() {
  const { score } = useTapGame();

  return (
    <div className="flex items-center justify-center gap-2.5 py-2">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: gradients.goldShine }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12" />
          <path d="M15 9.5c0-1.38-1.12-2.5-3-2.5H10v5h2c1.88 0 3-1.12 3-2.5Z" />
        </svg>
      </div>
      <span className="text-2xl font-bold tabular-nums" style={{ color: colors.textPrimary }}>
        {score.toLocaleString()}
      </span>
    </div>
  );
}

function EnergyBar() {
  const { energy, maxEnergy, multiplier, hasEnergy, setOnEnergyRegen } = useTapGame();
  const pct = (energy / maxEnergy) * 100;
  const [regenFloat, setRegenFloat] = useState<{ id: number; amount: number } | null>(null);

  useEffect(() => {
    setOnEnergyRegen((amount) => {
      setRegenFloat({ id: Date.now(), amount });
      setTimeout(() => setRegenFloat(null), 1500);
    });
  }, [setOnEnergyRegen]);

  return (
    <div
      className="relative flex items-center gap-3 rounded-2xl px-4 py-2.5"
      style={{ background: `${colors.surfaceLight}` }}
    >
      <AnimatePresence>
        {regenFloat && (
          <motion.span
            key={regenFloat.id}
            className="pointer-events-none absolute right-4 top-0 text-xs font-bold"
            style={{ color: colors.gold }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            +{regenFloat.amount}
          </motion.span>
        )}
      </AnimatePresence>

      <svg width="16" height="16" viewBox="0 0 24 24" fill={hasEnergy ? colors.gold : colors.textMuted} stroke={hasEnergy ? colors.gold : colors.textMuted} strokeWidth="1.5">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase" style={{ color: colors.textMuted }}>Energy</span>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: colors.textSecondary }}>
            {energy.toLocaleString()}/{maxEnergy.toLocaleString()}
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full"
          style={{ background: `${colors.border}` }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: pct > 80 ? gradients.goldShine : gradients.primary,
              boxShadow: pct > 80 ? `0 0 8px ${colors.glowGold}` : 'none',
            }}
          />
        </div>
      </div>

      <div
        className="rounded-lg px-2 py-0.5 text-[11px] font-bold"
        style={{
          background: `${colors.primary}20`,
          color: colors.primarySoft,
        }}
      >
        {multiplier}x
      </div>
    </div>
  );
}

function DailyCard() {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}15, ${colors.surfaceLight})`,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: gradients.goldShine }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>Daily Reward</span>
        <span className="text-[10px]" style={{ color: colors.textMuted }}>Tap to claim your daily bonus</span>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  );
}

function PvPButton() {
  return (
    <Link href="/pvp" className="block">
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform"
        style={{
          background: gradients.primary,
          boxShadow: shadows.glow,
        }}
      >
        {/* Swords icon */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
            <path d="M13 19 6 12" />
            <path d="m16 16 4 4" />
            <path d="m19 21 2-2" />
            <path d="m14.5 6.5 3-3" />
            <path d="m20 2 2 2" />
            <path d="m9.5 14.5-7 7" />
            <path d="m3 21 2 2" />
          </svg>
        </div>

        <div className="flex flex-1 flex-col">
          <span className="text-sm font-bold text-white">Battle PvP</span>
          <span className="text-[10px] text-white/60">Challenge other players in real-time</span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-[10px] font-medium text-white/70">Live</span>
        </div>
      </div>
    </Link>
  );
}
