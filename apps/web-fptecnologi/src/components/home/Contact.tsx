'use client';
import { HOME_DEFAULTS, type Encabezado } from '@/lib/homeContenido';

import { useState } from 'react';
import { Building2, Mail, MapPin, MessageCircle, MessageSquareText, Phone, Send, User, type LucideIcon } from 'lucide-react';
import { useSitio } from '@/context/SitioContext';
import { whatsappHref } from '@/lib/chatActions';
import { ScrollReveal } from './ScrollReveal';
import { SectionBadge } from './SectionBadge';

const itemsDe = (CONTACT_INFO: { address: string; phoneVentas: string; phoneVentasWeb: string; email: string }): { label: string; value: string; href: string; icon: LucideIcon }[] => [
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
export function Contact({ c = HOME_DEFAULTS.contacto }: { c?: Encabezado }) {
  const ITEMS = itemsDe(useSitio().contact);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setCompany('');
        setMessage('');
      } else {
        setErrorMsg(data.error || 'Ocurrió un error al enviar tu mensaje. Inténtalo nuevamente.');
      }
    } catch {
      setErrorMsg('Error de conexión. Inténtalo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const input =
    'mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:border-white/60 focus:bg-white/15 focus:ring-4 focus:ring-white/10';
  const iconCls = 'pointer-events-none absolute left-4 h-5 w-5 text-white/55 transition-colors group-focus-within/field:text-white';

  return (
    <section id="contacto" className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-petrol to-brand-teal py-20 text-white">
      {/* Fondo propio (azul de marca) para separar esta sección del pie de página (bg-ink). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] [background-size:26px_26px]" />
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-teal-light/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-ink/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-start">
        <ScrollReveal direction="left">
          <SectionBadge tone="dark">{c.badge}</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-white">{c.titulo}</span>{' '}
            <span className="title-shimmer-dark">{c.destacado}</span>
          </h2>
          <p className="mt-4 max-w-lg text-white/80">
            {c.descripcion}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ITEMS.map(({ label, value, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="group relative block overflow-hidden rounded-xl border border-white/15 bg-white/10 py-3.5 pl-[4.25rem] pr-4 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15 hover:pl-4 hover:pr-[4.25rem] hover:shadow-xl hover:shadow-black/20"
              >
                {/* Mismo gesto del botón del hero: el ícono viaja de lado a lado
                    (acá al pasar el cursor) mientras el texto ocupa su lugar. */}
                <span className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-white text-brand-primary shadow-md shadow-black/20 transition-all duration-500 ease-out group-hover:left-[calc(100%-3.25rem)] group-hover:bg-brand-primary group-hover:text-white">
                  <Icon className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[360deg]" strokeWidth={1.8} />
                </span>
                <span className="block min-w-0">
                  <span className="block text-xs uppercase tracking-wide text-white/60">{label}</span>
                  <span className="block break-words text-sm font-medium">{value.replace('@', '​@')}</span>
                </span>
              </a>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/20 bg-ink/35 p-6 shadow-2xl shadow-black/25 backdrop-blur-md sm:p-8">
            <div className="space-y-4">
              {success && (
                <div role="status" className="rounded-xl border border-emerald-400/40 bg-emerald-400/15 p-4 text-center text-sm font-medium text-emerald-200">
                  ¡Gracias! Tu mensaje ha sido enviado exitosamente. Un asesor te responderá pronto.
                </div>
              )}
              {errorMsg && (
                <div role="alert" className="rounded-xl border border-rose-400/40 bg-rose-400/15 p-4 text-center text-sm font-medium text-rose-200">
                  {errorMsg}
                </div>
              )}
              <div className="group/field">
                <label className="text-sm text-white/80" htmlFor="c-name">Nombre completo</label>
                <div className="relative flex items-center">
                  <User className={iconCls} strokeWidth={1.8} />
                  <input id="c-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Tu nombre y apellido" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group/field">
                  <label className="text-sm text-white/80" htmlFor="c-email">Correo electrónico</label>
                  <div className="relative flex items-center">
                    <Mail className={iconCls} strokeWidth={1.8} />
                    <input id="c-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="correo@empresa.com" />
                  </div>
                </div>
                <div className="group/field">
                  <label className="text-sm text-white/80" htmlFor="c-phone">Teléfono / WhatsApp</label>
                  <div className="relative flex items-center">
                    <Phone className={iconCls} strokeWidth={1.8} />
                    <input id="c-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="+51 987 654 321" />
                  </div>
                </div>
              </div>
              <div className="group/field">
                <label className="text-sm text-white/80" htmlFor="c-company">Empresa (opcional)</label>
                <div className="relative flex items-center">
                  <Building2 className={iconCls} strokeWidth={1.8} />
                  <input id="c-company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} className={input} placeholder="Nombre de tu empresa" />
                </div>
              </div>
              <div className="group/field">
                <label className="text-sm text-white/80" htmlFor="c-message">Mensaje</label>
                <div className="relative flex items-start">
                  <MessageSquareText className={`${iconCls} top-[1.15rem]`} strokeWidth={1.8} />
                  <textarea
                    id="c-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${input} resize-none`}
                    placeholder="Cuéntanos qué solución o equipamiento necesita tu empresa"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold uppercase tracking-wide text-brand-dark shadow-lg shadow-black/20 transition-colors duration-300 hover:bg-ink hover:text-white disabled:opacity-50"
              >
                <Send className="h-5 w-5" strokeWidth={2} />
                {submitting ? 'Enviando...' : 'Enviar mensaje'}
              </button>
              <p className="text-center text-xs text-white/55">
                Tu solicitud será enviada a nuestro equipo de ventas y registrada en el sistema de leads.
              </p>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
