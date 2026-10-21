import Titulo from '@/components/Titulo';
import { contacto, waUrl } from '@/lib/contacto';

export const metadata = { title: 'Contacto' };

const mapa = 'https://www.google.com/maps/search/?api=1&query=Jr.+Huaraz+1833+Bre%C3%B1a+Lima';
const enlace = 'font-medium text-rojo-hondo underline-offset-2 hover:underline break-words';
const tarjeta = 'rounded-2xl border border-carbon/20 bg-gris p-6';

export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Titulo nivel="h1" claro="Hablemos de" rojo="tu cotización" className="text-4xl sm:text-5xl" />
      <p className="mt-4 max-w-2xl text-carbon/80">Escríbenos o llámanos y te respondemos con una propuesta a tu medida.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className={tarjeta}>
          <h2 className="text-xl font-medium text-carbon">Dirección</h2>
          <p className="mt-3 text-carbon/80">{contacto.razonSocial}<br />{contacto.direccion}</p>
          <a href={mapa} target="_blank" rel="noopener noreferrer" className={`${enlace} mt-4 inline-block`}>Ver en Google Maps (se abre en otra pestaña)</a>
        </section>
        <section className={tarjeta}>
          <h2 className="text-xl font-medium text-carbon">Teléfono</h2>
          <p className="mt-3"><a href={contacto.telefonoHref} className={enlace}>{contacto.telefono}</a></p>
          <a href={waUrl('Hola, quisiera información sobre una cotización.')} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-boton px-6 py-3 font-medium text-white">Escribir por WhatsApp</a>
        </section>
        <section className={`${tarjeta} md:col-span-2`}>
          <h2 className="text-xl font-medium text-carbon">Correo</h2>
          <p className="mt-3 text-carbon/80">Ventas: <a href={`mailto:${contacto.ventas}`} className={enlace}>{contacto.ventas}</a></p>
          <p className="mt-1 text-carbon/80">Comercial: <a href={`mailto:${contacto.comercial}`} className={enlace}>{contacto.comercial}</a></p>
        </section>
      </div>
    </main>
  );
}
