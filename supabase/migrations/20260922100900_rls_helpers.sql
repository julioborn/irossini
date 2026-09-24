-- Funciones helper para las policies de RLS. Son SECURITY DEFINER para poder leer
-- playeros/estaciones sin disparar recursión con las policies de esas mismas tablas.

create or replace function auth_estacion_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select estacion_id from playeros where id = auth.uid()
$$;

create or replace function auth_rol_staff()
returns rol_staff
language sql stable security definer set search_path = public as $$
  select rol from playeros where id = auth.uid()
$$;

create or replace function auth_red_id_staff()
returns uuid
language sql stable security definer set search_path = public as $$
  select e.red_id
  from estaciones e
  join playeros p on p.estacion_id = e.id
  where p.id = auth.uid()
$$;

create or replace function auth_red_id_socio()
returns uuid
language sql stable security definer set search_path = public as $$
  select red_id from socios where id = auth.uid()
$$;
