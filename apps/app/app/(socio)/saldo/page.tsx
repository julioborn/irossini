import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PointsGauge } from "@/components/points-gauge";
import { IconHistory, IconScan } from "@/components/icons";
import type { LotePuntos } from "@irossini/database";

export default async function SaldoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: socio }, { data: lotesData }] = await Promise.all([
    supabase.from("socios").select("nombre").eq("id", user?.id).single(),
    supabase
      .from("lotes_puntos")
      .select("*")
      .eq("socio_id", user?.id)
      .gt("puntos_disponibles", 0)
      .gt("vence_el", new Date().toISOString())
      .order("vence_el", { ascending: true }),
  ]);

  const lotes = (lotesData ?? []) as LotePuntos[];
  const saldoTotal = lotes.reduce((acc, l) => acc + l.puntos_disponibles, 0);
  const proximoAVencer = lotes[0];

  return (
    <main className="flex flex-col">
      <section className="bg-hero-gauge rounded-b-[2rem] px-6 pb-10 pt-8">
        <p className="text-sm font-medium text-white/80">
          Hola{socio?.nombre ? `, ${socio.nombre}` : ""} 👋
        </p>
        <div className="mt-6">
          <PointsGauge puntos={saldoTotal} />
        </div>
      </section>

      <section className="px-6 py-6">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/escanear"
            className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-100 bg-white py-5 shadow-sm"
          >
            <IconScan color="#78BE20" size={24} />
            <span className="text-sm font-medium text-brand-tinta">Cargar</span>
          </Link>
          <Link
            href="/historial"
            className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-100 bg-white py-5 shadow-sm"
          >
            <IconHistory color="#78BE20" size={24} />
            <span className="text-sm font-medium text-brand-tinta">Historial</span>
          </Link>
        </div>

        {proximoAVencer && (
          <div className="mt-4 rounded-2xl bg-superficieMedia px-4 py-4 text-sm">
            <p className="font-medium text-brand-tinta">Próximos a vencer</p>
            <p className="text-neutral-600">
              {proximoAVencer.puntos_disponibles.toLocaleString("es-AR")} puntos el{" "}
              {new Date(proximoAVencer.vence_el).toLocaleDateString("es-AR")}
            </p>
          </div>
        )}

        {lotes.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-500">
            Todavía no acumulaste puntos. Cargá combustible en cualquier estación de la red y escaneá el QR
            del playero para sumar.
          </p>
        )}
      </section>
    </main>
  );
}
