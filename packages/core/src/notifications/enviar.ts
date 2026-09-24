import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PushSubscriptionRow } from "@irossini/database";
import webpush from "web-push";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

export interface NotificacionPayload {
  title: string;
  body: string;
  url?: string; // deep link a abrir al tocar la notificación
}

let webpushConfigurado = false;
function asegurarWebPushConfigurado() {
  if (webpushConfigurado) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  webpushConfigurado = true;
}

function asegurarFirebaseConfigurado() {
  if (getApps().length > 0) return;
  initializeApp({
    credential: cert({
      projectId: process.env.FCM_PROJECT_ID,
      clientEmail: process.env.FCM_CLIENT_EMAIL,
      privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * Punto único de envío de notificaciones. Recorre TODAS las suscripciones
 * activas del socio (puede tener varias: web + nativo, o varios dispositivos)
 * y las manda por el canal que corresponda, sin que quien llama sepa ni le
 * importe por dónde va a llegar cada una.
 *
 * Casos de uso previstos (no todos disparados en Fase 1): puntos acreditados,
 * puntos por vencer, promociones de red/estación.
 */
export async function enviarNotificacion(
  supabaseAdmin: SupabaseClient,
  socioId: string,
  payload: NotificacionPayload
): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("*")
    .eq("socio_id", socioId)
    .eq("activo", true);

  if (error) throw error;
  const suscripciones = (data ?? []) as PushSubscriptionRow[];

  await Promise.all(
    suscripciones.map((sub) => (sub.canal === "web_push" ? enviarWebPush(sub, payload) : enviarFcm(sub, payload)))
  );
}

async function enviarWebPush(sub: PushSubscriptionRow, payload: NotificacionPayload) {
  if (!sub.endpoint || !sub.p256dh || !sub.auth_key) return;
  asegurarWebPushConfigurado();

  await webpush
    .sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
      JSON.stringify({ title: payload.title, body: payload.body, data: { url: payload.url } })
    )
    .catch((err) => {
      console.error(`Error enviando web push a suscripción ${sub.id}`, err);
    });
}

async function enviarFcm(sub: PushSubscriptionRow, payload: NotificacionPayload) {
  if (!sub.fcm_token) return;
  asegurarFirebaseConfigurado();

  await getMessaging()
    .send({
      token: sub.fcm_token,
      notification: { title: payload.title, body: payload.body },
      data: payload.url ? { url: payload.url } : undefined,
    })
    .catch((err) => {
      console.error(`Error enviando FCM a suscripción ${sub.id}`, err);
    });
}
