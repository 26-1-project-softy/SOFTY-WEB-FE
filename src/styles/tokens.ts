export const tokens = {
  breakpoint: {
    tablet: '1280px',
    mobile: '900px',
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '24px',
  },
  size: {
    controlHeight: '42px',
    iconSm: '14px',
    dateTile: '36px',
    navButtonMinWidth: '32px',
    navHeight: '40px',
    headerHeight: '72px',
    stateHeightOffset: '220px',
    pageIcon: '24px',
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '16px',
  },
} as const;

export type TokensType = typeof tokens;
