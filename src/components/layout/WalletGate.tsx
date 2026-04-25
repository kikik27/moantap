'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useUser } from '@/contexts/UserContext'
import { colors, gradients, shadows } from '@/styles/design-tokens'
import type { ReactNode } from 'react'

export default function WalletGate({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount()
  const { user, isLoading } = useUser()

  const showGate = !isConnected || isLoading || !user

  return (
    <>
      <AnimatePresence>
        {showGate && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{ background: gradients.loadingBg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Glow layers */}
            <motion.div
              className="absolute h-56 w-56 rounded-full"
              style={{ background: `radial-gradient(circle, ${colors.glowPurple}, transparent 70%)` }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.55, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            />

            {/* Logo */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="flex items-center justify-center"
                style={{ width: 120, height: 120 }}
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

            {/* Title */}
            <motion.h1
              className="relative z-10 mt-6 text-2xl font-bold"
              style={{ color: colors.textPrimary }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome to MOANTAP
            </motion.h1>

            <motion.p
              className="relative z-10 mt-2 text-sm"
              style={{ color: colors.textMuted }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Connect your wallet to start tapping!
            </motion.p>

            {/* Connect button */}
            <motion.div
              className="relative z-10 mt-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <ConnectButton />
            </motion.div>

            {/* Registering state */}
            {isConnected && isLoading && (
              <motion.p
                className="relative z-10 mt-6 text-sm"
                style={{ color: colors.secondarySoft }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Setting up your identity...
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always render children so they don't remount */}
      <div style={{ visibility: showGate ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  )
}
