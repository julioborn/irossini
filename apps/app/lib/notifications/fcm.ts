import { PushNotifications } from "@capacitor/push-notifications";

/** Implementación de push para cuando la app corre empaquetada con Capacitor (FCM nativo). */
export async function suscribirFcm(): Promise<void> {
  const permiso = await PushNotifications.requestPermissions();
  if (permiso.receive !== "granted") {
    throw new Error("Permiso de notificaciones denegado");
  }

  await new Promise<void>((resolve, reject) => {
    PushNotifications.addListener("registration", async (token) => {
      try {
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ canal: "fcm", fcmToken: token.value }),
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    PushNotifications.addListener("registrationError", (err) => {
      reject(new Error(err.error));
    });

    PushNotifications.register();
  });
}
