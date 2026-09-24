export default function SinAccesoPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-display font-semibold">Tu cuenta todavía no tiene acceso</p>
      <p className="mt-2 max-w-xs text-sm text-neutral-500">
        Este usuario no está registrado como socio ni como staff de ninguna estación. Si te registraste
        como socio, esperá unos minutos y volvé a entrar; si sos playero, pedile a tu encargado que te dé de
        alta.
      </p>
    </main>
  );
}
