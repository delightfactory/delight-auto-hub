import React from 'react';
import { createRoot } from 'react-dom/client';
// BrowserRouter تم نقله إلى App.tsx
import App from './App.tsx';
import './index.css';

// تسجيل Service Worker في وضع الإنتاج
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('تم تسجيل Service Worker بنجاح:', registration.scope);
      })
      .catch(error => {
        console.error('فشل تسجيل Service Worker:', error);
      });
  });
}

// تحسين وقت التحميل الأولي باستخدام requestIdleCallback
const renderApp = () => {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// استخدام requestIdleCallback لتحسين الأداء
if ('requestIdleCallback' in window) {
  // @ts-ignore
  window.requestIdleCallback(renderApp);
} else {
  // للمتصفحات التي لا تدعم requestIdleCallback
  setTimeout(renderApp, 1);
}
