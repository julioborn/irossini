import type { SupabaseClient } from "@supabase/supabase-js";
import type { RolStaff } from "@irossini/database";

export type Rol =
  | { tipo: "playero"; rolStaff: RolStaff; estacionId: string; esSocio: boolean }
  | { tipo: "socio" }
  | { tipo: "sin_rol" };

/**
 * Un mismo login (auth.users.id) puede tener fila en playeros, en socios, o en
 * ambas (ej.: un encargado que también carga nafta con su propia cuenta). Se
 * prioriza el rol de staff para decidir a dónde aterriza después del login —
 * `esSocio` queda disponible para no esconderle el acceso a /saldo si también
 * tiene cuenta de socio.
 */
export async function resolverRol(supabase: SupabaseClient, userId: string): Promise<Rol> {
  const { data: playero } = await supabase
    .from("playeros")
    .select("rol, estacion_id")
    .eq("id", userId)
    .maybeSingle();

  const { data: socio } = await supabase.from("socios").select("id").eq("id", userId).maybeSingle();

  if (playero) {
    return { tipo: "playero", rolStaff: playero.rol, estacionId: playero.estacion_id, esSocio: Boolean(socio) };
  }

  if (socio) return { tipo: "socio" };

  return { tipo: "sin_rol" };
}

export function rutaInicioParaRol(rol: Rol): string {
  if (rol.tipo === "playero") return "/cobrar";
  if (rol.tipo === "socio") return "/saldo";
  return "/sin-acceso";
}
