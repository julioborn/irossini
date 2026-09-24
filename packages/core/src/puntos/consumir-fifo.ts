import type { SupabaseClient } from "@supabase/supabase-js";
import type { LotePuntos } from "@irossini/database";

export interface ConsumirFifoInput {
  socioId: string;
  canjeId: string;
  puntosNecesarios: number;
}

export interface ConsumoResultado {
  loteId: string;
  puntosConsumidos: number;
  valorCompensable: number;
}

export class SaldoInsuficienteError extends Error {
  constructor(disponible: number, requerido: number) {
    super(`Saldo insuficiente: disponible ${disponible}, requerido ${requerido}`);
    this.name = "SaldoInsuficienteError";
  }
}

/**
 * Consume lotes de puntos en orden FIFO por fecha de emisión (los más viejos primero).
 * Ese mismo orden resuelve el vencimiento y el clearing entre estaciones: cada
 * consumo registra de qué lote (y por lo tanto qué estación emisora) salió.
 *
 * Requiere service_role: lotes_puntos y consumos_puntos no tienen policies de
 * escritura para 'authenticated'. Se invoca desde el flujo de confirmación de canje
 * (Fase 2), nunca desde el cliente.
 *
 * NOTA: esta implementación hace varias llamadas separadas (no es atómica). Antes
 * de habilitar canjes en Fase 2, migrar esta lógica a una función de Postgres
 * (plpgsql, transaccional) para evitar condiciones de carrera con canjes concurrentes.
 */
export async function consumirFifo(
  supabaseAdmin: SupabaseClient,
  { socioId, canjeId, puntosNecesarios }: ConsumirFifoInput
): Promise<ConsumoResultado[]> {
  const { data, error } = await supabaseAdmin
    .from("lotes_puntos")
    .select("*")
    .eq("socio_id", socioId)
    .gt("puntos_disponibles", 0)
    .gt("vence_el", new Date().toISOString())
    .order("emitido_el", { ascending: true });

  if (error) throw error;
  const lotes = (data ?? []) as LotePuntos[];

  const disponibleTotal = lotes.reduce((acc, l) => acc + l.puntos_disponibles, 0);
  if (disponibleTotal < puntosNecesarios) {
    throw new SaldoInsuficienteError(disponibleTotal, puntosNecesarios);
  }

  let restante = puntosNecesarios;
  const consumos: ConsumoResultado[] = [];
  const actualizacionesLote: { id: string; puntos_disponibles: number }[] = [];
  const consumosAInsertar: Record<string, unknown>[] = [];

  for (const lote of lotes) {
    if (restante <= 0) break;
    const consumir = Math.min(lote.puntos_disponibles, restante);
    const valorCompensable = Number((consumir * lote.valor_unitario).toFixed(2));

    consumosAInsertar.push({
      canje_id: canjeId,
      lote_id: lote.id,
      puntos_consumidos: consumir,
      valor_compensable: valorCompensable,
    });
    actualizacionesLote.push({ id: lote.id, puntos_disponibles: lote.puntos_disponibles - consumir });
    consumos.push({ loteId: lote.id, puntosConsumidos: consumir, valorCompensable });

    restante -= consumir;
  }

  const { error: errorConsumos } = await supabaseAdmin.from("consumos_puntos").insert(consumosAInsertar);
  if (errorConsumos) throw errorConsumos;

  for (const upd of actualizacionesLote) {
    const { error: errorUpdate } = await supabaseAdmin
      .from("lotes_puntos")
      .update({ puntos_disponibles: upd.puntos_disponibles })
      .eq("id", upd.id);
    if (errorUpdate) throw errorUpdate;
  }

  return consumos;
}
