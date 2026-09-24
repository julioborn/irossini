-- Lotes de puntos: FUENTE DE VERDAD del saldo. El saldo de un socio nunca es una
-- columna mutable, siempre es la suma de puntos_disponibles de sus lotes vigentes.
create table lotes_puntos (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid not null references socios(id),
  estacion_emisora_id uuid not null references estaciones(id),
  transaccion_id uuid not null references transacciones(id),
  puntos_iniciales numeric(12, 2) not null check (puntos_iniciales > 0),
  puntos_disponibles numeric(12, 2) not null check (puntos_disponibles >= 0 and puntos_disponibles <= puntos_iniciales),
  valor_unitario numeric(12, 6) not null,     -- $/punto congelado al momento de emitir
  emitido_el timestamptz not null default now(),
  vence_el timestamptz not null
);

-- Índice que sirve directamente al consumo FIFO: lotes con saldo, ordenados por antigüedad.
create index idx_lotes_socio_fifo on lotes_puntos (socio_id, emitido_el asc) where puntos_disponibles > 0;
create index idx_lotes_estacion_emisora on lotes_puntos (estacion_emisora_id, emitido_el desc);

-- Consumos: ledger de qué lote (y por lo tanto qué estación emisora) financió cada canje.
-- El mismo registro resuelve el vencimiento (los lotes más viejos se consumen primero)
-- y el clearing entre estaciones (liquidaciones se calculan a partir de esta tabla).
create table consumos_puntos (
  id uuid primary key default gen_random_uuid(),
  canje_id uuid not null references canjes(id),
  lote_id uuid not null references lotes_puntos(id),
  puntos_consumidos numeric(12, 2) not null check (puntos_consumidos > 0),
  valor_compensable numeric(12, 2) not null,   -- puntos_consumidos * valor_unitario del lote, congelado
  creado_el timestamptz not null default now()
);

create index idx_consumos_canje on consumos_puntos (canje_id);
create index idx_consumos_lote on consumos_puntos (lote_id);
