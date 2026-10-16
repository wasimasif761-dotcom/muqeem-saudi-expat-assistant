import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Explicitly register Service Worker for mobile PWA installability and background caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[Muqeem PWA] New update available');
  },
  onOfflineReady() {
    console.log('[Muqeem PWA] App ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
