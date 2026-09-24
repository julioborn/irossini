-- Socios (clientes finales, 1:1 con auth.users)
create table socios (
  id uuid primary key references auth.users(id) on delete cascade,
  red_id uuid references redes(id),
  dni text not null,
  nombre text,
  apellido text,
  telefono text,
  fecha_nacimiento date,
  consentimiento_datos boolean not null default false,
  consentimiento_datos_el timestamptz,
  creado_el timestamptz not null default now(),
  unique (red_id, dni)
);

-- Playeros / staff de estación (1:1 con auth.users)
create table playeros (
  id uuid primary key references auth.users(id) on delete cascade,
  estacion_id uuid not null references estaciones(id) on delete cascade,
  rol rol_staff not null default 'playero',
  nombre text,
  activo boolean not null default true,
  creado_el timestamptz not null default now()
);
