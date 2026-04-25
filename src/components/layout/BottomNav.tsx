// /components/layout/BottomNav.tsx

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { colors, gradients, layout, shadows } from '@/styles/design-tokens';

const SAFE_BOTTOM = 'env(safe-area-inset-bottom, 0px)';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    href: '/leaderboard',
    label: 'Rank',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'You',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    ),
  },
];

function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 backdrop-blur-xl"
      style={{
        paddingBottom: SAFE_BOTTOM,
        background: `linear-gradient(180deg, ${colors.surface}ee, ${colors.bg}f8)`,
        borderTop: `1px solid ${colors.border}`,
        boxShadow: shadows.nav,
      }}
    >
      <div
        className="relative mx-auto flex items-start"
        style={{ maxWidth: layout.maxWidth, height: layout.navHeight }}
      >
        {/* Home */}
        <div className="flex flex-1 justify-center pt-3">
          <NavItemButton item={NAV_ITEMS[0]} active={isActive(NAV_ITEMS[0].href)} />
        </div>

        {/* Center spacer for floating PvP */}
        <div style={{ width: layout.pvpButtonSize + 28 }} />

        {/* Rank */}
        <div className="flex flex-1 justify-center pt-3">
          <NavItemButton item={NAV_ITEMS[1]} active={isActive(NAV_ITEMS[1].href)} />
        </div>

        {/* You */}
        <div className="flex flex-1 justify-center pt-3">
          <NavItemButton item={NAV_ITEMS[2]} active={isActive(NAV_ITEMS[2].href)} />
        </div>
      </div>
    </nav>
  );
}

const NavItemButton = memo(function NavItemButton({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className="relative flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-1 transition-colors duration-200"
      style={{ color: active ? colors.primary : colors.textMuted }}
    >
      <motion.div
        animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {item.icon}
      </motion.div>
      <span
        className="text-[10px] font-semibold tracking-wide"
        style={{ color: active ? colors.primarySoft : colors.textMuted }}
      >
        {item.label}
      </span>
      {active && (
        <motion.div
          className="absolute -top-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full"
          style={{ background: gradients?.primary ?? colors.primary }}
          layoutId="nav-dot"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </Link>
  );
});

export default memo(BottomNav);
