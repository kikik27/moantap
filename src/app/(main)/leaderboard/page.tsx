'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { colors } from '@/styles/design-tokens';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

interface LeaderboardEntry {
  rank: number;
  username: string;
  wallet_address: string;
  total_score: number;
  wins: number;
  losses: number;
}

const AVATAR_BY_RANK: Record<number, string> = {
  1: '/assets/moan/epic.png',
  2: '/assets/moan/charging.png',
  3: '/assets/moan/tapping.png',
}
const DEFAULT_AVATAR = '/assets/moan/idle.png';
const TOP3_COLORS = ['#fbbf24', '#94a3b8', '#d97706'];

export default function LeaderboardPage() {
  const { user } = useUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data: LeaderboardEntry[]) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setIsLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="flex flex-1 flex-col gap-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold" style={{ color: colors.textPrimary }}>Rank PvP</h1>
        <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: colors.textMuted }}>
          Leaderboard
        </span>
      </div>

      {isLoading && (
        <p className="text-center text-xs" style={{ color: colors.textMuted }}>Loading...</p>
      )}

      {!isLoading && entries.length === 0 && (
        <p className="text-center text-xs" style={{ color: colors.textMuted }}>No players yet.</p>
      )}

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 pb-1">
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
            const heights = [64, 84, 56];
            const isChamp = i === 1;
            const color = TOP3_COLORS[entry.rank - 1];
            const avatar = AVATAR_BY_RANK[entry.rank] ?? DEFAULT_AVATAR;
            return (
              <motion.div
                key={entry.rank}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <div className="relative">
                  <Image
                    src={avatar}
                    alt={entry.username}
                    width={isChamp ? 48 : 36}
                    height={isChamp ? 48 : 36}
                    className="rounded-full object-cover"
                    style={{ width: isChamp ? 48 : 36, height: isChamp ? 48 : 36, border: `2px solid ${color}` }}
                    draggable={false}
                  />
                  <span
                    className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
                    style={{ background: color, color: '#000' }}
                  >
                    {entry.rank}
                  </span>
                </div>
                <span className="text-[10px] font-semibold max-w-[56px] truncate" style={{ color: colors.textSecondary }}>
                  {entry.username}
                </span>
                <span className="text-[9px] font-bold tabular-nums" style={{ color }}>
                  {entry.total_score.toLocaleString()}
                </span>
                <div
                  className="w-14 rounded-t-lg"
                  style={{ height: heights[i], background: `${color}0c`, borderTop: `2px solid ${color}40` }}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rest of leaderboard */}
      <div className="flex flex-col gap-1 mt-1">
        {rest.map((entry, i) => {
          const isMe = user?.username === entry.username;
          return (
            <motion.div
              key={entry.rank}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
              style={{
                background: isMe ? `${colors.primary}12` : 'transparent',
                border: isMe ? `1px solid ${colors.primary}30` : 'none',
                boxShadow: isMe ? `0 0 12px ${colors.glowPurpleSoft}` : 'none',
              }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 3) * 0.03, duration: 0.2 }}
            >
              <span className="w-5 text-center text-xs font-bold tabular-nums" style={{ color: colors.textMuted }}>
                {entry.rank}
              </span>
              <Image
                src={DEFAULT_AVATAR}
                alt={entry.username}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
                draggable={false}
              />
              <span className="flex-1 text-sm font-medium" style={{ color: colors.textPrimary }}>
                {entry.username}
                {isMe && (
                  <span className="ml-1.5 text-[9px] font-semibold" style={{ color: colors.primarySoft }}>
                    (you)
                  </span>
                )}
              </span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: colors.textSecondary }}>
                {entry.total_score.toLocaleString()}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
