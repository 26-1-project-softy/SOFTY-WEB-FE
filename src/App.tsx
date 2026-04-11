import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { AppProviders } from '@/providers/AppProviders';
import { router } from '@/router';

const App = () => {
  return (
    <ThemeProvider>
      <GlobalStyle />
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ThemeProvider>
  );
};

export default App;
