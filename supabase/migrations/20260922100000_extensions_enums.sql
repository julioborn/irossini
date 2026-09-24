-- Extensiones
create extension if not exists pgcrypto;

-- Enums
create type estado_transaccion as enum ('pendiente', 'aprobada', 'rechazada', 'cancelada');
create type tipo_producto as enum ('nafta', 'nafta_premium', 'gasoil', 'gasoil_premium', 'gnc', 'tienda', 'lubricantes', 'otro');
create type tipo_catalogo_canje as enum ('combustible', 'producto', 'voucher');
create type estado_canje as enum ('pendiente', 'confirmado', 'entregado', 'cancelado', 'expirado');
create type rol_staff as enum ('playero', 'encargado', 'admin_red');
create type canal_push as enum ('web_push', 'fcm');
