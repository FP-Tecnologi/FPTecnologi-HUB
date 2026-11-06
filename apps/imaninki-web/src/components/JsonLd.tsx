/** Datos estructurados (schema.org) para buscadores y asistentes de IA. El `<` se escapa para que nada cierre el script. */
export default function JsonLd({ datos }: { datos: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, '\\u003c') }} />;
}
