// /components/fx/ScreenShake.tsx

'use client';

import { memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';

const SHAKE_SPRING = { type: 'spring', stiffness: 500, damping: 30 } as const;

const SHAKE_PRESETS = {
  subtle: { x: 1, y: 1 },
  medium: { x: 3, y: 2 },
  intense: { x: 6, y: 4 },
} as const;

interface ScreenShakeProps {
  tension: number;
  momentum: number;
  children: ReactNode;
}

function getShakeIntensity(tension: number, momentum: number) {
  const combined = tension * 0.7 + momentum * 0.3;
  if (combined < 0.3) return null;
  if (combined < 0.6) return SHAKE_PRESETS.subtle;
  if (combined < 0.8) return SHAKE_PRESETS.medium;
  return SHAKE_PRESETS.intense;
}

function ScreenShake({ tension, momentum, children }: ScreenShakeProps) {
  const shake = getShakeIntensity(tension, momentum);

  if (!shake) return <>{children}</>;

  return (
    <motion.div
      animate={{
        x: [0, -shake.x, shake.x, -shake.x * 0.5, shake.x * 0.5, 0],
        y: [0, shake.y, -shake.y, shake.y * 0.5, -shake.y * 0.5, 0],
      }}
      transition={{
        duration: 0.4 + tension * 0.3,
        repeat: Infinity,
        repeatDelay: 0.8 - tension * 0.4,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export default memo(ScreenShake);
