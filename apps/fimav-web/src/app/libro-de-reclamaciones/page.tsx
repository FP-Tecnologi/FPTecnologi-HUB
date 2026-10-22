import FormReclamacion from '@/components/FormReclamacion';
import ConsultaReclamo from '@/components/ConsultaReclamo';
import SeccionTitulo from '@/components/SeccionTitulo';
import { getProveedor } from '@/lib/proveedor';

export const metadata = { title: 'Libro de Reclamaciones' };

export default async function LibroReclamacionesPage() {
  const proveedor = await getProveedor();
  return (
    <main className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="print:hidden">
          <SeccionTitulo nivel="h1" tam="lg" claro="Libro de" rojo="Reclamaciones" subtitulo="Registra un reclamo o una queja conforme a la Ley 29571." />
          <p className="mt-6 max-w-2xl leading-relaxed text-carbon">
            Conforme a la Ley 29571, Código de Protección y Defensa del Consumidor, y su reglamento, puedes registrar aquí un reclamo o una queja. Responderemos en un plazo máximo de 15 días hábiles. Presentar un reclamo no impide acudir a Indecopi.
          </p>
        </div>
        <div className="mt-10"><FormReclamacion proveedor={proveedor} /></div>
        <section aria-labelledby="h-consulta" className="mt-12 print:hidden">
          <h2 id="h-consulta" className="titulo-menor mb-4 text-2xl text-carbon">Consulta el estado de tu hoja</h2>
          <ConsultaReclamo />
        </section>
      </div>
    </main>
  );
}
