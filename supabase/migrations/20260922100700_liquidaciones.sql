-- Liquidaciones: clearing periódico entre estaciones a partir de consumos_puntos.
-- Se genera off-chain (job de backend), no desde el cliente.
create table liquidaciones (
  id uuid primary key default gen_random_uuid(),
  red_id uuid not null references redes(id),
  periodo daterange not null,
  estacion_deudora_id uuid not null references estaciones(id),    -- donde se canjeó
  estacion_acreedora_id uuid not null references estaciones(id),  -- quien emitió los puntos
  puntos numeric(12, 2) not null,
  neto numeric(12, 2) not null,
  estado text not null default 'pendiente',   -- pendiente | pagada
  creado_el timestamptz not null default now(),
  check (estacion_deudora_id <> estacion_acreedora_id)
);

create index idx_liquidaciones_estaciones on liquidaciones (estacion_deudora_id, estacion_acreedora_id, periodo);
