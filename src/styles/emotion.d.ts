import '@emotion/react';

declare module '@emotion/react' {
  import type { ColorsType } from './colors';
  import type { FontsType } from './fonts';

  export interface Theme {
    colors: ColorsType;
    fonts: FontsType;
  }
}
