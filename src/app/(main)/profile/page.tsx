'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { useAccount } from 'wagmi';
import { colors, gradients } from '@/styles/design-tokens';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

export default function ProfilePage() {
  const { user } = useUser();
  const { address } = useAccount();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  // Mock level progress
  const level = 7;
  const xp = 340;
  const xpMax = 500;

  return (
    <div className="flex flex-1 flex-col gap-4 py-6">
      {/* Profile card */}
      <motion.div
        className="flex flex-col items-center gap-3 rounded-2xl py-6"
        style={{ background: `${colors.surfaceLight}`, border: `1px solid ${colors.border}` }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 2 }}
      >
        <div className="relative">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: gradients.primary }}
          >
            <Image
              src="/assets/moan/epic.png"
              alt=""
              width={72}
              height={72}
              className="h-[72px] w-[72px] rounded-full object-cover"
              draggable={false}
            />
          </div>
          <div
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: gradients.goldShine, color: '#000' }}
          >
            {level}
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
            {user?.username ?? '...'}
          </h2>
          <span className="text-[11px] font-mono" style={{ color: colors.textMuted }}>
            {shortAddress}
          </span>
        </div>

        {/* XP progress bar */}
        <div className="w-48 flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-[9px] font-semibold uppercase" style={{ color: colors.textMuted }}>Level {level}</span>
            <span className="text-[9px] font-semibold tabular-nums" style={{ color: colors.textSecondary }}>{xp}/{xpMax} XP</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full"
            style={{ background: `${colors.border}` }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(xp / xpMax) * 100}%`,
                background: gradients.primary,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatBlock label="Best Score" value={user?.bestScore != null ? fmt(user.bestScore) : '0'} icon="coin" />
        <StatBlock label="Total Taps" value={user?.totalTaps != null ? fmt(user.totalTaps) : '0'} icon="tap" />
        <StatBlock label="PvP Rank" value="--" icon="rank" />
        <StatBlock label="Win Rate" value="--" icon="trophy" />
      </div>
    </div>
  );
}

function StatBlock({ label, value, icon }: { label: string; value: string; icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    coin: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12" />
        <path d="M15 9.5c0-1.38-1.12-2.5-3-2.5H10v5h2c1.88 0 3-1.12 3-2.5Z" />
      </svg>
    ),
    tap: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.primarySoft} strokeWidth="2">
        <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
        <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    ),
    rank: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.secondarySoft} strokeWidth="2">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
    trophy: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="2">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  };

  return (
    <div
      className="flex items-center gap-2.5 rounded-2xl px-3.5 py-3"
      style={{ background: `${colors.surfaceLight}`, border: `1px solid ${colors.border}` }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${colors.border}` }}
      >
        {icons[icon]}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>
          {value}
        </span>
        <span className="text-[9px] font-medium" style={{ color: colors.textMuted }}>
          {label}
        </span>
      </div>
    </div>
  );
}
