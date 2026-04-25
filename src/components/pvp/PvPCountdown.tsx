// /components/PvPCountdown.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useGameFeedback } from '@/hooks/useGameFeedback';

const COUNTDOWN_SECONDS = 3;
const TICK_MS = 1000;

// Mode 1: self-managed (mock) — pass onComplete
// Mode 2: server-driven (realtime) — pass count
interface PvPCountdownProps {
  count?: number;
  onComplete?: () => void;
}

const COUNT_COLORS: Record<number, string> = {
  1: 'text-red-400',
  2: 'text-orange-300',
};

function getColor(c: number): string {
  return COUNT_COLORS[c] ?? 'text-white';
}

export default function PvPCountdown({ count: serverCount, onComplete }: PvPCountdownProps) {
  const isServerDriven = serverCount !== undefined;
  const [localCount, setLocalCount] = useState(COUNTDOWN_SECONDS);
  const feedback = useGameFeedback();
  const completedRef = useRef(false);
  const prevCountRef = useRef(COUNTDOWN_SECONDS);

  const displayCount = isServerDriven ? serverCount : localCount;

  // Server-driven mode: play sound on each change
  useEffect(() => {
    if (isServerDriven && serverCount !== prevCountRef.current) {
      feedback.onCountdownTick(serverCount);
      prevCountRef.current = serverCount;
    }
  }, [serverCount, isServerDriven, feedback]);

  // Self-managed mode: auto-countdown
  useEffect(() => {
    if (isServerDriven || completedRef.current) return;

    feedback.onCountdownTick(localCount);
    prevCountRef.current = localCount;

    if (localCount <= 0) {
      completedRef.current = true;
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => setLocalCount((c) => c - 1), TICK_MS);
    return () => clearTimeout(timer);
  }, [localCount, isServerDriven, onComplete, feedback]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={displayCount}
          className="flex flex-col items-center gap-3"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: displayCount === 0 ? 1.3 : 1,
            opacity: 1,
          }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span
            className={`text-7xl font-black ${getColor(displayCount)}`}
            style={{
              textShadow:
                displayCount === 0
                  ? '0 0 30px rgba(250,204,21,0.6), 0 0 60px rgba(250,204,21,0.3)'
                  : '0 0 24px rgba(255,255,255,0.3)',
            }}
          >
            {displayCount === 0 ? 'BATTLE!' : displayCount}
          </span>

          {displayCount > 0 && !isServerDriven && (
            <motion.div
              className="h-[3px] w-12 rounded-full"
              style={{ background: 'linear-gradient(90deg, #6C3BFF, #3BD1FF)' }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: TICK_MS / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
