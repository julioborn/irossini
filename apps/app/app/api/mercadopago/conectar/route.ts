import { NextResponse } from "next/server";
import { construirUrlAutorizacionMp } from "@irossini/core/mercadopago";
import { createClient } from "@/lib/supabase/server";

/** Inicia el OAuth de Marketplace: redirige al dueño de la estación a autorizar en MP. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));

  const { data: playero } = await supabase.from("playeros").select("estacion_id, rol").eq("id", user.id).single();

  if (!playero || (playero.rol !== "encargado" && playero.rol !== "admin_red")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const url = construirUrlAutorizacionMp({ estacionId: playero.estacion_id });
  return NextResponse.redirect(url);
}
