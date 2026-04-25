'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { memo, type ReactNode } from 'react';
import { colors, gradients, layout, spacing } from '@/styles/design-tokens';
import BottomNav from './BottomNav';
import LoadingScreen from './LoadingScreen';
import WalletGate from './WalletGate';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <LoadingScreen />

      <WalletGate>
        <div
          className="relative mx-auto flex min-h-dvh w-full flex-col"
          style={{
            maxWidth: layout.maxWidth,
            background: gradients.surface,
            color: colors.textPrimary,
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-64"
            style={{ background: gradients.hero }}
          />

          <main
            className="relative z-10 flex flex-1 flex-col"
            style={{
              paddingLeft: spacing.base,
              paddingRight: spacing.base,
              paddingBottom: 76 + spacing.base,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key="app-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.8 }}
                className="flex flex-1 flex-col"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <BottomNav />
      </WalletGate>
    </>
  );
}

export default memo(AppLayout);
