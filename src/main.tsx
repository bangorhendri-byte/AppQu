import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DeviceProvider } from './context/DeviceContext';
import { registerServiceWorkerWithResilience } from './utils/pwaResilience';

// Inisialisasi Service Worker dengan Strategi Stale-While-Revalidate & Proteksi Data IndexedDB
if (typeof window !== 'undefined') {
  registerServiceWorkerWithResilience().then((swState) => {
    if (swState.isRegistered) {
      console.log('[App] PWA Service Worker Aktif dengan Stale-While-Revalidate & Update Resilience.');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <DeviceProvider>
    <App />
  </DeviceProvider>
);

