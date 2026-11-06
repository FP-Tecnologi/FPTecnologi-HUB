import type { Metadata } from 'next';
import Banner from '@/components/Banner';
import ConsultaReclamo from '@/components/ConsultaReclamo';
import FormReclamacion from '@/components/FormReclamacion';
import Titulo from '@/components/Titulo';
import { getProveedor } from '@/lib/proveedor';

const descripcion = 'Registra un reclamo o una queja a Imaninki conforme a la Ley 29571. Respondemos en un plazo máximo de 15 días hábiles.';
export const metadata: Metadata = {
  title: 'Libro de Reclamaciones',
  description: descripcion,
  alternates: { canonical: '/libro-de-reclamaciones' },
  openGraph: { title: 'Libro de Reclamaciones | Imaninki', description: descripcion, url: '/libro-de-reclamaciones' },
};

export default async function LibroReclamaciones() {
  const proveedor = await getProveedor();
  return (
    <main id="contenido">
      <div className="print:hidden"><Banner miga="Libro de Reclamaciones" titulo="Registra tu" acento="reclamo o queja" texto="Conforme a la Ley 29571, Código de Protección y Defensa del Consumidor. Presentar un reclamo no impide acudir a Indecopi." foto="/fotos/obrero-casco.webp" /></div>
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <FormReclamacion proveedor={proveedor} />
        <section aria-labelledby="h-consulta" className="mt-16 print:hidden">
          <Titulo etiqueta="Seguimiento" solido="Consulta el estado" acento="de tu hoja" />
          <div className="mt-6"><ConsultaReclamo /></div>
        </section>
      </section>
    </main>
  );
}
