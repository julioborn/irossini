import { createClient } from "@/lib/supabase/server";

interface FilaHistorial {
  id: string;
  monto: number;
  estado: string;
  creado_el: string;
  estaciones: { nombre: string } | null;
}

export default async function HistorialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("transacciones")
    .select("id, monto, estado, creado_el, estaciones(nombre)")
    .eq("socio_id", user?.id)
    .order("creado_el", { ascending: false })
    .limit(50);

  const transacciones = (data ?? []) as unknown as FilaHistorial[];

  return (
    <main className="px-6 py-8">
      <h1 className="mb-6 font-display text-xl font-semibold text-brand-tinta">Historial</h1>

      {transacciones.length === 0 && (
        <p className="text-sm text-neutral-500">Todavía no tenés cargas registradas.</p>
      )}

      <ul className="flex flex-col gap-2">
        {transacciones.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-2xl bg-superficieMedia px-4 py-4"
          >
            <div>
              <p className="font-medium text-brand-tinta">{t.estaciones?.nombre ?? "Estación"}</p>
              <p className="text-xs text-neutral-500">
                {new Date(t.creado_el).toLocaleString("es-AR")} · {ESTADOS[t.estado] ?? t.estado}
              </p>
            </div>
            <p className="font-display font-semibold text-brand-tinta">
              ${t.monto.toLocaleString("es-AR")}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}

const ESTADOS: Record<string, string> = {
  pendiente: "Pendiente de pago",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};
