// /components/PvPMatchmaking.tsx

'use client';

import { motion } from 'framer-motion';

interface PvPMatchmakingProps {
  onCancel: () => void;
}

function PulseOrb() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {/* Outer rings */}
      <motion.div
        className="absolute h-24 w-24 rounded-full border border-purple-500/30"
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute h-16 w-16 rounded-full border border-purple-400/40"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut', delay: 0.3 }}
      />

      {/* Core */}
      <motion.div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          boxShadow: '0 0 20px 6px rgba(139,92,246,0.4)',
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
      >
        <span className="text-lg font-black text-white">M</span>
      </motion.div>
    </div>
  );
}

export default function PvPMatchmaking({ onCancel }: PvPMatchmakingProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <PulseOrb />

      <div className="flex flex-col items-center gap-2">
        <motion.h2
          className="text-xl font-black text-white"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          Finding opponent...
        </motion.h2>
        <p className="text-xs text-white/30">Waiting for another player</p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl bg-white/5 px-6 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white/70 active:scale-95"
      >
        Cancel
      </button>
    </div>
  );
}
