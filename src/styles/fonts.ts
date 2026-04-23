const createFontStyle = (family: string, weight: number, size: number, lineHeight: number) => `
  font-family: "${family}";
  font-weight: ${weight};
  font-size: ${size}px;
  line-height: ${lineHeight}%;
  letter-spacing: 0;
`;

const createFontStyleNew = (family: string, weight: number, size: number, lineHeight: number) => `
  font-family: "${family}";
  font-weight: ${weight};
  font-size: ${size}px;
  line-height: ${lineHeight}px;
  letter-spacing: 0;
`;

export const fonts = {
  title1: createFontStyle('Pretendard', 900, 28, 150),
  title2: createFontStyle('Pretendard', 600, 24, 150),
  title3: createFontStyle('Pretendard', 600, 18, 150),
  title4: createFontStyle('Pretendard', 600, 16, 150),
  labelL: createFontStyleNew('Pretendard', 700, 24, 36),
  labelM: createFontStyleNew('Pretendard', 700, 20, 30),
  labelS: createFontStyleNew('Pretendard', 600, 16, 19),
  labelXS: createFontStyleNew('Pretendard', 600, 15, 18),
  body1: createFontStyle('Pretendard', 400, 16, 150),
  body2: createFontStyle('Pretendard', 400, 15, 150),
  body3: createFontStyle('Pretendard', 400, 14, 150),
  caption: createFontStyle('Pretendard', 400, 12, 150),
};

export type FontsType = typeof fonts;
