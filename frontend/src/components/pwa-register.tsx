'use client';

import { useEffect } from 'react';

/** Registers the worker independently from the optional Web Push feature. */
export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      // A failed registration should not prevent the finance app from loading.
      console.warn('Não foi possível registrar o service worker.', error);
    });
  }, []);

  return null;
}
