import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import i18n from './i18n';
import router from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <HeroUIProvider>
          <NotificationProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </NotificationProvider>
        </HeroUIProvider>
      </ThemeProvider>
    </I18nextProvider>
  </React.StrictMode>
);