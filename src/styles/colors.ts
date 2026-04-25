export const colors = {
  brand: {
    primary: '#55B5A6',
    dark: '#35746E',
  },
  kakao: {
    primary: '#FEE500',
    active: '#F6D500',
  },
  text: {
    text1: '#000000',
    text2: '#333333',
    text3: '#666666',
    text4: '#808080',
    text5: '#E6E6E6',
    textW: '#FFFFFF',
  },
  background: {
    bg1: '#FFFFFF',
    bg2: '#F6F8F7',
    bg3: '#F2F2F2',
    bg4: '#F2FDFA',
    bg5: '#E6E6E6',
    bg6: '#808080',
    brandHover: '#32A6A1',
  },
  border: {
    border1: '#E6E6E6',
    border2: '#CCCCCC',
  },
  divider: {
    divider1: '#F2F2F2',
    divider2: '#CCCCCC',
  },
  semantic: {
    success: '#00A63E',
    successSoft: '#DCFCE7',
    warning: '#DC9136',
    warningSoft: '#FEFBEC',
    error: '#FF2C3D',
    errorSoft: '#FAE3E2',
  },
  intent: {
    absenceLate: {
      text: '#BA420D',
      background: '#FCEDD7',
      border: '#E5AE65',
    },
    counseling: {
      text: '#2346DD',
      background: '#DEEAFC',
      border: '#6398E9',
    },
    request: {
      text: '#7A35F0',
      background: '#FAF5FF',
      border: '#8B5CF6',
    },
    inquiry: {
      text: '#7711D2',
      background: '#F1E8FD',
      border: '#AB79EE',
    },
  },
  threadStatus: {
    processing: {
      text: '#35746E',
      background: '#D5FAF1',
      border: '#84D0BD',
    },
    completed: {
      text: '#4A5567',
      background: '#F2F5F9',
      border: '#ADB5C1',
    },
  },
  neutral: {
    neutral1100: '#000000',
    neutral1000: '#1D1D1D',
    neutral900: '#333333',
    neutral800: '#4D4D4D',
    neutral700: '#666666',
    neutral600: '#808080',
    neutral500: '#999999',
    neutral400: '#B2B2B2',
    neutral300: '#CCCCCC',
    neutral200: '#E6E6E6',
    neutral100: '#F2F2F2',
    neutral50: '#F7F7F7',
    neutral0: '#FFFFFF',
  },
} as const;

export type ColorsType = typeof colors;
