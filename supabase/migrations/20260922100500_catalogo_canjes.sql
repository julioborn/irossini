-- Catálogo de canjes (creado antes que consumos_puntos por la FK de canjes.catalogo_item_id)
create table catalogo_canjes (
  id uuid primary key default gen_random_uuid(),
  red_id uuid not null references redes(id) on delete cascade,
  tipo tipo_catalogo_canje not null,
  nombre text not null,
  descripcion text,
  costo_puntos numeric(12, 2) not null,
  stock integer,                     -- null = ilimitado
  vigente_desde timestamptz not null default now(),
  vigente_hasta timestamptz,
  activo boolean not null default true,
  creado_el timestamptz not null default now()
);

create table canjes (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid not null references socios(id),
  estacion_id uuid not null references estaciones(id),   -- estación donde se retira / canjea
  catalogo_item_id uuid not null references catalogo_canjes(id),
  puntos_totales numeric(12, 2) not null,
  cupon_codigo text unique,
  estado estado_canje not null default 'pendiente',
  creado_el timestamptz not null default now(),
  confirmado_el timestamptz
);

create index idx_canjes_socio on canjes (socio_id, creado_el desc);
create index idx_canjes_estacion on canjes (estacion_id, creado_el desc);
