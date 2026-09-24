-- Suscripciones de notificaciones push del socio. Una fila por dispositivo/canal.
-- El backend le manda la misma notificación lógica sin importar por qué canal llegó.
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid not null references socios(id) on delete cascade,
  canal canal_push not null,
  endpoint text,     -- web push
  p256dh text,
  auth_key text,
  fcm_token text,    -- push nativo (Capacitor / FCM)
  activo boolean not null default true,
  creado_el timestamptz not null default now(),
  unique (socio_id, canal, endpoint),
  unique (socio_id, canal, fcm_token)
);

create index idx_push_subscriptions_socio on push_subscriptions (socio_id) where activo;
