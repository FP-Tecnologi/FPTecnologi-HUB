'use client';

import { useState } from 'react';
import { CONTACT_INFO } from '@/lib/content';

const ITEMS = [
  { label: 'Dirección', value: CONTACT_INFO.address },
  { label: 'Ventas', value: CONTACT_INFO.phoneVentas },
  { label: 'Ventas web', value: CONTACT_INFO.phoneVentasWeb },
  { label: 'Correo', value: CONTACT_INFO.email },
] as const;

/* "Contacto" de la estructura final -- mismos datos reales de CONTACT_INFO
   que ya usa site/Contact.tsx, más un formulario liviano de verdad: no hay
   backend de envío de correo en este proyecto (ver AGENTS.md), así que el
   submit arma el mensaje y lo manda por WhatsApp real (mismo número que ya
   usa el sitio) -- no se simula un "enviado" que no ocurrió. */
export function ContactRiteflow() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola, soy ${name}${company ? ` de ${company}` : ''}. ${message}`;
    window.open(`https://wa.me/51908856286?text=${encodeURIComponent(text)}`, '_blank', 'noreferrer');
  };

  return (
    <section id="contacto" className="bg-[#0e1422] py-14 md:py-20 lg:py-24 xl:py-[100px]">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <span className="inline-block rounded-[10px] border-[1.5px] border-[#2181af] bg-[#1c2a38] px-3 py-1.5 text-sm font-medium text-[#2181af]">
              Hablemos
            </span>
            <h2
              className="mt-5 text-4xl font-semibold !leading-[1.2] sm:text-5xl"
              style={{
                background: 'linear-gradient(180deg, #f8f8f8 62.71%, #2181af 90.4%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ¿Listo para modernizar tu empresa?
            </h2>
            <p className="mt-4 text-[#fbfbfb]/80">
              Un asesor especializado te ayuda a armar la mejor solución, con stock local y tiempos de entrega
              reales.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {ITEMS.map((item) => (
                <div key={item.label}>
                  <p className="text-xs uppercase tracking-wide text-[#fbfbfb]/40">{item.label}</p>
                  <p className="mt-1 text-sm font-medium text-[#fbfbfb]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#2d3a57]/70 bg-gradient-to-b from-[#18778b]/10 to-[#155382]/10 p-6 sm:p-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#fbfbfb]/70" htmlFor="rf-name">Nombre</label>
                <input
                  id="rf-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-[10px] border border-[#2d3a57] bg-[#1c2a38] px-4 py-2.5 text-sm text-[#fbfbfb] outline-none placeholder:text-[#fbfbfb]/30 focus:border-[#2181af]"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="text-sm text-[#fbfbfb]/70" htmlFor="rf-company">Empresa (opcional)</label>
                <input
                  id="rf-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1.5 w-full rounded-[10px] border border-[#2d3a57] bg-[#1c2a38] px-4 py-2.5 text-sm text-[#fbfbfb] outline-none placeholder:text-[#fbfbfb]/30 focus:border-[#2181af]"
                  placeholder="Nombre de tu empresa"
                />
              </div>
              <div>
                <label className="text-sm text-[#fbfbfb]/70" htmlFor="rf-message">Mensaje</label>
                <textarea
                  id="rf-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full resize-none rounded-[10px] border border-[#2d3a57] bg-[#1c2a38] px-4 py-2.5 text-sm text-[#fbfbfb] outline-none placeholder:text-[#fbfbfb]/30 focus:border-[#2181af]"
                  placeholder="Contanos qué necesita tu empresa"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-[10px] px-[22px] py-3 text-sm font-medium text-white"
                style={{ background: 'linear-gradient(to bottom, #18778b 0%, #155382 51%, #18778b 100%)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.1 1.5 0 .5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
                </svg>
                Enviar por WhatsApp
              </button>
              <p className="text-center text-xs text-[#fbfbfb]/40">
                Se abre WhatsApp con tu mensaje ya escrito — no guardamos nada en un servidor.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
