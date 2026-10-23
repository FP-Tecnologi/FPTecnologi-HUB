import { Suspense } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import FormCotizar from '@/components/FormCotizar';
import BannerPagina from '@/components/BannerPagina';
import Reveal from '@/components/motion/Reveal';
import { getCategorias, getContacto, getPagina, waUrlDe } from '@/lib/cms';

export const metadata = { title: 'Cotizar' };

export default async function CotizarPage() {
  const [c, contacto, categorias] = await Promise.all([getPagina('cotizar'), getContacto(), getCategorias()]);
  const waUrl = (t: string) => waUrlDe(contacto.whatsapp, t);
  return (
    <main>
      <BannerPagina eyebrow={c.banner.eyebrow} titulo={c.banner.titulo} resaltado={c.banner.resaltado} imagen={c.banner.imagen} posicion="center 30%" />
      <Reveal className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:pb-24">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
          <Suspense fallback={<p className="rounded-2xl bg-gris p-6 text-carbon">Cargando formulario…</p>}>
            <FormCotizar categorias={categorias.map(({ slug, nombre }) => ({ slug, nombre }))} />
          </Suspense>
          <aside className="rounded-2xl bg-gris p-6">
            <h2 className="titulo-menor text-xl text-carbon">{c.asesor.titulo}</h2>
            <ul className="mt-4 space-y-3 text-carbon">
              <li>
                <a href={contacto.telefonoHref} className="flex min-h-11 items-center gap-3 hover:underline">
                  <Phone aria-hidden="true" size={18} className="shrink-0" /> {contacto.telefono}
                </a>
              </li>
              <li>
                <a href={`mailto:${contacto.ventas}`} className="flex min-h-11 items-center gap-3 break-all hover:underline">
                  <Mail aria-hidden="true" size={18} className="shrink-0" /> {contacto.ventas}
                </a>
              </li>
              <li>
                <a href={waUrl('Hola Fimav, quiero una cotización.')} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-3 hover:underline">
                  <MessageCircle aria-hidden="true" size={18} className="shrink-0" /> WhatsApp
                </a>
              </li>
            </ul>
            <p className="mt-4 text-sm text-carbon/80">{contacto.direccion}</p>
          </aside>
        </div>
      </Reveal>
    </main>
  );
}
