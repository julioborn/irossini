import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { canal } = body as { canal: "web_push" | "fcm" };

  if (canal === "web_push") {
    const { endpoint, p256dh, authKey } = body as { endpoint: string; p256dh: string; authKey: string };
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { socio_id: user.id, canal, endpoint, p256dh, auth_key: authKey, activo: true },
        { onConflict: "socio_id,canal,endpoint" }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (canal === "fcm") {
    const { fcmToken } = body as { fcmToken: string };
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { socio_id: user.id, canal, fcm_token: fcmToken, activo: true },
        { onConflict: "socio_id,canal,fcm_token" }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    return NextResponse.json({ error: "Canal inválido" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
