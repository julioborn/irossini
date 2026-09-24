import { NextResponse } from "next/server";
import { verificarFirmaWebhookMp, obtenerAccessTokenPlataforma, obtenerPagoMp } from "@irossini/core/mercadopago";
import { emitirLotesParaTransaccion } from "@irossini/core/puntos";
import { enviarNotificacion } from "@irossini/core/notifications";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Único punto de entrada por el que se pueden emitir puntos. Todo lo demás
 * (transacciones_insert_playero, RLS de lotes_puntos, etc.) está diseñado para
 * que esta sea la única vía posible — ver supabase/migrations.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);

  const dataId = url.searchParams.get("data.id") || (body as any)?.data?.id;
  const type = url.searchParams.get("type") || (body as any)?.type;

  if (!dataId || type !== "payment") {
    return NextResponse.json({ ok: true }); // otros tópicos (merchant_order, etc.) se ignoran
  }

  const firmaValida = verificarFirmaWebhookMp({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId: String(dataId),
    secret: process.env.MP_WEBHOOK_SECRET!,
  });

  if (!firmaValida) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const accessTokenPlataforma = await obtenerAccessTokenPlataforma();
  const pago = await obtenerPagoMp(accessTokenPlataforma, String(dataId));

  if (!pago.external_reference) {
    return NextResponse.json({ ok: true }); // pago no originado en nuestro flujo
  }

  const transaccionId = pago.external_reference;

  const { data: transaccion } = await adminClient
    .from("transacciones")
    .select("*")
    .eq("id", transaccionId)
    .single();

  if (!transaccion) {
    return NextResponse.json({ ok: true });
  }

  // Idempotencia: reintentos del webhook (MP reintenta si no respondemos 200 a
  // tiempo) no deben volver a procesar un pago ya resuelto.
  if (transaccion.estado !== "pendiente") {
    return NextResponse.json({ ok: true });
  }

  const nuevoEstado =
    pago.status === "approved" ? "aprobada" : pago.status === "cancelled" ? "cancelada" : "rechazada";

  const { data: transaccionActualizada, error: errorUpdate } = await adminClient
    .from("transacciones")
    .update({
      estado: nuevoEstado,
      mp_payment_id: String(pago.id),
      mp_status: pago.status,
      confirmada_el: new Date().toISOString(),
    })
    .eq("id", transaccionId)
    .eq("estado", "pendiente") // guarda extra contra procesamiento concurrente
    .select("*")
    .single();

  if (errorUpdate || !transaccionActualizada) {
    return NextResponse.json({ error: "No se pudo actualizar la transacción" }, { status: 500 });
  }

  if (nuevoEstado !== "aprobada") {
    return NextResponse.json({ ok: true });
  }

  const { data: estacion } = await adminClient
    .from("estaciones")
    .select("red_id")
    .eq("id", transaccionActualizada.estacion_id)
    .single();

  const { data: items } = await adminClient
    .from("transaccion_items")
    .select("*, producto:productos(id, tipo)")
    .eq("transaccion_id", transaccionId);

  if (!transaccionActualizada.socio_id) {
    // Pago aprobado sin socio asociado (no debería pasar si el flujo pasó por
    // /pagar/[id], pero no rompemos el webhook por esto: queda para conciliación).
    return NextResponse.json({ ok: true });
  }

  if (estacion && items) {
    const lotes = await emitirLotesParaTransaccion(adminClient, {
      transaccion: transaccionActualizada,
      items: items as any,
      redId: estacion.red_id,
    });

    if (lotes.length > 0 && transaccionActualizada.socio_id) {
      const totalPuntos = lotes.reduce((acc, l) => acc + l.puntos, 0);
      await enviarNotificacion(adminClient, transaccionActualizada.socio_id, {
        title: "¡Sumaste puntos!",
        body: `Acreditamos ${totalPuntos.toLocaleString("es-AR")} puntos por tu carga.`,
        url: "/saldo",
      }).catch(() => {}); // el pago y los puntos ya están confirmados; un fallo de push no debe romper el webhook
    }
  }

  return NextResponse.json({ ok: true });
}
