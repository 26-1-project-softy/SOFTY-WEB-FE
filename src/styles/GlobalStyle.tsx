import { Global, css } from '@emotion/react';

const globalStyles = css`
  :root {
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
    -webkit-touch-callout: none;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    min-height: 100%;
    background-color: #ffffff;
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

    &:hover {
      outline: none;
    }

    &:focus {
      outline: none;
    }

    &:active {
      outline: none;
    }
  }
`;

export const GlobalStyle = () => {
  return <Global styles={globalStyles} />;
};
