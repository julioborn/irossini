import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "./bottom-nav";

export default async function SocioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: socio } = await supabase.from("socios").select("id").eq("id", user.id).maybeSingle();
  if (!socio) redirect("/sin-acceso");

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
