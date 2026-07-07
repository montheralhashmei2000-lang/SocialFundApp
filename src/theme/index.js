// src/theme/index.js
export const COLORS = {
  primary:     '#1B5E20',
  primaryMid:  '#2E7D32',
  primaryLight:'#388E3C',
  primaryDark: '#003300',
  gold:        '#F9A825',
  goldLight:   '#FDD835',
  goldDark:    '#BF6000',
  ok:          '#2E7D32',
  warn:        '#E65100',
  err:         '#B71C1C',
  info:        '#0D47A1',
  white:       '#FFFFFF',
  black:       '#000000',
};

export const LIGHT = {
  ...COLORS,
  bg:     '#EBF3EC',
  card:   '#FFFFFF',
  surf:   '#F5FAF6',
  tx:     '#0D1B0F',
  sub:    '#4A5E4D',
  mu:     '#8A9E8C',
  border: '#CDE0CF',
  dark: false,
};

export const DARK = {
  ...COLORS,
  bg:     '#0D1A0E',
  card:   '#1A2E1C',
  surf:   '#223024',
  tx:     '#E8F5E9',
  sub:    '#9EC4A0',
  mu:     '#6A8E6D',
  border: '#2D4A2F',
  dark: true,
};

export const FONTS = {
  regular: 'System',
  bold:    'System',
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const SHADOW = {
  light: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
  },
};
