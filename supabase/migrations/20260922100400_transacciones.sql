-- Transacciones: una carga cobrada por el playero, pagada vía Mercado Pago.
create table transacciones (
  id uuid primary key default gen_random_uuid(),
  estacion_id uuid not null references estaciones(id),
  socio_id uuid references socios(id),        -- se asocia cuando el socio escanea el QR de cobro
  playero_id uuid not null references playeros(id),
  monto numeric(12, 2) not null,
  mp_payment_id text unique,
  mp_preference_id text,
  mp_init_point text,
  mp_status text,
  estado estado_transaccion not null default 'pendiente',
  idempotency_key text unique not null,
  creado_el timestamptz not null default now(),
  confirmada_el timestamptz
);

create index idx_transacciones_estacion on transacciones (estacion_id, creado_el desc);
create index idx_transacciones_socio on transacciones (socio_id, creado_el desc);

create table transaccion_items (
  id uuid primary key default gen_random_uuid(),
  transaccion_id uuid not null references transacciones(id) on delete cascade,
  producto_id uuid not null references productos(id),
  litros numeric(10, 3),
  monto numeric(12, 2) not null
);

create index idx_transaccion_items_transaccion on transaccion_items (transaccion_id);
