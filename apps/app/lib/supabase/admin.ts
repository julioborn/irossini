import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role. Bypassa RLS por completo — usar SOLO en código de
 * servidor que necesita escribir donde el cliente autenticado no puede
 * (ej.: guardar push_subscriptions llega por RLS normal, pero cosas como leer
 * estaciones_credenciales_mp no).
 */
export function createAdminClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
