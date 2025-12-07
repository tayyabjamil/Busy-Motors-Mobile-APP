// Automotive-inspired color palette with depth and character
const Colors = {
  // Primary - Deep automotive blue (distinctive, not generic)
  primary: '#3b58e8',
  primaryLight: '#1A3A5C',
  primaryDark: '#081725',

  // Accent - Warm amber/copper (automotive heritage)
  accent: '#E67E22',
  accentLight: '#F39C12',
  accentDark: '#D35400',

  // Neutrals - Rich grays with warmth
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  lightGray: '#E8ECEF',
  gray: '#95A5A6',
  darkGray: '#2C3E50',
  charcoal: '#1A252F',
  black: '#000000',

  // Semantic colors
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',

  // Text hierarchy
  textPrimary: '#1A252F',
  textSecondary: '#5A6C7D',
  textTertiary: '#95A5A6',
  textLight: '#BDC3C7',

  // Backgrounds
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundDark: '#0F2642',

  // Gradients
  gradientStart: '#0F2642',
  gradientEnd: '#1A3A5C',
  gradientAccentStart: '#E67E22',
  gradientAccentEnd: '#F39C12',

  // Component-specific (maintaining compatibility)
  callButton: '#3498DB',
  whatsappButton: '#25D366',
  textButton: '#E67E22',
  red: '#E74C3C',
  eyeIcon: '#95A5A6',
  backIconColor: '#1A252F',
  footerGray: '#5A6C7D',
  dummyText: '#95A5A6',
  textGray: '#5A6C7D',

  // Shadows & overlays
  shadowLight: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowDark: 'rgba(0, 0, 0, 0.24)',
  overlay: 'rgba(15, 38, 66, 0.7)',
};

// Spacing scale (consistent spacing throughout app)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Shadow presets for elevation
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Border radius scale
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

export default Colors;
