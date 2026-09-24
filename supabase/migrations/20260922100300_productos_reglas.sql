-- Catálogo de productos (por red)
create table productos (
  id uuid primary key default gen_random_uuid(),
  red_id uuid not null references redes(id) on delete cascade,
  tipo tipo_producto not null,
  nombre text not null,
  unidad text not null default 'litro',   -- litro | unidad
  activo boolean not null default true,
  creado_el timestamptz not null default now()
);

-- Reglas de acumulación: configurables por red y/o por estación, por producto o por tipo de producto.
create table reglas_acumulacion (
  id uuid primary key default gen_random_uuid(),
  red_id uuid not null references redes(id) on delete cascade,
  estacion_id uuid references estaciones(id) on delete cascade,   -- null = aplica a toda la red
  producto_id uuid references productos(id) on delete cascade,
  tipo_producto tipo_producto,                                    -- alternativa genérica a producto_id
  puntos_por_peso numeric(10, 4) not null,
  multiplicador numeric(6, 3) not null default 1,
  dias_vencimiento_puntos integer not null default 365,
  vigente_desde timestamptz not null default now(),
  vigente_hasta timestamptz,
  creado_el timestamptz not null default now(),
  check (producto_id is not null or tipo_producto is not null)
);

create index idx_reglas_acumulacion_vigencia on reglas_acumulacion (red_id, estacion_id, vigente_desde, vigente_hasta);
