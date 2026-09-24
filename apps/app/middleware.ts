import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const RUTAS_PUBLICAS = ["/login", "/registro", "/privacidad"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Si Supabase no responde (caída, red, config inválida), no tumbamos toda la
  // app con un 500: tratamos al pedido como no autenticado y dejamos que el
  // flujo normal decida (redirigir a /login, o dejar pasar si la ruta es pública).
  const user = await supabase.auth
    .getUser()
    .then(({ data }) => data.user)
    .catch(() => null);

  const { pathname } = request.nextUrl;
  const esRutaPublica = RUTAS_PUBLICAS.some((ruta) => pathname.startsWith(ruta));
  const esPagoIntermediario = pathname.startsWith("/pagar/");
  const esWebhookOCallback =
    pathname.startsWith("/api/mercadopago/webhook") || pathname.startsWith("/api/mercadopago/callback");

  if (!user && !esRutaPublica && !esPagoIntermediario && !esWebhookOCallback) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Excluye internals de Next y CUALQUIER archivo estático de /public (todo lo
  // que tenga extensión: /brand/logo.png, /icons/*, /sw.js, /manifest.webmanifest,
  // etc.) — antes solo excluía rutas puntuales y el logo terminaba redirigido a
  // /login como si fuera una página protegida.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
