'use client';

import PvPBattleRealtime from '@/components/pvp/PvPBattleRealtime';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import WalletGate from '@/components/layout/WalletGate';
import { colors, gradients, layout, spacing } from '@/styles/design-tokens';

export default function PvPPage() {
  return (
    <WalletGate>
      <div
        className="relative mx-auto flex min-h-dvh w-full flex-col overflow-hidden"
        style={{
          maxWidth: layout.maxWidth,
          background: gradients.surface,
          color: colors.textPrimary,
        }}
      >
        {/* Full-screen background image (underwater scene) */}
        <img
          src="/assets/bg.jpg"
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
        />
        {/* Dark overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${colors.bg}dd 0%, ${colors.bg}99 40%, ${colors.bg}dd 100%)` }}
        />

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
          <AppHeader />
          <PvPBattleRealtime />
        </main>
      </div>

      <BottomNav />
    </WalletGate>
  );
}
