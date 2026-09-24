"use client";

import { Capacitor } from "@capacitor/core";

/**
 * Interfaz única de notificaciones. El backend guarda las suscripciones de
 * ambos canales bajo el mismo socio y les manda la misma notificación lógica
 * sin importar por dónde llegó (ver packages/core/src/notifications/enviar.ts).
 *
 * Acá solo se decide, en runtime, CÓMO suscribirse: Web Push si estamos en el
 * navegador (PWA), FCM nativo si estamos dentro del WebView de Capacitor.
 */
export async function suscribirNotificaciones(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { suscribirFcm } = await import("./fcm");
    return suscribirFcm();
  }

  const { suscribirWebPush } = await import("./webpush");
  return suscribirWebPush();
}
