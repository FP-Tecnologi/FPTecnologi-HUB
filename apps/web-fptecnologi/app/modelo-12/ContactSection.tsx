'use client';

import { useState } from 'react';
import SectionBanner from '@riteflow/components/shortCode/SectionBanner';
import { CONTACT_INFO } from '@/lib/content';

const ITEMS = [
  { label: 'Dirección', value: CONTACT_INFO.address },
  { label: 'Ventas', value: CONTACT_INFO.phoneVentas },
  { label: 'Ventas web', value: CONTACT_INFO.phoneVentasWeb },
  { label: 'Correo', value: CONTACT_INFO.email },
] as const;

/* "Contacto" de Modelo 12 -- no existía en la estructura home-v1 original.
   Mismo patrón que ContactRiteflow.tsx (datos reales de CONTACT_INFO +
   formulario liviano que abre WhatsApp, sin backend de correo -- ver
   AGENTS.md), con el lenguaje visual de Modelo 12 (SectionBanner). */
export function ContactSection() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola, soy ${name}${company ? ` de ${company}` : ''}. ${message}`;
    window.open(`https://wa.me/51908856286?text=${encodeURIComponent(text)}`, '_blank', 'noreferrer');
  };

  return (
    <section id="contacto" className="section-bottom-border relative z-1">
      <div className="container">
        <div className="border-container section-spacing-lg">
          <SectionBanner variant="two" outlineButtonText="Hablemos" title="¿Listo para modernizar tu empresa?" />

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-20 border border-lineColor/70 bg-blue p-6 sm:p-8">
              <p className="text-offWhite/70">
                Un asesor especializado te ayuda a armar la mejor solución, con stock local y tiempos de entrega
                reales.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {ITEMS.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs uppercase tracking-wide text-offWhite/40">{item.label}</p>
                    <p className="mt-1 text-sm font-medium text-offWhite">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-20 border border-lineColor/70 bg-blue p-6 sm:p-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-offWhite/70" htmlFor="m12-name">Nombre</label>
                  <input
                    id="m12-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-[10px] border border-lineColor bg-white px-4 py-2.5 text-sm text-offWhite outline-none placeholder:text-offWhite/30 focus:border-primary"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="text-sm text-offWhite/70" htmlFor="m12-company">Empresa (opcional)</label>
                  <input
                    id="m12-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1.5 w-full rounded-[10px] border border-lineColor bg-white px-4 py-2.5 text-sm text-offWhite outline-none placeholder:text-offWhite/30 focus:border-primary"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                <div>
                  <label className="text-sm text-offWhite/70" htmlFor="m12-message">Mensaje</label>
                  <textarea
                    id="m12-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1.5 w-full resize-none rounded-[10px] border border-lineColor bg-white px-4 py-2.5 text-sm text-offWhite outline-none placeholder:text-offWhite/30 focus:border-primary"
                    placeholder="Contanos qué necesita tu empresa"
                  />
                </div>
                <button
                  type="submit"
                  className="button-primary flex w-full items-center justify-center gap-2 px-[22px] py-3 text-sm font-medium text-white"
                >
                  Enviar por WhatsApp
                </button>
                <p className="text-center text-xs text-offWhite/40">
                  Se abre WhatsApp con tu mensaje ya escrito — no guardamos nada en un servidor.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
