import { createHmac, timingSafeEqual } from "node:crypto";

export interface VerificarFirmaInput {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
  secret: string;
}

/**
 * Valida la firma del webhook de Mercado Pago según su esquema documentado:
 * header x-signature = "ts=<epoch>,v1=<hmac_sha256_hex>", calculado sobre el
 * manifest "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
 *
 * Nunca proceses un webhook sin esto: es lo único que separa "pago confirmado
 * por MP" de "cualquiera pegándole a la URL para emitir puntos gratis".
 */
export function verificarFirmaWebhookMp({ xSignature, xRequestId, dataId, secret }: VerificarFirmaInput): boolean {
  if (!xSignature || !xRequestId) return false;

  const partes = Object.fromEntries(
    xSignature.split(",").map((par) => {
      const [k, v] = par.split("=");
      return [k.trim(), (v ?? "").trim()];
    })
  );

  const ts = partes["ts"];
  const v1 = partes["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const esperado = createHmac("sha256", secret).update(manifest).digest("hex");

  const bufEsperado = Buffer.from(esperado, "hex");
  const bufRecibido = Buffer.from(v1, "hex");
  if (bufEsperado.length !== bufRecibido.length) return false;

  return timingSafeEqual(bufEsperado, bufRecibido);
}
