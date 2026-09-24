"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Producto {
  id: string;
  tipo: string;
  nombre: string;
  unidad: string;
}

type Paso =
  | { tipo: "producto" }
  | { tipo: "monto"; producto: Producto }
  | { tipo: "qr"; producto: Producto; monto: number; transaccionId: string; qrDataUrl: string }
  | { tipo: "resultado"; estado: "aprobada" | "rechazada" | "cancelada" };

export function PanelCobro({ productos, esAdmin }: { productos: Producto[]; esAdmin: boolean }) {
  const [paso, setPaso] = useState<Paso>({ tipo: "producto" });

  if (paso.tipo === "producto") {
    return (
      <PasoProducto
        productos={productos}
        esAdmin={esAdmin}
        onElegir={(producto) => setPaso({ tipo: "monto", producto })}
      />
    );
  }

  if (paso.tipo === "monto") {
    return (
      <PasoMonto
        producto={paso.producto}
        onVolver={() => setPaso({ tipo: "producto" })}
        onCobrar={async (monto) => {
          const res = await fetch("/api/mercadopago/crear-pago", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productoId: paso.producto.id, monto }),
          });
          if (!res.ok) {
            alert("No se pudo generar el cobro. Reintentá.");
            return;
          }
          const data = await res.json();
          setPaso({
            tipo: "qr",
            producto: paso.producto,
            monto,
            transaccionId: data.transaccionId,
            qrDataUrl: data.qrDataUrl,
          });
        }}
      />
    );
  }

  if (paso.tipo === "qr") {
    return (
      <PasoQr
        {...paso}
        onResultado={(estado) => setPaso({ tipo: "resultado", estado })}
        onCancelar={() => setPaso({ tipo: "producto" })}
      />
    );
  }

  return <PasoResultado estado={paso.estado} onNuevaVenta={() => setPaso({ tipo: "producto" })} />;
}

function PasoProducto({
  productos,
  esAdmin,
  onElegir,
}: {
  productos: Producto[];
  esAdmin: boolean;
  onElegir: (p: Producto) => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-center text-lg font-semibold text-neutral-700">¿Qué cargó?</h1>
        {esAdmin && (
          <Link href="/config/mercadopago" className="text-xs font-medium text-brand-green-600 underline">
            Config. MP
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {productos.map((p) => (
          <button
            key={p.id}
            onClick={() => onElegir(p)}
            className="rounded-2xl border-2 border-neutral-200 bg-white py-8 text-lg font-semibold text-brand-tinta active:border-brand-green-500 active:bg-brand-green-50"
          >
            {p.nombre}
          </button>
        ))}
      </div>
    </main>
  );
}

function PasoMonto({
  producto,
  onVolver,
  onCobrar,
}: {
  producto: Producto;
  onVolver: () => void;
  onCobrar: (monto: number) => Promise<void>;
}) {
  const [monto, setMonto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const valor = Number(monto || "0");

  function tocarDigito(d: string) {
    if (monto.length >= 7) return;
    setMonto((m) => (m === "0" ? d : m + d));
  }

  function borrar() {
    setMonto((m) => m.slice(0, -1));
  }

  return (
    <main className="flex min-h-dvh flex-col px-4 py-6">
      <button onClick={onVolver} className="mb-2 self-start text-sm text-neutral-500">
        ← {producto.nombre}
      </button>

      <p className="mb-4 text-center font-display text-5xl font-bold tabular-nums text-brand-tinta">
        ${valor.toLocaleString("es-AR")}
      </p>

      <div className="mt-auto grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"].map((d) => (
          <button
            key={d}
            onClick={() => (d === "⌫" ? borrar() : tocarDigito(d))}
            className="rounded-xl bg-superficieMedia py-5 text-2xl font-medium text-brand-tinta active:bg-neutral-200"
          >
            {d}
          </button>
        ))}
      </div>

      <button
        disabled={valor <= 0 || enviando}
        onClick={async () => {
          setEnviando(true);
          await onCobrar(valor);
          setEnviando(false);
        }}
        className="mt-4 rounded-xl bg-brand-green-500 py-5 text-xl font-semibold text-white active:bg-brand-green-600 disabled:opacity-40"
      >
        {enviando ? "Generando QR..." : "Cobrar"}
      </button>
    </main>
  );
}

function PasoQr({
  transaccionId,
  qrDataUrl,
  monto,
  producto,
  onResultado,
  onCancelar,
}: Extract<Paso, { tipo: "qr" }> & {
  onResultado: (estado: "aprobada" | "rechazada" | "cancelada") => void;
  onCancelar: () => void;
}) {
  useEffect(() => {
    const supabase = createClient();
    const intervalo = setInterval(async () => {
      const { data } = await supabase.from("transacciones").select("estado").eq("id", transaccionId).single();
      if (data && data.estado !== "pendiente") {
        clearInterval(intervalo);
        onResultado(data.estado as "aprobada" | "rechazada" | "cancelada");
      }
    }, 2000);

    return () => clearInterval(intervalo);
  }, [transaccionId, onResultado]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm text-neutral-500">{producto.nombre}</p>
      <p className="mb-6 font-display text-3xl font-bold text-brand-tinta">
        ${monto.toLocaleString("es-AR")}
      </p>

      <div className="rounded-2xl border-2 border-neutral-100 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR de pago" className="h-64 w-64" />
      </div>

      <p className="mt-6 text-sm text-neutral-500">Esperando que el cliente escanee y pague...</p>

      <button onClick={onCancelar} className="mt-8 text-sm text-neutral-400 underline">
        Cancelar
      </button>
    </main>
  );
}

function PasoResultado({
  estado,
  onNuevaVenta,
}: {
  estado: "aprobada" | "rechazada" | "cancelada";
  onNuevaVenta: () => void;
}) {
  const ok = estado === "aprobada";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className={`font-display text-3xl font-bold ${ok ? "text-brand-green-600" : "text-red-600"}`}>
        {ok ? "¡Pago acreditado!" : "El pago no se acreditó"}
      </p>
      <button
        onClick={onNuevaVenta}
        className="mt-10 w-full max-w-xs rounded-xl bg-brand-green-500 py-5 text-xl font-semibold text-white active:bg-brand-green-600"
      >
        Nueva venta
      </button>
    </main>
  );
}
