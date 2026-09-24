import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaccion, TransaccionItem, Producto } from "@irossini/database";
import { resolverRegla } from "./reglas-acumulacion";

export interface EmitirLotesInput {
  transaccion: Transaccion;
  items: (TransaccionItem & { producto: Pick<Producto, "id" | "tipo"> })[];
  redId: string;
}

export interface LoteEmitido {
  productoId: string;
  puntos: number;
  valorUnitario: number;
}

/**
 * Motor de acumulación. Se invoca SOLO desde el handler del webhook de Mercado
 * Pago, una vez confirmado el pago (mp_status = 'approved'), usando el cliente con
 * service_role — la tabla lotes_puntos no tiene policies de insert para
 * 'authenticated', así que este es el único camino posible para crear puntos.
 *
 * Idempotente: si ya existen lotes para esta transacción, no vuelve a emitir
 * (protege contra reintentos del webhook).
 *
 * valor_unitario queda congelado como monto_item / puntos_otorgados: representa
 * cuántos pesos "vale" cada punto para efectos de liquidación entre estaciones,
 * y no se recalcula nunca después de emitido (evita que la inflación distorsione
 * el clearing de puntos ya emitidos).
 */
export async function emitirLotesParaTransaccion(
  supabaseAdmin: SupabaseClient,
  { transaccion, items, redId }: EmitirLotesInput
): Promise<LoteEmitido[]> {
  const { data: existentes, error: errorExistentes } = await supabaseAdmin
    .from("lotes_puntos")
    .select("id")
    .eq("transaccion_id", transaccion.id)
    .limit(1);

  if (errorExistentes) throw errorExistentes;
  if (existentes && existentes.length > 0) return [];

  if (!transaccion.socio_id) {
    throw new Error(`Transaccion ${transaccion.id} no tiene socio asociado, no se pueden emitir puntos`);
  }

  const emitidoEl = new Date();
  const lotesAInsertar: Record<string, unknown>[] = [];
  const resultado: LoteEmitido[] = [];

  for (const item of items) {
    const regla = await resolverRegla(supabaseAdmin, {
      redId,
      estacionId: transaccion.estacion_id,
      productoId: item.producto_id,
      tipoProducto: item.producto.tipo,
    });

    if (!regla) continue; // sin regla vigente => no se emiten puntos para ese ítem

    const puntos = Number((item.monto * regla.puntos_por_peso * regla.multiplicador).toFixed(2));
    if (puntos <= 0) continue;

    const valorUnitario = item.monto / puntos;
    const venceEl = new Date(emitidoEl.getTime() + regla.dias_vencimiento_puntos * 24 * 60 * 60 * 1000);

    lotesAInsertar.push({
      socio_id: transaccion.socio_id,
      estacion_emisora_id: transaccion.estacion_id,
      transaccion_id: transaccion.id,
      puntos_iniciales: puntos,
      puntos_disponibles: puntos,
      valor_unitario: valorUnitario,
      emitido_el: emitidoEl.toISOString(),
      vence_el: venceEl.toISOString(),
    });

    resultado.push({ productoId: item.producto_id, puntos, valorUnitario });
  }

  if (lotesAInsertar.length === 0) return [];

  const { error: errorInsert } = await supabaseAdmin.from("lotes_puntos").insert(lotesAInsertar);
  if (errorInsert) throw errorInsert;

  return resultado;
}
