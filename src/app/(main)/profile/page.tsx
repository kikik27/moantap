'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const STATS = [
  { label: 'Total Score', value: '24,580' },
  { label: 'Wins', value: '12' },
  { label: 'Losses', value: '3' },
  { label: 'Win Rate', value: '80%' },
  { label: 'Best Combo', value: '47' },
  { label: 'Total Taps', value: '8,420' },
] as const;

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.03] px-3 py-3">
      <span className="text-xs font-bold text-purple-300">{value}</span>
      <span className="text-[10px] text-white/30">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 py-8">
      {/* Avatar */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
            boxShadow: '0 0 24px 6px rgba(139,92,246,0.3)',
          }}
        >
          <Image
            src="/assets/moan-epic.webp"
            alt="Your avatar"
            width={88}
            height={88}
            className="h-[88px] w-[88px] rounded-full object-cover"
            draggable={false}
          />
        </div>
      </motion.div>

      {/* Name + Level */}
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-xl font-black text-white">MoanLord</h2>
        <span className="rounded-full bg-purple-500/20 px-3 py-0.5 text-[10px] font-semibold text-purple-300">
          LVL 7
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid w-full grid-cols-3 gap-2">
        {STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* Wallet connect */}
      <button
        type="button"
        className="mt-2 w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
        }}
      >
        Connect Wallet
      </button>
    </div>
  );
}
