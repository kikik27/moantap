'use client';

import PvPBattleRealtime from '@/components/pvp/PvPBattleRealtime';
import WalletGate from '@/components/layout/WalletGate';

export default function PvPPage() {
  return (
    <WalletGate>
      <main className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <PvPBattleRealtime />
        </div>
      </main>
    </WalletGate>
  );
}
