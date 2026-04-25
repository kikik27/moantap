'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar: string;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'ShadowKing', score: 128_450, avatar: '/assets/moan-epic.webp' },
  { rank: 2, name: 'MoanQueen', score: 95_320, avatar: '/assets/moan-charging.webp' },
  { rank: 3, name: 'TapGod', score: 87_200, avatar: '/assets/moan-tapping.webp' },
  { rank: 4, name: 'ParallelMaster', score: 72_100, avatar: '/assets/moan-idle.webp' },
  { rank: 5, name: 'NeonWarrior', score: 65_800, avatar: '/assets/moan-tapping.webp' },
  { rank: 6, name: 'VoidRunner', score: 58_300, avatar: '/assets/moan-idle.webp' },
  { rank: 7, name: 'ComboBreaker', score: 51_600, avatar: '/assets/moan-charging.webp' },
  { rank: 8, name: 'TapMachine', score: 44_900, avatar: '/assets/moan-idle.webp' },
  { rank: 9, name: 'EnergyRush', score: 38_200, avatar: '/assets/moan-tapping.webp' },
  { rank: 10, name: 'QuantumTap', score: 31_500, avatar: '/assets/moan-idle.webp' },
];

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-amber-600',
};

function getRankBadge(rank: number): string {
  return RANK_STYLES[rank] ?? 'text-white/40';
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.04, duration: 0.3 }}
    >
      <span className={`w-6 text-center text-sm font-black ${getRankBadge(entry.rank)}`}>
        {entry.rank}
      </span>

      <Image
        src={entry.avatar}
        alt={entry.name}
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover"
        draggable={false}
      />

      <div className="flex flex-1 flex-col">
        <span className="text-sm font-semibold text-white/80">{entry.name}</span>
      </div>

      <span className="text-sm font-bold tabular-nums text-purple-300">
        {entry.score.toLocaleString()}
      </span>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-6">
      <header className="flex flex-col items-center gap-1">
        <h1 className="text-lg font-black text-white">Leaderboard</h1>
        <p className="text-[10px] tracking-[0.2em] text-white/30">TOP TAPPERS</p>
      </header>

      <div className="flex flex-col gap-2">
        {MOCK_LEADERBOARD.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
      </div>
    </div>
  );
}
