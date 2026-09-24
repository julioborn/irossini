const MP_PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";
const MP_PAYMENTS_URL = "https://api.mercadopago.com/v1/payments";

export interface ItemCobro {
  productoId: string;
  descripcion: string;
  monto: number;
}

export interface CrearCobroDinamicoInput {
  accessTokenEstacion: string;
  transaccionId: string;
  items: ItemCobro[];
  notificationUrl: string;
  backUrl: string;
}

export interface CobroDinamico {
  preferenceId: string;
  initPoint: string;
}

/**
 * Crea la preference de Checkout Pro que financia el QR dinámico que escanea el
 * cliente. El pago va directo a la cuenta MP de la estación (accessTokenEstacion
 * es el token OAuth de esa estación, no uno propio de la plataforma) — la
 * plataforma solo cobra marketplace_fee, nunca custodia el dinero.
 */
export async function crearCobroDinamico({
  accessTokenEstacion,
  transaccionId,
  items,
  notificationUrl,
  backUrl,
}: CrearCobroDinamicoInput): Promise<CobroDinamico> {
  const montoTotal = items.reduce((acc, item) => acc + item.monto, 0);
  const feePercent = Number(process.env.MP_MARKETPLACE_FEE_PERCENT ?? "0");
  const marketplaceFee = Number(((montoTotal * feePercent) / 100).toFixed(2));

  const res = await fetch(MP_PREFERENCES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessTokenEstacion}`,
    },
    body: JSON.stringify({
      items: items.map((item) => ({
        id: item.productoId,
        title: item.descripcion,
        quantity: 1,
        unit_price: item.monto,
        currency_id: "ARS",
      })),
      external_reference: transaccionId,
      notification_url: notificationUrl,
      marketplace_fee: marketplaceFee,
      back_urls: { success: backUrl, pending: backUrl, failure: backUrl },
      auto_return: "approved",
    }),
  });

  if (!res.ok) {
    throw new Error(`Error creando preference de MP: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { id: string; init_point: string };
  return { preferenceId: data.id, initPoint: data.init_point };
}

export interface PagoMp {
  id: number;
  status: "approved" | "pending" | "rejected" | "cancelled" | "refunded" | "in_process" | string;
  status_detail: string;
  external_reference: string | null;
  transaction_amount: number;
}

/**
 * Revalida el pago contra la API de MP en vez de confiar en el payload del
 * webhook: el webhook solo avisa "pasó algo con el pago X", nunca es la fuente
 * de verdad de si se aprobó.
 */
export async function obtenerPagoMp(accessTokenPlataforma: string, paymentId: string): Promise<PagoMp> {
  const res = await fetch(`${MP_PAYMENTS_URL}/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessTokenPlataforma}` },
  });

  if (!res.ok) {
    throw new Error(`Error consultando pago ${paymentId} en MP: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as PagoMp;
}
