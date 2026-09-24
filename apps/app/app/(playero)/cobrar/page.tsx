import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PanelCobro } from "./panel-cobro";

export default async function CobrarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: playero } = await supabase
    .from("playeros")
    .select("estacion_id, rol")
    .eq("id", user.id)
    .single();

  if (!playero) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6 text-center">
        <p className="text-sm text-neutral-500">
          Tu usuario no está vinculado a ninguna estación. Pedile a un administrador que te dé de alta.
        </p>
      </main>
    );
  }

  const { data: productos } = await supabase
    .from("productos")
    .select("id, tipo, nombre, unidad")
    .eq("activo", true)
    .order("nombre");

  return (
    <PanelCobro
      productos={productos ?? []}
      esAdmin={playero.rol === "encargado" || playero.rol === "admin_red"}
    />
  );
}
