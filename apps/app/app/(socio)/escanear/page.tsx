"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ELEMENT_ID = "lector-qr";

export default function EscanearPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);

  useEffect(() => {
    let activo = true;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (!activo) return;
      const scanner = new Html5Qrcode(ELEMENT_ID);
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (textoDecodificado) => manejarResultado(textoDecodificado),
          () => {} // errores de frame individual, se ignoran
        )
        .catch(() => setError("No se pudo acceder a la cámara. Revisá los permisos."));
    });

    return () => {
      activo = false;
      scannerRef.current?.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function manejarResultado(texto: string) {
    scannerRef.current?.stop().catch(() => {});

    try {
      const url = new URL(texto, window.location.origin);
      if (url.origin === window.location.origin) {
        router.push(url.pathname + url.search);
      } else {
        window.location.href = url.toString();
      }
    } catch {
      setError("El código escaneado no es válido.");
    }
  }

  return (
    <main className="flex flex-col items-center px-6 py-8">
      <h1 className="mb-6 font-display text-xl font-semibold text-brand-tinta">Escanear QR</h1>
      <div id={ELEMENT_ID} className="w-full max-w-sm overflow-hidden rounded-2xl" />
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <p className="mt-4 max-w-xs text-center text-sm text-neutral-500">
        Apuntá la cámara al QR que te muestra el playero en la isla.
      </p>
    </main>
  );
}
