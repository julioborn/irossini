/**
 * Firma visual de la app: el saldo de puntos como tablero de combustible, no
 * como un círculo de porcentaje genérico. Conecta con el rubro (estaciones de
 * servicio) y con el anillo del isotipo de marca.
 *
 * El arco es puramente decorativo — no representa un sistema de niveles (todavía
 * no existe en el modelo de datos), así que el relleno es proporcional al saldo
 * contra el próximo múltiplo redondo, no a una meta real. El número es lo único
 * que importa; el arco es atmósfera, no un dato que se pueda leer con precisión.
 */
export function PointsGauge({ puntos }: { puntos: number }) {
  const proximoRedondo = puntos <= 0 ? 500 : Math.ceil((puntos + 1) / 500) * 500;
  const fraccion = proximoRedondo === 0 ? 0 : Math.min(puntos / proximoRedondo, 1);

  const ARCO_VISIBLE = 75; // % de la circunferencia (270°), pathLength=100
  const relleno = ARCO_VISIBLE * fraccion;

  return (
    <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-[225deg]">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${ARCO_VISIBLE} 100`}
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${relleno} 100`}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78BE20" />
            <stop offset="100%" stopColor="#C8F072" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-bold tabular-nums text-white">
          {puntos.toLocaleString("es-AR")}
        </span>
        <span className="mt-1 text-xs font-medium uppercase tracking-wide text-white/70">
          puntos disponibles
        </span>
      </div>
    </div>
  );
}
