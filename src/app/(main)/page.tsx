'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import MoanTap from '@/components/tap/MoanTap';
import { colors, gradients, shadows, spacing } from '@/styles/design-tokens';

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between"
        style={{ paddingTop: spacing.lg, paddingBottom: spacing.md }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/assets/logo-moantap.png"
            alt="MOANTAP"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span
            className="text-lg font-black tracking-tight"
            style={{
              background: gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MOANTAP
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: colors.secondary, boxShadow: shadows.glowBlue }}
          />
          <span
            className="text-[10px] font-semibold tracking-wide"
            style={{ color: colors.textSecondary }}
          >
            Live
          </span>
        </div>
      </header>

      {/* Main tap area */}
      <div
        className="flex flex-1 items-center justify-center"
        style={{ paddingBottom: spacing['2xl'] }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
        >
          <MoanTap />
        </motion.div>
      </div>
    </div>
  );
}
