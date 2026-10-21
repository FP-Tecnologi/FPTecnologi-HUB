import FormReclamacion from '@/components/FormReclamacion';
import ConsultaReclamo from '@/components/ConsultaReclamo';
import Titulo from '@/components/Titulo';
import { getProveedor } from '@/lib/proveedor';

export const metadata = { title: 'Libro de Reclamaciones' };

export default async function LibroReclamacionesPage() {
  const proveedor = await getProveedor();
  return (
    <main className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="print:hidden">
          <Titulo nivel="h1" claro="Libro de" rojo="Reclamaciones" className="text-4xl sm:text-5xl" />
          <p className="mt-4 max-w-2xl leading-relaxed text-carbon">
            Conforme a la Ley 29571, Código de Protección y Defensa del Consumidor, y su reglamento, puedes registrar aquí un reclamo o una queja. Responderemos en un plazo máximo de 15 días hábiles. Presentar un reclamo no impide acudir a Indecopi.
          </p>
        </div>
        <div className="mt-10"><FormReclamacion proveedor={proveedor} /></div>
        <section aria-labelledby="h-consulta" className="mt-12 print:hidden">
          <h2 id="h-consulta" className="mb-4 text-2xl font-medium text-carbon">Consulta el estado de tu hoja</h2>
          <ConsultaReclamo />
        </section>
      </div>
    </main>
  );
}
