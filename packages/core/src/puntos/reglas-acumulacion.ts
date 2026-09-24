import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReglaAcumulacion, TipoProducto } from "@irossini/database";

export interface ResolverReglaInput {
  redId: string;
  estacionId: string;
  productoId: string;
  tipoProducto: TipoProducto;
  fecha?: Date;
}

/**
 * Resuelve la regla de acumulación vigente más específica para un producto en una
 * estación, en un momento dado. Prioridad: estación+producto > estación+tipo >
 * red+producto > red+tipo. Nunca hardcodea una tasa: si no hay regla vigente,
 * devuelve null y quien llama decide si emite 0 puntos o falla.
 */
export async function resolverRegla(
  supabase: SupabaseClient,
  { redId, estacionId, productoId, tipoProducto, fecha = new Date() }: ResolverReglaInput
): Promise<ReglaAcumulacion | null> {
  const isoFecha = fecha.toISOString();

  const { data, error } = await supabase
    .from("reglas_acumulacion")
    .select("*")
    .eq("red_id", redId)
    .or(`estacion_id.eq.${estacionId},estacion_id.is.null`)
    .or(`producto_id.eq.${productoId},tipo_producto.eq.${tipoProducto}`)
    .lte("vigente_desde", isoFecha)
    .or(`vigente_hasta.is.null,vigente_hasta.gte.${isoFecha}`);

  if (error) throw error;
  const reglas = (data ?? []) as ReglaAcumulacion[];
  if (reglas.length === 0) return null;

  const puntaje = (r: ReglaAcumulacion) => {
    const scopeEstacion = r.estacion_id === estacionId ? 2 : 0;
    const scopeProducto = r.producto_id === productoId ? 1 : 0;
    return scopeEstacion + scopeProducto;
  };

  return reglas.sort((a, b) => puntaje(b) - puntaje(a))[0];
}
