'use client';

import PvPBattleRealtime from '@/components/pvp/PvPBattleRealtime';

export default function PvPPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <PvPBattleRealtime />
      </div>
    </main>
  );
}
