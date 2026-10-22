import BannerPagina from '@/components/BannerPagina';
import { MapPin, MessageCircle, Phone, Mail, Navigation, ExternalLink } from 'lucide-react';
import BotonHex from '@/components/hex/BotonHex';
import SeccionTitulo from '@/components/SeccionTitulo';
import FormContacto from '@/components/FormContacto';
import Reveal from '@/components/motion/Reveal';
import { contacto, waUrl } from '@/lib/contacto';

export const metadata = { title: 'Contacto' };

const lugar = encodeURIComponent('Jr. Huaraz 1833, Breña, Lima');
const verMapa = `https://www.google.com/maps/search/?api=1&query=${lugar}`;
const comoLlegar = `https://www.google.com/maps/dir/?api=1&destination=${lugar}`;
const incrustado = `https://www.google.com/maps?q=${lugar}&output=embed`;

const enlace = 'inline-flex min-h-11 items-center gap-2 font-medium text-rojo-hondo underline underline-offset-2 hover:text-boton break-words';
const tarjeta = 'rounded-2xl border border-carbon/20 bg-gris p-6';
const icono = 'mb-3 flex size-12 items-center justify-center rounded-xl bg-carbon text-white';

export default function ContactoPage() {
  return (
    <main>
      <BannerPagina titulo="Hablemos de" resaltado="tu cotización" subtitulo="Escríbenos o llámanos y te respondemos con una propuesta a tu medida." imagen="/fondos/contacto.jpg" />

      <section className="bg-white py-16">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <SeccionTitulo nivel="h2" claro="Datos de" rojo="contacto" subtitulo="Estamos para atenderte." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className={tarjeta}>
              <span aria-hidden="true" className={icono}><MapPin size={24} /></span>
              <h3 className="titulo-menor text-xl text-carbon">Dirección</h3>
              <p className="mt-3 text-carbon">{contacto.razonSocial}<br />{contacto.direccion}</p>
            </div>
            <div className={tarjeta}>
              <span aria-hidden="true" className={icono}><Phone size={24} /></span>
              <h3 className="titulo-menor text-xl text-carbon">Teléfono</h3>
              <p className="mt-3"><a href={contacto.telefonoHref} className={enlace}>{contacto.telefono}</a></p>
            </div>
            <div className={tarjeta}>
              <span aria-hidden="true" className={icono}><MessageCircle size={24} /></span>
              <h3 className="titulo-menor text-xl text-carbon">WhatsApp</h3>
              <p className="mt-3 text-carbon">Cotiza y consulta por chat.</p>
              <BotonHex href={waUrl('Hola, quisiera información sobre una cotización.')} icono={MessageCircle} className="mt-4">Escribir por WhatsApp</BotonHex>
            </div>
            <div className={tarjeta}>
              <span aria-hidden="true" className={icono}><Mail size={24} /></span>
              <h3 className="titulo-menor text-xl text-carbon">Correo</h3>
              <p className="mt-3 text-carbon">Ventas:<br /><a href={`mailto:${contacto.ventas}`} className={enlace}>{contacto.ventas}</a></p>
              <p className="mt-1 text-carbon">Comercial:<br /><a href={`mailto:${contacto.comercial}`} className={enlace}>{contacto.comercial}</a></p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-gris py-16">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <SeccionTitulo nivel="h2" claro="Cómo" rojo="llegar" subtitulo="Jr. Huaraz 1833, Breña, Lima." />
          <div className="mt-8 h-96 overflow-hidden rounded-[2rem] border border-carbon/20 bg-white sm:h-[26rem]">
            <iframe src={incrustado} title="Mapa: ubicación de Fimav Perú, Jr. Huaraz 1833, Breña, Lima" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="size-full border-0" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
            <a href={verMapa} target="_blank" rel="noopener noreferrer" className={enlace}><ExternalLink aria-hidden="true" size={18} />Abrir en Google Maps<span className="sr-only"> (se abre en otra pestaña)</span></a>
            <a href={comoLlegar} target="_blank" rel="noopener noreferrer" className={enlace}><Navigation aria-hidden="true" size={18} />Cómo llegar<span className="sr-only"> (se abre en otra pestaña)</span></a>
          </div>
          <p className="mt-2 text-sm text-carbon">Mapa proporcionado por Google.</p>
        </Reveal>
      </section>

      <section className="bg-white py-16">
        <Reveal className="mx-auto max-w-3xl px-4 sm:px-6">
          <SeccionTitulo nivel="h2" claro="Escríbenos" rojo="un mensaje" subtitulo="Te respondemos a la brevedad." />
          <div className="mt-8"><FormContacto /></div>
        </Reveal>
      </section>
    </main>
  );
}
