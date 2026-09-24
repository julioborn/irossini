// Barrel client-safe: únicamente una constante, sin dependencias de Node ni de
// service_role. Todo lo demás vive en subpaths server-only separados
// (@irossini/core/puntos, @irossini/core/mercadopago, @irossini/core/notifications)
// para que nunca termine arrastrado al bundle del navegador por un import
// transitivo — ver el barrel de cada uno para el motivo.
export * from "./config/brand";
