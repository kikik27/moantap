// /components/fx/EnergyBeam.tsx

'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

const BEAM_SPRING = { type: 'spring', stiffness: 200, damping: 25 } as const;

const COLOR_STOPS = {
  A: { inner: '#8B5CF6', outer: '#6D28D9' },
  B: { inner: '#3B82F6', outer: '#1D4ED8' },
  neutral: { inner: '#6B7280', outer: '#374151' },
};

interface EnergyBeamProps {
  intensity: number;
  dominance: 'A' | 'B' | null;
}

function getColors(dominance: 'A' | 'B' | null) {
  if (dominance === 'A') return COLOR_STOPS.A;
  if (dominance === 'B') return COLOR_STOPS.B;
  return COLOR_STOPS.neutral;
}

function EnergyBeam({ intensity, dominance }: EnergyBeamProps) {
  const colors = getColors(dominance);
  const clampedIntensity = Math.max(0, Math.min(1, intensity));

  const beamHeight = 4 + clampedIntensity * 16;
  const glowSpread = clampedIntensity * 24;
  const glowOpacity = 0.2 + clampedIntensity * 0.6;

  // Bend toward dominant side (small translateY offset)
  const bendY = dominance === 'A' ? -clampedIntensity * 4 : dominance === 'B' ? clampedIntensity * 4 : 0;

  const gradientId = 'beam-gradient';
  const flowId = 'beam-flow';

  return (
    <div className="relative flex h-12 w-full items-center justify-center overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 400 48"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLOR_STOPS.A.inner} />
            <stop
              offset={dominance === 'A' ? '70%' : dominance === 'B' ? '30%' : '50%'}
              stopColor={colors.inner}
            />
            <stop offset="100%" stopColor={COLOR_STOPS.B.inner} />
          </linearGradient>

          <linearGradient id={flowId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.inner} stopOpacity="0">
              <animate
                attributeName="offset"
                values="-1;1"
                dur={`${1.5 - clampedIntensity * 0.8}s`}
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor={colors.inner} stopOpacity="0.8">
              <animate
                attributeName="offset"
                values="-0.5;1.5"
                dur={`${1.5 - clampedIntensity * 0.8}s`}
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={colors.inner} stopOpacity="0">
              <animate
                attributeName="offset"
                values="0;2"
                dur={`${1.5 - clampedIntensity * 0.8}s`}
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          <filter id="beam-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation={glowSpread / 4} />
          </filter>
        </defs>

        {/* Glow layer */}
        <motion.rect
          x="0"
          y={24 - beamHeight}
          width="400"
          height={beamHeight * 2}
          fill={`url(#${gradientId})`}
          opacity={glowOpacity}
          filter="url(#beam-blur)"
          animate={{ y: 24 - beamHeight + bendY }}
          transition={BEAM_SPRING}
        />

        {/* Core beam */}
        <motion.rect
          x="0"
          y={24 - beamHeight / 2}
          width="400"
          height={beamHeight}
          rx={beamHeight / 2}
          fill={`url(#${gradientId})`}
          opacity={0.9}
          animate={{ y: 24 - beamHeight / 2 + bendY }}
          transition={BEAM_SPRING}
        />

        {/* Flow overlay */}
        <motion.rect
          x="0"
          y={24 - beamHeight / 2}
          width="400"
          height={beamHeight}
          rx={beamHeight / 2}
          fill={`url(#${flowId})`}
          animate={{ y: 24 - beamHeight / 2 + bendY }}
          transition={BEAM_SPRING}
        />
      </svg>
    </div>
  );
}

export default memo(EnergyBeam);
