import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ConfigMercadoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: playero } = await supabase.from("playeros").select("estacion_id").eq("id", user.id).single();
  if (!playero) redirect("/sin-acceso");

  const { data: credenciales } = await createAdminClient()
    .from("estaciones_credenciales_mp")
    .select("conectada_el")
    .eq("estacion_id", playero.estacion_id)
    .maybeSingle();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-4 font-display text-xl font-semibold text-brand-tinta">Mercado Pago</h1>

      {ok && <p className="mb-4 text-sm text-brand-green-600">Cuenta conectada correctamente.</p>}
      {error && <p className="mb-4 text-sm text-red-600">No se pudo conectar. Intentá de nuevo.</p>}

      {credenciales ? (
        <p className="text-sm text-neutral-600">
          Conectada desde el {new Date(credenciales.conectada_el).toLocaleDateString("es-AR")}.
        </p>
      ) : (
        <a
          href="/api/mercadopago/conectar"
          className="rounded-xl bg-brand-green-500 px-6 py-4 text-lg font-medium text-white active:bg-brand-green-600"
        >
          Conectar cuenta de Mercado Pago
        </a>
      )}
    </main>
  );
}
