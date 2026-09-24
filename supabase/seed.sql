-- Datos de ejemplo para desarrollo local. No usar en producción.

insert into redes (id, nombre_legal, marca, slug, color_primario)
values ('00000000-0000-0000-0000-000000000001', 'Red de Estaciones Demo S.A.', null, 'demo', '#78BE20');

insert into estaciones (id, red_id, nombre, slug, direccion, lat, lng)
values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Estación Centro', 'centro', 'Av. Siempre Viva 123', -34.6037, -58.3816),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Estación Norte', 'norte', 'Ruta 9 Km 45', -34.5, -58.4);

insert into productos (id, red_id, tipo, nombre, unidad)
values
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'nafta', 'Nafta Súper', 'litro'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'nafta_premium', 'Nafta Premium', 'litro'),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'gasoil', 'Gasoil Común', 'litro'),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'tienda', 'Tienda de Conveniencia', 'unidad');

-- Tasas diferenciadas por producto: combustible común baja, premium media, tienda alta.
insert into reglas_acumulacion (red_id, producto_id, puntos_por_peso, multiplicador, dias_vencimiento_puntos)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', 0.01, 1, 365),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000022', 0.015, 1, 365),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000023', 0.01, 1, 365),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000024', 0.03, 1, 365);
