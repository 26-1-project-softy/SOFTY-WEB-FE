import { Global, css } from '@emotion/react';
import { colors } from './colors';

const globalStyles = css`
  html {
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scrollbar-width: thin;
    scrollbar-color: ${colors.neutral.neutral400} transparent;
  }

  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  html::-webkit-scrollbar-track,
  body::-webkit-scrollbar-track,
  *::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 999px;
  }

  html::-webkit-scrollbar-thumb,
  body::-webkit-scrollbar-thumb,
  *::-webkit-scrollbar-thumb {
    background: ${colors.neutral.neutral400};
    border-radius: 999px;
  }

  html::-webkit-scrollbar-thumb:hover,
  body::-webkit-scrollbar-thumb:hover,
  *::-webkit-scrollbar-thumb:hover {
    background: ${colors.neutral.neutral600};
  }

  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    margin: 0;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    min-height: 100%;
    overflow: hidden;
    background-color: ${colors.background.bg1};
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    outline: none;

    &:hover,
    &:focus,
    &:active {
      outline: none;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }
`;

export const GlobalStyle = () => {
  return <Global styles={globalStyles} />;
};
