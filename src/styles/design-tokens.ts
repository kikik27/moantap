// /styles/design-tokens.ts

export const colors = {
  bg: '#0A0F2C',
  surface: '#121A3A',
  surfaceLight: '#1A2448',
  surfaceHover: '#1E2B52',

  primary: '#6C3BFF',
  primarySoft: '#8A5CFF',
  primaryMuted: '#5A2FD4',

  secondary: '#3BD1FF',
  secondarySoft: '#6FE6FF',

  gold: '#FFC857',
  goldSoft: '#FFD97A',
  goldMuted: '#D4A840',

  textPrimary: '#EAF2FF',
  textSecondary: '#9FB0D0',
  textMuted: '#5A6A8A',

  glowPurple: 'rgba(108, 59, 255, 0.45)',
  glowBlue: 'rgba(59, 209, 255, 0.45)',
  glowGold: 'rgba(255, 200, 87, 0.45)',
  glowPurpleSoft: 'rgba(108, 59, 255, 0.18)',
  glowBlueSoft: 'rgba(59, 209, 255, 0.15)',

  border: 'rgba(234, 242, 255, 0.06)',
  borderActive: 'rgba(108, 59, 255, 0.35)',
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #6C3BFF, #3BD1FF)',
  primarySoft: 'linear-gradient(135deg, #8A5CFF, #6FE6FF)',
  surface: 'linear-gradient(180deg, #121A3A 0%, #0A0F2C 100%)',
  hero: 'radial-gradient(ellipse at 50% 30%, rgba(108,59,255,0.12) 0%, transparent 65%)',
  loadingBg: 'linear-gradient(160deg, #0A0F2C 0%, #1A1040 40%, #0F1A3A 100%)',
  goldShine: 'linear-gradient(135deg, #FFC857, #FFD97A)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  glow: `0 0 20px 4px ${colors.glowPurple}`,
  glowStrong: `0 0 36px 8px ${colors.glowPurple}`,
  glowBlue: `0 0 20px 4px ${colors.glowBlue}`,
  glowGold: `0 0 16px 4px ${colors.glowGold}`,
  elevation: `0 4px 24px rgba(0, 0, 0, 0.5)`,
  nav: `0 -2px 32px rgba(0, 0, 0, 0.7)`,
} as const;

export const layout = {
  maxWidth: 480,
  navHeight: 68,
  pvpButtonSize: 64,
  tapTargetMin: 48,
} as const;
