import type { CapacitorConfig } from "@capacitor/cli";

/**
 * La app nativa no empaqueta un build estático: apunta su WebView a la PWA
 * desplegada (server.url). Así evitamos pelear con `next export` para las rutas
 * de servidor (auth, API de push, etc.) — Capacitor actúa como envoltorio nativo
 * de la misma PWA que corre en el navegador, con acceso a plugins nativos (push,
 * cámara) donde el navegador no llega.
 *
 * En desarrollo, apuntar server.url a http://<tu-ip-local>:3000 y activar
 * cleartext. En producción, debe ser la URL HTTPS de Vercel.
 */
const config: CapacitorConfig = {
  appId: "com.irossini.app",
  appName: "iRossini",
  webDir: "public",
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    cleartext: process.env.NODE_ENV !== "production",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
