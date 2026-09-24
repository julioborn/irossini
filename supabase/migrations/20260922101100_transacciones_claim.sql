-- Flujo "playero en el loop": la transacción se crea con socio_id null (el
-- playero no sabe quién va a pagar), y el socio la reclama al escanear el QR y
-- confirmar en su app, ANTES de ser redirigido a Mercado Pago. Esto permite que
-- el webhook sepa a quién acreditarle los puntos.

-- Lectura acotada: cualquier socio autenticado puede ver una transacción pendiente
-- y todavía sin reclamar (la necesita para mostrar el resumen de cobro antes de
-- pagar). No expone historial: solo transacciones efímeras y no identificadas.
create policy transacciones_select_pendiente_sin_reclamar on transacciones for select
  using (estado = 'pendiente' and socio_id is null);

-- Única vía para asociar un socio a una transacción. SECURITY DEFINER porque
-- transacciones no tiene (ni debe tener) una policy de UPDATE para 'authenticated':
-- esta función es una excepción angosta y auditable, no una puerta general.
create or replace function asociar_socio_a_transaccion(p_transaccion_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update transacciones
  set socio_id = auth.uid()
  where id = p_transaccion_id
    and estado = 'pendiente'
    and socio_id is null;

  if not found then
    raise exception 'No se pudo asociar el socio a la transacción (ya reclamada, no pendiente, o inexistente)';
  end if;
end;
$$;

revoke all on function asociar_socio_a_transaccion(uuid) from public;
grant execute on function asociar_socio_a_transaccion(uuid) to authenticated;
