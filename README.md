# Irossini — App de puntos para red de estaciones de servicio

SaaS multi-tenant white-label: la red es el tenant raíz, cada estación es un
sub-tenant. Puntos de red compartidos con ledger de lotes FIFO por emisor, pago
vía Mercado Pago Marketplace (la plataforma nunca custodia fondos).

## Estructura

```
apps/app            → Next.js único. Socio, playero y admin de estación conviven
                       acá, con ruteo por rol después del login (ver lib/auth/rol.ts).
                       PWA + Capacitor — el panel del playero simplemente se abre
                       en el navegador de la tablet de la isla, sin instalar nada.
packages/core        → Motor de puntos (FIFO, emisión), integración MP, notificaciones.
packages/database    → Tipos TypeScript del esquema.
packages/ui          → Tokens de marca y preset de Tailwind compartido.
supabase/            → Migraciones SQL versionadas + seed de desarrollo.
```

### Ruteo por rol (un solo login)

Un mismo `auth.users.id` puede tener fila en `socios`, en `playeros`, o en
ambas. Después de loguearse, `/` resuelve el rol (`lib/auth/rol.ts`) y
redirige:

- fila en `playeros` → `/cobrar` (y `/config/mercadopago` si el rol es
  `encargado` o `admin_red`)
- fila en `socios` (sin `playeros`) → `/saldo`
- ninguna de las dos → `/sin-acceso`

Cada grupo de rutas (`(socio)`, `(playero)`, `(admin)`) valida el rol de nuevo
en su propio `layout.tsx` — no alcanza con el redirect inicial, así que entrar
directo a una URL sin el rol correspondiente también rebota a `/sin-acceso`.

## Setup

1. `pnpm install`
2. Copiá `.env.example` a `apps/app/.env.local` y completá las variables.
3. Levantá Supabase local: `supabase start` (requiere el [CLI de Supabase](https://supabase.com/docs/guides/cli))
   y aplicá las migraciones con `supabase db reset` (corre las migraciones + seed).
4. `pnpm dev` (o `pnpm --filter=@irossini/app dev`) levanta la app en :3000.

Variables que usa `apps/app`: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`CREDENTIALS_ENCRYPTION_KEY`, `MP_APP_ID`, `MP_CLIENT_SECRET`,
`MP_REDIRECT_URI`, `MP_MARKETPLACE_FEE_PERCENT`, `MP_WEBHOOK_SECRET`,
`NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_RED_ID`,
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`,
`FCM_PROJECT_ID`, `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY`.

Generar `CREDENTIALS_ENCRYPTION_KEY` con: `openssl rand -base64 32`.

## Capacitor

`android/` e `ios/` ya están generados dentro de `apps/app`. La WebView apunta
a `NEXT_PUBLIC_APP_URL` (ver `capacitor.config.ts`) — no se empaqueta un build
estático, la app nativa envuelve la PWA desplegada.

- `pnpm --filter=@irossini/app cap:sync` — sincroniza plugins/config nativos.
- `pnpm --filter=@irossini/app cap:android` / `cap:ios` — abre Android Studio / Xcode.
- `pnpm --filter=@irossini/app assets:generate` — regenera íconos/splash desde
  `apps/app/resources/` (correr de nuevo si se reemplaza el logo).

iOS requiere macOS + Xcode para compilar; en este entorno solo se generó el
proyecto (sin `pod install`, que corre solo en Mac).

## Diseño

Tipografía: **Space Grotesk** (números y títulos) + **Manrope** (texto de UI),
vía `next/font/google` en `apps/app/app/layout.tsx`. Paleta y preset de
Tailwind en `packages/ui/src/tokens.ts` / `tailwind-preset.ts`. La firma visual
es el gauge de combustible (`apps/app/components/points-gauge.tsx`) que
muestra el saldo de puntos — es decorativo, no representa un sistema de
niveles real (todavía no existe en el modelo de datos).

## Pendiente antes de producción

- Nombre de marca real (`NEXT_PUBLIC_BRAND_NAME`, `capacitor.config.ts` appId/appName).
- Logo con transparencia real del diseñador (el actual se derivó automáticamente
  del PNG con fondo blanco).
- Texto legal definitivo de `/privacidad` (Ley 25.326).
- `packages/core/src/puntos/consumir-fifo.ts` debe migrarse a una función de
  Postgres transaccional antes de habilitar canjes (Fase 2) — la versión actual
  no es atómica.
- Confirmar con Mercado Pago el modelo exacto de QR dinámico a usar en producción
  (Checkout Pro con QR generado a partir del init_point vs. QR API in-store).
