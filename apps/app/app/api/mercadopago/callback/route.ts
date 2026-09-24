import { NextResponse } from "next/server";
import { conectarEstacionMp } from "@irossini/core/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

/** Callback de OAuth de MP: intercambia el code y guarda las credenciales cifradas. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const estacionId = url.searchParams.get("state"); // seteado en construirUrlAutorizacionMp

  if (!code || !estacionId) {
    return NextResponse.redirect(new URL("/config/mercadopago?error=1", process.env.NEXT_PUBLIC_APP_URL));
  }

  try {
    await conectarEstacionMp(createAdminClient(), { estacionId, code });
  } catch (err) {
    console.error("Error conectando MP", err);
    return NextResponse.redirect(new URL("/config/mercadopago?error=1", process.env.NEXT_PUBLIC_APP_URL));
  }

  return NextResponse.redirect(new URL("/config/mercadopago?ok=1", process.env.NEXT_PUBLIC_APP_URL));
}
