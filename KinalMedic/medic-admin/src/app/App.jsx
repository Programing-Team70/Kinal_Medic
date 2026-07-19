import { AppRouter } from './router/AppRouter';
import { useEffect, useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../features/auth/store/authStore';
import { UiConfirmHost } from '../features/auth/components/ConfirmModal.jsx';
import { SplashScreen } from '../features/auth/components/SplashScreen.jsx';

export const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  // Se muestra en cada recarga / montaje de la app para que se vea la animación de entrada de Kinal Medic
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <Toaster
        position='top-center'
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: '1rem',
            borderRadius: '8px',
          },
        }}
      />
      <UiConfirmHost />
      <AppRouter />
    </>
  );
};
