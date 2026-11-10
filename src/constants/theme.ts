export const colors = {
  background: '#F7F7FC', surface: '#FFFFFF', ink: '#101C37',
  muted: '#667084', soft: '#EBEEFC', primary: '#006D33',
  primaryDeep: '#005326', primarySoft: '#DDF8E4',
  violetSoft: '#EAEDFF', border: '#E9EAF4', red: '#C93A3A',
  accent: '#2D72FF', green: '#22A35A',
} as const;
export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;
export const radii = { sm: 10, md: 14, lg: 18, xl: 24 } as const;
export const shadow = {
  shadowColor: '#22263B', shadowOffset: { width: 0, height: 3 },
  shadowRadius: 10, shadowOpacity: 0.055, elevation: 2,
} as const;
