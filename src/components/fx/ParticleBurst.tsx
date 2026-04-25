// /components/fx/ParticleBurst.tsx

'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const MAX_PARTICLES = 18;
const PARTICLE_SIZE_RANGE = { min: 3, max: 8 } as const;
const SPREAD_X = 120;
const SPREAD_Y = 60;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface ParticleBurstProps {
  intensity: number;
  momentum: number;
  dominance: 'A' | 'B' | null;
  side: 'A' | 'B';
}

function generateParticles(
  intensity: number,
  momentum: number,
  dominance: 'A' | 'B' | null,
  side: 'A' | 'B',
): Particle[] {
  const count = Math.floor(3 + intensity * MAX_PARTICLES);
  const particles: Particle[] = [];

  const isActive = dominance === side;
  const colorA = '#8B5CF6';
  const colorB = '#3B82F6';
  const color = side === 'A' ? colorA : colorB;

  for (let i = 0; i < count; i++) {
    const size =
      PARTICLE_SIZE_RANGE.min +
      Math.random() * (PARTICLE_SIZE_RANGE.max - PARTICLE_SIZE_RANGE.min);

    // Particles flow toward opponent when dominant
    const directionX = isActive ? (side === 'A' ? 1 : -1) : (side === 'A' ? -1 : 1);
    const velocityBoost = isActive ? momentum * 0.6 : 0;

    particles.push({
      id: i,
      x: directionX * (30 + Math.random() * SPREAD_X) * (0.5 + velocityBoost),
      y: (Math.random() - 0.5) * SPREAD_Y * (1 + momentum * 0.5),
      size,
      duration: 0.6 + Math.random() * 0.8,
      delay: Math.random() * (1.2 - intensity * 0.6),
      color,
    });
  }

  return particles;
}

function ParticleBurst({ intensity, momentum, dominance, side }: ParticleBurstProps) {
  const particles = useMemo(
    () => generateParticles(intensity, momentum, dominance, side),
    [intensity, momentum, dominance, side],
  );

  if (intensity < 0.1) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            left: side === 'A' ? '60%' : '40%',
            top: '50%',
            boxShadow: `0 0 ${p.size * 2}px ${p.color}40`,
          }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export default memo(ParticleBurst);
