import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: playero } = await supabase.from("playeros").select("rol").eq("id", user.id).maybeSingle();
  if (!playero || (playero.rol !== "encargado" && playero.rol !== "admin_red")) {
    redirect("/sin-acceso");
  }

  return <>{children}</>;
}
