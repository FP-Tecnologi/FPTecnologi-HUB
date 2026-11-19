import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { meta, migas } from "@/lib/seo";
import Reveal from "@/components/Reveal";
import { Hex, Icono, Portada, Seccion } from "@/components/ui";
import { getEmpresa, getPagina } from "@/lib/cms";

export const metadata: Metadata = meta("Contacto", "Contáctanos para una asesoría personalizada en tecnología: Pueblo Libre, Lima.", "/contacto/");

const campo = "mt-1.5 w-full border-2 border-gris/80 bg-white px-5 py-3.5 font-normal outline-none transition focus:border-azul-2 focus:shadow-[0_0_0_4px_rgba(43,84,172,.15)]";

export default async function Contacto() {
  const [EMPRESA, { banner }] = await Promise.all([getEmpresa(), getPagina("contacto")]);
  const datos = [
    ["ubicacion", "Dirección", EMPRESA.direccion, undefined],
    ["telefono", "Teléfono / WhatsApp", EMPRESA.telefono, EMPRESA.whatsapp],
    ["correo", "Correo electrónico", EMPRESA.correo, `mailto:${EMPRESA.correo}`],
    ["reloj", "Horario", EMPRESA.horario, undefined],
  ] as const;
  return (
    <>
      <JsonLd datos={migas("Contacto", "/contacto/")} />
      <Portada etiqueta={banner.etiqueta} a={banner.titulo} b={banner.acento} texto={banner.texto} />

      <Seccion className="bg-white">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-5">
            {datos.map(([n, t, v, h], i) => (
              <Reveal key={t} delay={i * 90} dir="izq">
                <div className="tarjeta grupo flex items-center gap-5 p-6">
                  <Hex n={n} size="h-16 w-16" icon="h-7 w-7" />
                  <div><p className="text-xs font-bold uppercase tracking-widest text-grafito/55">{t}</p>{h ? <a href={h} className="font-semibold text-tinta hover:text-azul-2">{v}</a> : <p className="font-semibold text-tinta">{v}</p>}</div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={400}><a href={EMPRESA.whatsapp} className="btn btn-naranja w-full"><Icono n="whatsapp" className="h-5 w-5" /> Escríbenos por WhatsApp</a></Reveal>
          </div>

          {/* Sitio estático sin backend: el formulario abre el correo del cliente. */}
          <Reveal dir="der">
            <form action={`mailto:${EMPRESA.correo}`} method="post" encType="text/plain" className="tarjeta space-y-5 p-8 sm:p-10">
              <h2 className="titulo text-3xl">Envíanos un <b>mensaje</b></h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-bold text-tinta">Tu nombre<input name="nombre" required className={campo} /></label>
                <label className="block text-sm font-bold text-tinta">Tu correo electrónico<input name="correo" type="email" required className={campo} /></label>
              </div>
              <label className="block text-sm font-bold text-tinta">Asunto<input name="asunto" required className={campo} /></label>
              <label className="block text-sm font-bold text-tinta">Tu mensaje (opcional)<textarea name="mensaje" rows={5} className={campo} /></label>
              <button className="btn btn-azul w-full sm:w-auto">Enviar mensaje <Icono n="flecha" className="h-5 w-5" /></button>
            </form>
          </Reveal>
        </div>
      </Seccion>
    </>
  );
}
