"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // No registrar el SW dentro del WebView de Capacitor: ahí la app ya corre
    // empaquetada/nativa y el service worker no aporta (y puede interferir con
    // el plugin de push nativo, que usa su propio canal).
    const isCapacitorNative = Boolean((window as any).Capacitor?.isNativePlatform?.());
    if (isCapacitorNative) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("No se pudo registrar el service worker", err);
    });
  }, []);

  return null;
}
