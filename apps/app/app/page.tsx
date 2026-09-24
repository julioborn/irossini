import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolverRol, rutaInicioParaRol } from "@/lib/auth/rol";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const rol = await resolverRol(supabase, user.id);
  redirect(rutaInicioParaRol(rol));
}
