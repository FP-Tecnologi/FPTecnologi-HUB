import FormReclamacion from '@/components/FormReclamacion';
import ConsultaReclamo from '@/components/ConsultaReclamo';
import BannerPagina from '@/components/BannerPagina';
import { getProveedor } from '@/lib/proveedor';

export const metadata = { title: 'Libro de Reclamaciones' };

export default async function LibroReclamacionesPage() {
  const proveedor = await getProveedor();
  return (
    <main className="bg-white">
      <div className="print:hidden"><BannerPagina titulo="Libro de" resaltado="Reclamaciones" subtitulo="Registra un reclamo o una queja conforme a la Ley 29571." imagen="/fotos/mobiliario-2.jpg" /></div>
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:pb-24">
        <div className="print:hidden">
          <p className="max-w-2xl leading-relaxed text-carbon">
            Conforme a la Ley 29571, Código de Protección y Defensa del Consumidor, y su reglamento, puedes registrar aquí un reclamo o una queja. Responderemos en un plazo máximo de 15 días hábiles. Presentar un reclamo no impide acudir a Indecopi.
          </p>
        </div>
        <div className="mt-8"><FormReclamacion proveedor={proveedor} /></div>
        <section aria-labelledby="h-consulta" className="mt-12 print:hidden">
          <h2 id="h-consulta" className="titulo-menor mb-4 text-2xl text-carbon">Consulta el estado de tu hoja</h2>
          <ConsultaReclamo />
        </section>
      </div>
    </main>
  );
}
