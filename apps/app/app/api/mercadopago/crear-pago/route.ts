import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { crearCobroDinamico, obtenerAccessTokenEstacion } from "@irossini/core/mercadopago";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { productoId, monto } = (await request.json()) as { productoId: string; monto: number };
  if (!productoId || !monto || monto <= 0) {
    return NextResponse.json({ error: "Faltan datos del cobro" }, { status: 400 });
  }

  const { data: playero } = await supabase.from("playeros").select("estacion_id").eq("id", user.id).single();
  if (!playero) return NextResponse.json({ error: "Usuario sin estación asignada" }, { status: 403 });

  const { data: producto } = await supabase.from("productos").select("id, nombre").eq("id", productoId).single();
  if (!producto) return NextResponse.json({ error: "Producto inválido" }, { status: 400 });

  const idempotencyKey = crypto.randomUUID();

  const { data: transaccion, error: errorTransaccion } = await supabase
    .from("transacciones")
    .insert({
      estacion_id: playero.estacion_id,
      playero_id: user.id,
      monto,
      estado: "pendiente",
      idempotency_key: idempotencyKey,
    })
    .select("id")
    .single();

  if (errorTransaccion || !transaccion) {
    return NextResponse.json({ error: "No se pudo crear la transacción" }, { status: 500 });
  }

  const { error: errorItem } = await supabase.from("transaccion_items").insert({
    transaccion_id: transaccion.id,
    producto_id: producto.id,
    monto,
  });
  if (errorItem) {
    return NextResponse.json({ error: "No se pudo registrar el ítem del cobro" }, { status: 500 });
  }

  const adminClient = createAdminClient();

  let accessTokenEstacion: string;
  try {
    ({ accessToken: accessTokenEstacion } = await obtenerAccessTokenEstacion(adminClient, playero.estacion_id));
  } catch {
    return NextResponse.json(
      { error: "Esta estación todavía no conectó su cuenta de Mercado Pago" },
      { status: 409 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const cobro = await crearCobroDinamico({
    accessTokenEstacion,
    transaccionId: transaccion.id,
    items: [{ productoId: producto.id, descripcion: producto.nombre, monto }],
    notificationUrl: `${appUrl}/api/mercadopago/webhook`,
    backUrl: `${appUrl}/cobrar`,
  });

  await adminClient
    .from("transacciones")
    .update({ mp_preference_id: cobro.preferenceId, mp_init_point: cobro.initPoint })
    .eq("id", transaccion.id);

  const qrUrl = `${appUrl}/pagar/${transaccion.id}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 512 });

  return NextResponse.json({ transaccionId: transaccion.id, qrDataUrl });
}
