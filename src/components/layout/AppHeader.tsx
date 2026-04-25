'use client';

import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { colors, gradients, spacing } from '@/styles/design-tokens';
import { memo } from 'react';

function AppHeader() {
  const { user } = useUser();

  return (
    <header
      className="flex items-center justify-between"
      style={{ paddingTop: spacing.md, paddingBottom: spacing.sm }}
    >
      <div className="flex items-center gap-2">
        <Image
          src="/assets/logo-moantap.png"
          alt=""
          width={32}
          height={32}
          className="h-7 w-7 object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full"
          style={{ background: gradients.primary }}
        >
          <Image
            src="/assets/moan/idle.png"
            alt=""
            width={28}
            height={28}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-[11px] font-semibold max-w-[90px] truncate" style={{ color: colors.textSecondary }}>
          {user?.username ?? '...'}
        </span>
      </div>
    </header>
  );
}

export default memo(AppHeader);
