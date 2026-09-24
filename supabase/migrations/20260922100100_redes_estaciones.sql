-- Redes (tenant raíz)
create table redes (
  id uuid primary key default gen_random_uuid(),
  nombre_legal text not null,
  marca text,                        -- nombre de marca visible, se completa después
  slug text unique not null,
  color_primario text not null default '#78BE20',
  logo_url text,
  activa boolean not null default true,
  creado_el timestamptz not null default now()
);

-- Estaciones (sub-tenant)
create table estaciones (
  id uuid primary key default gen_random_uuid(),
  red_id uuid not null references redes(id) on delete cascade,
  nombre text not null,
  slug text not null,
  cuit text,
  direccion text,
  lat double precision,
  lng double precision,
  sistema_de_gestion text,           -- puerta abierta a integración futura con controlador de surtidores
  activa boolean not null default true,
  creado_el timestamptz not null default now(),
  unique (red_id, slug)
);

-- Credenciales de Mercado Pago por estación, separadas de la tabla pública.
-- Sin policies de RLS: deny-all salvo acceso vía service_role desde el backend.
create table estaciones_credenciales_mp (
  estacion_id uuid primary key references estaciones(id) on delete cascade,
  mp_user_id text,
  access_token_cifrado bytea not null,
  refresh_token_cifrado bytea not null,
  mp_public_key text,
  conectada_el timestamptz not null default now(),
  actualizado_el timestamptz not null default now()
);
