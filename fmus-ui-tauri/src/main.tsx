import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { HttpPage } from './pages/HttpPage';
import { GraphQLPage } from './pages/GraphQLPage';
import { WebSocketPage } from './pages/WebSocketPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { SettingsPage } from './pages/SettingsPage';

// Komentar: Theme configuration
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
});

// Komentar: Aplikasi utama
function App() {
  // Komentar: Deteksi preferensi sistem
  const preferredColorScheme = useColorScheme();

  // Komentar: State untuk light/dark mode
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: 'mantine-color-scheme',
    defaultValue: preferredColorScheme,
  });

  // Komentar: Toggle light/dark mode
  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme={colorScheme as 'light' | 'dark' | 'auto'}
    >
      <Notifications position="top-right" />
      <BrowserRouter>
        <Layout colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/http" element={<HttpPage />} />
            <Route path="/graphql" element={<GraphQLPage />} />
            <Route path="/websocket" element={<WebSocketPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </MantineProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
