// /components/layout/FloatingPvPButton.tsx

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { memo } from 'react';
import { colors, gradients, layout, shadows } from '@/styles/design-tokens';

const BUTTON_OFFSET_Y = 18;

function FloatingPvPButton() {
  const size = layout.pvpButtonSize;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center"
      style={{ bottom: layout.navHeight - BUTTON_OFFSET_Y }}
    >
      <Link href="/pvp" className="pointer-events-auto">
        <motion.button
          type="button"
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: size,
            height: size,
            background: gradients.primary,
            boxShadow: shadows.glow,
            marginTop: -BUTTON_OFFSET_Y,
          }}
          animate={{
            boxShadow: [
              shadows.glow,
              `0 0 28px 6px ${colors.glowPurpleSoft}`,
              shadows.glow,
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          whileTap={{ scale: 0.86 }}
        >
          {/* Swords icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
            <path d="M13 19 6 12" />
            <path d="m16 16 4 4" />
            <path d="m19 21 2-2" />
            <path d="m14.5 6.5 3-3" />
            <path d="m20 2 2 2" />
            <path d="m9.5 14.5-7 7" />
            <path d="m3 21 2 2" />
          </svg>

          {/* Outer ring — soft gold accent */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: -5,
              border: `1.5px solid ${colors.goldSoft}40`,
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.12, 0.3] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          />
        </motion.button>
      </Link>
    </div>
  );
}

export default memo(FloatingPvPButton);
