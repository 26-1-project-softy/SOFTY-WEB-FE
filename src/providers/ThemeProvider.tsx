import type { PropsWithChildren } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
};
