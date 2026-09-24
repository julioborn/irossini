import { BRAND_NAME } from "@irossini/core";

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10 text-neutral-800">
      <h1 className="mb-4 text-2xl font-semibold">Política de privacidad</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Placeholder — completar con el texto legal definitivo antes de salir a producción.
      </p>

      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          {BRAND_NAME} (en adelante, "la Red") recolecta tu Documento Nacional de Identidad (DNI) y
          datos de tus consumos en las estaciones de servicio adheridas, con la finalidad exclusiva de
          administrar el programa de puntos y beneficios.
        </p>
        <p>
          El tratamiento de tus datos personales se realiza de conformidad con la Ley 25.326 de
          Protección de Datos Personales de la República Argentina. Tenés derecho de acceso,
          rectificación y supresión de tus datos, conforme lo establece dicha ley.
        </p>
        <p>
          Tus datos de consumo pueden incluir geolocalización de la estación en la que operás una
          transacción. No compartimos tus datos personales con terceros ajenos a la operación del
          programa de puntos, salvo requerimiento legal.
        </p>
        <p>
          La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley
          25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con
          relación al incumplimiento de las normas sobre protección de datos personales.
        </p>
      </div>
    </main>
  );
}
