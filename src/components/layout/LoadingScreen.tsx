// /components/layout/LoadingScreen.tsx

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { colors, gradients, shadows } from '@/styles/design-tokens';

const LOAD_DURATION_MS = 2200;

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), LOAD_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: gradients.loadingBg }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background glow layers */}
      <motion.div
        className="absolute h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${colors.glowPurple}, transparent 70%)` }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute h-40 w-40 rounded-full"
        style={{ background: `radial-gradient(circle, ${colors.glowBlueSoft}, transparent 70%)` }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.4 }}
      />

      {/* Logo */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex items-center justify-center"
          style={{
            width: 120,
            height: 120,
          }}
        >
          <Image
            src="/assets/logo-moantap.png"
            alt="MOANTAP"
            width={160}
            height={160}
            className="h-[160px] w-[160px] object-contain"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Brand text */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <motion.p
          className="text-[10px] font-medium tracking-[0.3em]"
          style={{ color: colors.textMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.5] }}
          transition={{ delay: 0.8, duration: 1.4 }}
        >
          TAP · PARALLEL · MANTAP
        </motion.p>
      </motion.div>

      {/* Loading bar */}
      <motion.div
        className="relative z-10 mt-8 h-[3px] w-28 overflow-hidden rounded-full"
        style={{ background: `${colors.textMuted}20` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: gradients.primary }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.3, duration: LOAD_DURATION_MS / 1000 - 0.3, ease: 'easeOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
