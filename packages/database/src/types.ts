/**
 * Tipos de dominio escritos a mano, en espejo del esquema en supabase/migrations.
 * Reemplazar/complementar con `pnpm db:types` (supabase gen types) contra un
 * proyecto real apenas exista — ese comando sobreescribe generated.ts, no este archivo.
 */

export type EstadoTransaccion = "pendiente" | "aprobada" | "rechazada" | "cancelada";
export type TipoProducto =
  | "nafta"
  | "nafta_premium"
  | "gasoil"
  | "gasoil_premium"
  | "gnc"
  | "tienda"
  | "lubricantes"
  | "otro";
export type TipoCatalogoCanje = "combustible" | "producto" | "voucher";
export type EstadoCanje = "pendiente" | "confirmado" | "entregado" | "cancelado" | "expirado";
export type RolStaff = "playero" | "encargado" | "admin_red";
export type CanalPush = "web_push" | "fcm";

export interface Red {
  id: string;
  nombre_legal: string;
  marca: string | null;
  slug: string;
  color_primario: string;
  logo_url: string | null;
  activa: boolean;
  creado_el: string;
}

export interface Estacion {
  id: string;
  red_id: string;
  nombre: string;
  slug: string;
  cuit: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  sistema_de_gestion: string | null;
  activa: boolean;
  creado_el: string;
}

export interface Socio {
  id: string;
  red_id: string | null;
  dni: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  consentimiento_datos: boolean;
  consentimiento_datos_el: string | null;
  creado_el: string;
}

export interface Playero {
  id: string;
  estacion_id: string;
  rol: RolStaff;
  nombre: string | null;
  activo: boolean;
  creado_el: string;
}

export interface Producto {
  id: string;
  red_id: string;
  tipo: TipoProducto;
  nombre: string;
  unidad: string;
  activo: boolean;
  creado_el: string;
}

export interface ReglaAcumulacion {
  id: string;
  red_id: string;
  estacion_id: string | null;
  producto_id: string | null;
  tipo_producto: TipoProducto | null;
  puntos_por_peso: number;
  multiplicador: number;
  dias_vencimiento_puntos: number;
  vigente_desde: string;
  vigente_hasta: string | null;
  creado_el: string;
}

export interface Transaccion {
  id: string;
  estacion_id: string;
  socio_id: string | null;
  playero_id: string;
  monto: number;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  mp_status: string | null;
  estado: EstadoTransaccion;
  idempotency_key: string;
  creado_el: string;
  confirmada_el: string | null;
}

export interface TransaccionItem {
  id: string;
  transaccion_id: string;
  producto_id: string;
  litros: number | null;
  monto: number;
}

export interface LotePuntos {
  id: string;
  socio_id: string;
  estacion_emisora_id: string;
  transaccion_id: string;
  puntos_iniciales: number;
  puntos_disponibles: number;
  valor_unitario: number;
  emitido_el: string;
  vence_el: string;
}

export interface ConsumoPuntos {
  id: string;
  canje_id: string;
  lote_id: string;
  puntos_consumidos: number;
  valor_compensable: number;
  creado_el: string;
}

export interface CatalogoCanje {
  id: string;
  red_id: string;
  tipo: TipoCatalogoCanje;
  nombre: string;
  descripcion: string | null;
  costo_puntos: number;
  stock: number | null;
  vigente_desde: string;
  vigente_hasta: string | null;
  activo: boolean;
  creado_el: string;
}

export interface Canje {
  id: string;
  socio_id: string;
  estacion_id: string;
  catalogo_item_id: string;
  puntos_totales: number;
  cupon_codigo: string | null;
  estado: EstadoCanje;
  creado_el: string;
  confirmado_el: string | null;
}

export interface Liquidacion {
  id: string;
  red_id: string;
  periodo: string;
  estacion_deudora_id: string;
  estacion_acreedora_id: string;
  puntos: number;
  neto: number;
  estado: string;
  creado_el: string;
}

export interface PushSubscriptionRow {
  id: string;
  socio_id: string;
  canal: CanalPush;
  endpoint: string | null;
  p256dh: string | null;
  auth_key: string | null;
  fcm_token: string | null;
  activo: boolean;
  creado_el: string;
}
