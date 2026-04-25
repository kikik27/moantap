'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useUser } from '@/contexts/UserContext'
import { colors } from '@/styles/design-tokens'
import { type ReactNode, useEffect, useState } from 'react'

export default function WalletGate({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount()
  const { user, isLoading } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Before hydration, never block — avoids SSR flash
  const showGate = mounted && (!isConnected || isLoading || !user)

  return (
    <>
      <AnimatePresence>
        {showGate && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{ background: colors.bg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/assets/logo-moantap.png"
              alt="MOANTAP"
              width={120}
              height={120}
              className="h-[120px] w-[120px] object-contain"
              priority
            />

            <div className="mt-8 flex flex-col items-center gap-2">
              <h1
                className="text-xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                Welcome to MOANTAP
              </h1>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Connect your wallet to start tapping
              </p>
            </div>

            <div className="mt-10">
              <ConnectButton />
            </div>

            {isConnected && isLoading && (
              <p className="mt-4 text-xs" style={{ color: colors.textMuted }}>
                Setting up your identity...
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ visibility: showGate ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  )
}
