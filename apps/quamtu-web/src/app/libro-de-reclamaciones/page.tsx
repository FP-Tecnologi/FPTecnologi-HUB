import { ShieldCheck } from 'lucide-react';
import FormReclamacion from '@/components/FormReclamacion';
import ConsultaReclamo from '@/components/ConsultaReclamo';
import { getProveedor } from '@/lib/proveedor';

const descripcion = 'Registra un reclamo o una queja a Quamtu conforme a la Ley 29571. Respondemos en un plazo máximo de 15 días hábiles.';
export const metadata = {
  title: 'Libro de Reclamaciones — Quamtu',
  description: descripcion,
  alternates: { canonical: '/libro-de-reclamaciones' },
  openGraph: { title: 'Libro de Reclamaciones — Quamtu', description: descripcion, url: '/libro-de-reclamaciones' },
};

export default async function LibroReclamacionesPage() {
  const proveedor = await getProveedor();
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-5 sm:pt-28">
      <div className="print:hidden">
        <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">Libro de <span className="titulo-neon">Reclamaciones</span></h1>
        <p className="mt-4 flex max-w-2xl items-start gap-3 text-slate-300">
          <ShieldCheck aria-hidden="true" size={20} className="mt-1 shrink-0 text-claro" />
          <span>
            Conforme a la Ley 29571, Código de Protección y Defensa del Consumidor, y su reglamento, puedes registrar aquí un reclamo o una queja. Responderemos en un plazo máximo de 15 días hábiles. Presentar un reclamo no impide acudir a Indecopi.
          </span>
        </p>
      </div>
      <div className="mt-8"><FormReclamacion proveedor={proveedor} /></div>
      <section aria-labelledby="h-consulta" className="mt-14 print:hidden">
        <h2 id="h-consulta" className="mb-4 font-display text-2xl font-bold">Consulta el <span className="titulo-neon">estado</span> de tu hoja</h2>
        <ConsultaReclamo />
      </section>
    </main>
  );
}
