"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TransaccionPago {
  id: string;
  monto: number;
  estado: string;
  socio_id: string | null;
  mp_init_point: string | null;
  estaciones: { nombre: string } | null;
}

export default function PagarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [transaccion, setTransaccion] = useState<TransaccionPago | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("transacciones")
      .select("id, monto, estado, socio_id, mp_init_point, estaciones(nombre)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("Este código ya no es válido. Pedile al playero que genere uno nuevo.");
          return;
        }
        setTransaccion(data as unknown as TransaccionPago);
      });
  }, [id]);

  async function confirmarYPagar() {
    setError(null);
    setProcesando(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=/pagar/${id}`);
      return;
    }

    const { error: rpcError } = await supabase.rpc("asociar_socio_a_transaccion", {
      p_transaccion_id: id,
    });

    if (rpcError) {
      setProcesando(false);
      setError("No se pudo asociar esta carga a tu cuenta. Puede que ya haya sido reclamada.");
      return;
    }

    if (!transaccion?.mp_init_point) {
      setProcesando(false);
      setError("Todavía no se generó el link de pago. Volvé a intentar en unos segundos.");
      return;
    }

    window.location.href = transaccion.mp_init_point;
  }

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!transaccion) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6">
        <p className="text-sm text-neutral-500">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm text-neutral-500">{transaccion.estaciones?.nombre ?? "Estación"}</p>
      <p className="mt-2 font-display text-5xl font-bold text-brand-tinta">
        ${transaccion.monto.toLocaleString("es-AR")}
      </p>

      <button
        onClick={confirmarYPagar}
        disabled={procesando}
        className="mt-10 w-full max-w-sm rounded-xl bg-brand-green-500 px-4 py-4 text-lg font-medium text-white transition active:bg-brand-green-600 disabled:opacity-60"
      >
        {procesando ? "Redirigiendo a Mercado Pago..." : "Confirmar y pagar"}
      </button>
    </main>
  );
}
