// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'sonner'; // Bildirimler için (sonner)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <App />
      <Toaster richColors /> {/* Sonner bildirim sistemi aktif */}
    </>
  </StrictMode>,
);
