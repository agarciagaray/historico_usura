import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getThemeFromStorage, storageAvailable } from './utils/storage';

// Inicializar tema de forma segura: por defecto 'dark', pero respetar valor en storage si está disponible
try {
  const stored = getThemeFromStorage();
  const useDark = stored ? stored === 'dark' : true;
  if (useDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
} catch (e) {
  // noop
}

// Evitar referenciar storage si no está disponible (algunas extensiones/iframes bloquean el acceso)
if (!storageAvailable()) {
  // opcional: podríamos mostrar un aviso, por ahora no escribimos en storage
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
