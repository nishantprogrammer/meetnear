export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#FFFFFF',
  card: '#F2F2F7',
  text: {
    primary: '#000000',
    secondary: '#8E8E93',
    disabled: '#C7C7CC',
    inverse: '#FFFFFF',
  },
  border: '#C6C6C8',
  notification: '#FF3B30',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  round: 9999,
};

export const animation = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
  },
};

export const zIndex = {
  base: 0,
  card: 1,
  modal: 2,
  overlay: 3,
  tooltip: 4,
};

export const layout = {
  maxWidth: 1200,
  containerPadding: spacing.md,
  headerHeight: 56,
  tabBarHeight: 49,
};

export const breakpoints = {
  small: 320,
  medium: 768,
  large: 1024,
  xlarge: 1440,
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animation,
  zIndex,
  layout,
  breakpoints,
};
