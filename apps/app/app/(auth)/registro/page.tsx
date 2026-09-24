"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandHeader } from "../brand-header";

const campoTexto =
  "rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none transition focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-500/20";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    fechaNacimiento: "",
    email: "",
    password: "",
  });
  const [consentimiento, setConsentimiento] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!consentimiento) {
      setError("Necesitamos tu consentimiento para tratar tus datos personales.");
      return;
    }

    setCargando(true);
    const supabase = createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError || !signUpData.user) {
      setCargando(false);
      setError(signUpError?.message || "No se pudo crear la cuenta.");
      return;
    }

    const { error: socioError } = await supabase.from("socios").insert({
      id: signUpData.user.id,
      red_id: process.env.NEXT_PUBLIC_RED_ID,
      dni: form.dni,
      nombre: form.nombre,
      apellido: form.apellido,
      telefono: form.telefono || null,
      fecha_nacimiento: form.fechaNacimiento || null,
      consentimiento_datos: true,
      consentimiento_datos_el: new Date().toISOString(),
    });

    setCargando(false);

    if (socioError) {
      setError(
        socioError.code === "23505"
          ? "Ya existe una cuenta registrada con ese DNI."
          : "No se pudo completar el registro. Intentá de nuevo."
      );
      return;
    }

    router.push("/saldo");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <BrandHeader title="Creá tu cuenta" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <input
              required
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => update("nombre", e.target.value)}
              className={`w-1/2 ${campoTexto}`}
            />
            <input
              required
              placeholder="Apellido"
              value={form.apellido}
              onChange={(e) => update("apellido", e.target.value)}
              className={`w-1/2 ${campoTexto}`}
            />
          </div>

          <input
            required
            inputMode="numeric"
            placeholder="DNI"
            value={form.dni}
            onChange={(e) => update("dni", e.target.value.replace(/\D/g, ""))}
            className={campoTexto}
          />

          <input
            inputMode="tel"
            placeholder="Teléfono (opcional)"
            value={form.telefono}
            onChange={(e) => update("telefono", e.target.value)}
            className={campoTexto}
          />

          <input
            type="date"
            placeholder="Fecha de nacimiento"
            value={form.fechaNacimiento}
            onChange={(e) => update("fechaNacimiento", e.target.value)}
            className={campoTexto}
          />

          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={campoTexto}
          />

          <input
            type="password"
            required
            minLength={6}
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className={campoTexto}
          />

          <label className="flex items-start gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={consentimiento}
              onChange={(e) => setConsentimiento(e.target.checked)}
              className="mt-1 accent-brand-green-500"
            />
            <span>
              Acepto el tratamiento de mis datos personales según la{" "}
              <Link href="/privacidad" className="font-medium text-brand-green-600 underline">
                política de privacidad
              </Link>
              , conforme a la Ley 25.326.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-2 rounded-xl bg-brand-green-500 px-4 py-3 font-medium text-white transition active:bg-brand-green-600 disabled:opacity-60"
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-brand-green-600">
            Ingresá
          </Link>
        </p>
      </div>
    </main>
  );
}
