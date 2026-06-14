export const theme = {
  colors: {
    background: '#141312', // Matte Black
    surface: '#141312',
    primary: '#F5F5DC', // Warm Beige
    secondary: '#E6E6FA', // Soft Lavender
    tertiary: '#D8A7B1', // Dusty Pink
    onSurface: '#E5E2DF',
    onSurfaceVariant: '#C8C7BC',
    outline: '#929187',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily: 'Hanken Grotesk',
    displayLg: {
      fontSize: 40,
      fontWeight: '600' as const,
      letterSpacing: -0.8,
    },
    headlineLg: {
      fontSize: 32,
      fontWeight: '600' as const,
      letterSpacing: -0.32,
    },
    titleMd: {
      fontSize: 20,
      fontWeight: '500' as const,
    },
    bodyLg: {
      fontSize: 17,
      fontWeight: '400' as const,
    },
    labelCaps: {
      fontSize: 12,
      fontWeight: '700' as const,
      letterSpacing: 0.6,
      textTransform: 'uppercase' as const,
    },
  },
  roundness: {
    sm: 4,
    default: 8,
    md: 12,
    lg: 16,
    xl: 28, // Signature radius
    full: 9999,
  },
  spacing: {
    unit: 4,
    containerPadding: 20,
    gutter: 16,
    sectionMargin: 48,
  },
};
