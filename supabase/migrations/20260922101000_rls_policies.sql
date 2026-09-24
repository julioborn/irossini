-- Habilitar RLS en todas las tablas del dominio.
alter table redes enable row level security;
alter table estaciones enable row level security;
alter table estaciones_credenciales_mp enable row level security;  -- sin policies: deny-all salvo service_role
alter table socios enable row level security;
alter table playeros enable row level security;
alter table productos enable row level security;
alter table reglas_acumulacion enable row level security;
alter table transacciones enable row level security;
alter table transaccion_items enable row level security;
alter table lotes_puntos enable row level security;
alter table consumos_puntos enable row level security;
alter table catalogo_canjes enable row level security;
alter table canjes enable row level security;
alter table liquidaciones enable row level security;
alter table push_subscriptions enable row level security;

-- ── redes: lectura pública de datos de marca (pantalla de login) ──
create policy redes_select on redes for select using (activa);

-- ── estaciones: staff de su propia red + socios de esa red (mapa) ──
create policy estaciones_select_staff on estaciones for select
  using (red_id = auth_red_id_staff());

create policy estaciones_select_socio on estaciones for select
  using (red_id = auth_red_id_socio());

-- estaciones_credenciales_mp: intencionalmente sin policies (deny-all para
-- anon/authenticated). Solo accesible con la service_role key desde el backend.

-- ── socios: cada uno ve/edita únicamente su propia fila (DNI es dato sensible) ──
create policy socios_select_self on socios for select using (id = auth.uid());
create policy socios_update_self on socios for update using (id = auth.uid());
create policy socios_insert_self on socios for insert with check (id = auth.uid());

-- ── playeros: su propia fila + admin_red ve todo el staff de su red ──
create policy playeros_select_self on playeros for select using (id = auth.uid());
create policy playeros_select_admin on playeros for select
  using (
    auth_rol_staff() = 'admin_red'
    and estacion_id in (select id from estaciones where red_id = auth_red_id_staff())
  );

-- ── productos: lectura para staff y socios de la red; escritura solo admin_red ──
create policy productos_select on productos for select
  using (red_id = auth_red_id_staff() or red_id = auth_red_id_socio());

create policy productos_admin_write on productos for all
  using (auth_rol_staff() = 'admin_red' and red_id = auth_red_id_staff())
  with check (auth_rol_staff() = 'admin_red' and red_id = auth_red_id_staff());

-- ── reglas_acumulacion: lectura para staff y socios de la red; escritura solo admin_red ──
create policy reglas_select on reglas_acumulacion for select
  using (red_id = auth_red_id_staff() or red_id = auth_red_id_socio());

create policy reglas_admin_write on reglas_acumulacion for all
  using (auth_rol_staff() = 'admin_red' and red_id = auth_red_id_staff())
  with check (auth_rol_staff() = 'admin_red' and red_id = auth_red_id_staff());

-- ── transacciones: la estación ve SOLO las suyas; el socio ve las suyas cross-estación ──
create policy transacciones_select_estacion on transacciones for select
  using (estacion_id = auth_estacion_id());

create policy transacciones_select_socio on transacciones for select
  using (socio_id = auth.uid());

-- Alta: solo el playero autenticado, para su propia estación, siempre en estado 'pendiente'.
create policy transacciones_insert_playero on transacciones for insert
  with check (
    estacion_id = auth_estacion_id()
    and playero_id = auth.uid()
    and estado = 'pendiente'
  );

-- Sin policy de UPDATE para 'authenticated': el pasaje a 'aprobada'/'rechazada' lo
-- hace exclusivamente el webhook de Mercado Pago con la service_role key.

create policy transaccion_items_select on transaccion_items for select
  using (
    exists (
      select 1 from transacciones t
      where t.id = transaccion_items.transaccion_id
        and (t.estacion_id = auth_estacion_id() or t.socio_id = auth.uid())
    )
  );

create policy transaccion_items_insert on transaccion_items for insert
  with check (
    exists (
      select 1 from transacciones t
      where t.id = transaccion_items.transaccion_id
        and t.estacion_id = auth_estacion_id()
    )
  );

-- ── lotes_puntos: el socio ve su saldo cross-estación; la estación ve SOLO lo que ELLA emitió ──
create policy lotes_select_socio on lotes_puntos for select using (socio_id = auth.uid());
create policy lotes_select_estacion on lotes_puntos for select using (estacion_emisora_id = auth_estacion_id());

-- Sin insert/update/delete para 'authenticated': solo el motor de acumulación
-- (service_role), disparado desde el webhook confirmado.

-- ── consumos_puntos: socio dueño del canje, estación emisora del lote consumido,
--    o estación donde se realizó el canje. Nunca el historial cross-estación completo. ──
create policy consumos_select on consumos_puntos for select
  using (
    exists (select 1 from canjes c where c.id = consumos_puntos.canje_id and c.socio_id = auth.uid())
    or exists (select 1 from lotes_puntos l where l.id = consumos_puntos.lote_id and l.estacion_emisora_id = auth_estacion_id())
    or exists (select 1 from canjes c where c.id = consumos_puntos.canje_id and c.estacion_id = auth_estacion_id())
  );

-- Sin insert/update/delete para 'authenticated': solo la función de consumo FIFO
-- (service_role), disparada al confirmar un canje.

-- ── catalogo_canjes: lectura para todos los de la red; escritura solo admin_red ──
create policy catalogo_select on catalogo_canjes for select
  using (red_id = auth_red_id_staff() or red_id = auth_red_id_socio());

create policy catalogo_admin_write on catalogo_canjes for all
  using (auth_rol_staff() = 'admin_red' and red_id = auth_red_id_staff())
  with check (auth_rol_staff() = 'admin_red' and red_id = auth_red_id_staff());

-- ── canjes: la estación ve los que RECIBIÓ; el socio ve los suyos ──
create policy canjes_select_estacion on canjes for select using (estacion_id = auth_estacion_id());
create policy canjes_select_socio on canjes for select using (socio_id = auth.uid());

create policy canjes_insert_socio on canjes for insert
  with check (socio_id = auth.uid() and estado = 'pendiente');

create policy canjes_update_estacion on canjes for update
  using (estacion_id = auth_estacion_id());

-- ── liquidaciones: solo las estaciones involucradas, o admin_red de la red ──
create policy liquidaciones_select on liquidaciones for select
  using (
    estacion_deudora_id = auth_estacion_id()
    or estacion_acreedora_id = auth_estacion_id()
    or (auth_rol_staff() = 'admin_red' and red_id = auth_red_id_staff())
  );

-- ── push_subscriptions: cada socio gestiona únicamente las suyas ──
create policy push_subscriptions_self on push_subscriptions for all
  using (socio_id = auth.uid())
  with check (socio_id = auth.uid());
