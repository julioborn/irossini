import type { SupabaseClient } from "@supabase/supabase-js";
import { cifrarToken, descifrarToken } from "./crypto";

const MP_OAUTH_AUTHORIZE_URL = "https://auth.mercadopago.com/authorization";
const MP_OAUTH_TOKEN_URL = "https://api.mercadopago.com/oauth/token";

export interface ConstruirUrlAutorizacionInput {
  estacionId: string;
}

/**
 * URL a la que se redirige al dueño de la estación para conectar su cuenta de MP
 * (OAuth Marketplace). `state` lleva el id de estación para saber a quién
 * corresponde el callback.
 */
export function construirUrlAutorizacionMp({ estacionId }: ConstruirUrlAutorizacionInput): string {
  const params = new URLSearchParams({
    client_id: requireEnv("MP_APP_ID"),
    response_type: "code",
    platform_id: "mp",
    redirect_uri: requireEnv("MP_REDIRECT_URI"),
    state: estacionId,
  });
  return `${MP_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

interface MpTokenResponse {
  access_token: string;
  refresh_token: string;
  user_id: number;
  public_key: string;
  expires_in: number;
}

/**
 * Intercambia el `code` del callback de OAuth por tokens y los guarda cifrados
 * en estaciones_credenciales_mp. Requiere el cliente de Supabase con service_role.
 */
export async function conectarEstacionMp(
  supabaseAdmin: SupabaseClient,
  { estacionId, code }: { estacionId: string; code: string }
): Promise<void> {
  const res = await fetch(MP_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: requireEnv("MP_APP_ID"),
      client_secret: requireEnv("MP_CLIENT_SECRET"),
      grant_type: "authorization_code",
      code,
      redirect_uri: requireEnv("MP_REDIRECT_URI"),
    }),
  });

  if (!res.ok) {
    throw new Error(`Error intercambiando código OAuth de MP: ${res.status} ${await res.text()}`);
  }

  const token = (await res.json()) as MpTokenResponse;

  const { error } = await supabaseAdmin.from("estaciones_credenciales_mp").upsert({
    estacion_id: estacionId,
    mp_user_id: String(token.user_id),
    access_token_cifrado: cifrarToken(token.access_token),
    refresh_token_cifrado: cifrarToken(token.refresh_token),
    mp_public_key: token.public_key,
    actualizado_el: new Date().toISOString(),
  });

  if (error) throw error;
}

/**
 * Refresca el access_token de una estación cuando venció, y persiste el nuevo par
 * cifrado. Devuelve el access_token en claro, listo para usar en esa misma request.
 */
export async function refrescarTokenEstacion(
  supabaseAdmin: SupabaseClient,
  { estacionId, refreshToken }: { estacionId: string; refreshToken: string }
): Promise<string> {
  const res = await fetch(MP_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: requireEnv("MP_APP_ID"),
      client_secret: requireEnv("MP_CLIENT_SECRET"),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Error refrescando token OAuth de MP: ${res.status} ${await res.text()}`);
  }

  const token = (await res.json()) as MpTokenResponse;

  const { error } = await supabaseAdmin
    .from("estaciones_credenciales_mp")
    .update({
      access_token_cifrado: cifrarToken(token.access_token),
      refresh_token_cifrado: cifrarToken(token.refresh_token),
      actualizado_el: new Date().toISOString(),
    })
    .eq("estacion_id", estacionId);

  if (error) throw error;

  return token.access_token;
}

/**
 * Lee y descifra el access_token vigente de una estación. Quien llama es
 * responsable de manejar el caso de token vencido (MP devuelve 401) y llamar a
 * refrescarTokenEstacion.
 */
export async function obtenerAccessTokenEstacion(
  supabaseAdmin: SupabaseClient,
  estacionId: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const { data, error } = await supabaseAdmin
    .from("estaciones_credenciales_mp")
    .select("access_token_cifrado, refresh_token_cifrado")
    .eq("estacion_id", estacionId)
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Estación ${estacionId} no tiene Mercado Pago conectado`);

  return {
    accessToken: descifrarToken(Buffer.from(data.access_token_cifrado)),
    refreshToken: descifrarToken(Buffer.from(data.refresh_token_cifrado)),
  };
}

/**
 * Access token de la APLICACIÓN (no de una estación puntual), vía client_credentials.
 * Como la plataforma es la app OAuth que intermedió la conexión de cada estación,
 * este token puede consultar el detalle de cualquier pago procesado a través de
 * ella — es lo que usa el webhook para revalidar el pago contra la API de MP en
 * vez de confiar ciegamente en el payload que llega por POST.
 */
export async function obtenerAccessTokenPlataforma(): Promise<string> {
  const res = await fetch(MP_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: requireEnv("MP_APP_ID"),
      client_secret: requireEnv("MP_CLIENT_SECRET"),
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    throw new Error(`Error obteniendo access token de plataforma MP: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}
