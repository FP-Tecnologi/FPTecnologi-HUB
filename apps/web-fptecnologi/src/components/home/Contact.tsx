'use client';

import { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/content';
import { whatsappHref } from '@/lib/chatActions';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

const ITEMS: { label: string; value: string; href: string; icon: LucideIcon }[] = [
  {
    label: 'Dirección',
    value: CONTACT_INFO.address,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`,
    icon: MapPin,
  },
  { label: 'Ventas', value: CONTACT_INFO.phoneVentas, href: `tel:${CONTACT_INFO.phoneVentas.replace(/\s/g, '')}`, icon: Phone },
  { label: 'Ventas web', value: CONTACT_INFO.phoneVentasWeb, href: whatsappHref(), icon: MessageCircle },
  { label: 'Correo', value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}`, icon: Mail },
];

/*
 * "Hablemos" -- 2 columnas: título + datos de contacto (cada uno es un link:
 * Maps, llamada, WhatsApp, correo) y el formulario. Fondo del color del
 * footer (bg-ink) para que cierre la página junto con él. No hay backend de
 * correo (ver AGENTS.md): el formulario arma el mensaje y abre WhatsApp.
 */
export function Contact() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola, soy ${name}${company ? ` de ${company}` : ''}. ${message}`;
    window.open(whatsappHref(text), '_blank', 'noreferrer');
  };

  const input =
    'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-teal-light focus:bg-white/10';

  return (
    <section id="contacto" className="bg-ink py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-start">
        <ScrollReveal direction="left">
          <SectionBadge tone="dark">Hablemos</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-white">¿Listo para modernizar</span>{' '}
            <span className="title-shimmer-dark">la tecnología de tu empresa?</span>
          </h2>
          <p className="mt-4 max-w-lg text-white/70">
            Escríbenos y un asesor especializado te ayuda a armar la mejor solución para tu negocio, con stock local y
            tiempos de entrega reales.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ITEMS.map(({ label, value, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/50 hover:bg-white/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-dark text-white transition-colors group-hover:bg-brand-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wide text-white/50">{label}</span>
                  <span className="block break-words text-sm font-medium">{value}</span>
                </span>
              </a>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70" htmlFor="c-name">Nombre</label>
                <input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-sm text-white/70" htmlFor="c-company">Empresa (opcional)</label>
                <input id="c-company" value={company} onChange={(e) => setCompany(e.target.value)} className={input} placeholder="Nombre de tu empresa" />
              </div>
              <div>
                <label className="text-sm text-white/70" htmlFor="c-message">Mensaje</label>
                <textarea
                  id="c-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${input} resize-none`}
                  placeholder="Cuéntanos qué necesita tu empresa"
                />
              </div>
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold uppercase tracking-wide text-brand-dark transition-colors duration-300 hover:bg-brand-primary hover:text-white"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={2} />
                Enviar por WhatsApp
              </button>
              <p className="text-center text-xs text-white/40">
                Se abre WhatsApp con tu mensaje ya escrito, no guardamos nada en un servidor.
              </p>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
