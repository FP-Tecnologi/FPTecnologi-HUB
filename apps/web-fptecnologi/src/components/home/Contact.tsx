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
 * Maps, llamada, WhatsApp, correo) y el formulario. Fondo blanco con el
 * formulario en una tarjeta celeste muy clara (el azul ya no cubre toda la sección). No hay backend de
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
    'mt-1.5 w-full rounded-xl border border-brand-200 bg-white py-3 pl-12 pr-4 text-sm text-ink outline-none transition-all placeholder:text-ink/55 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15';
  const iconCls = 'pointer-events-none absolute left-4 h-5 w-5 text-brand-primary/70 transition-colors group-focus-within/field:text-brand-primary';

  return (
    <section id="contacto" className="relative overflow-hidden border-t border-brand-100 bg-white py-20 text-ink">
      {/* Fondo blanco con un resplandor azul muy suave a cada lado; el color lo lleva el formulario. */}
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-start">
        <ScrollReveal direction="left">
          <SectionBadge>{c.badge}</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{c.titulo}</span>{' '}
            <span className="title-shimmer-light">{c.destacado}</span>
          </h2>
          <p className="mt-4 max-w-lg text-ink/65">
            {c.descripcion}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ITEMS.map(({ label, value, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="group relative block overflow-hidden rounded-xl border border-brand-100 bg-white py-3.5 pl-[4.25rem] pr-4 shadow-sm shadow-brand-950/5 transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-300 hover:pl-4 hover:pr-[4.25rem] hover:shadow-[0_14px_30px_-10px_rgba(16,122,204,0.4)]"
              >
                {/* Mismo gesto del botón del hero: el ícono viaja de lado a lado
                    (acá al pasar el cursor) mientras el texto ocupa su lugar. */}
                <span className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-brand-700 text-white transition-all duration-500 ease-out group-hover:left-[calc(100%-3.25rem)] group-hover:bg-brand-primary">
                  <Icon className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[360deg]" strokeWidth={1.8} />
                </span>
                <span className="block min-w-0">
                  <span className="block text-xs uppercase tracking-wide text-ink/65">{label}</span>
                  <span className="block break-words text-sm font-semibold text-ink">{value.replace('@', '​@')}</span>
                </span>
              </a>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-brand-100 bg-paper p-6 shadow-xl shadow-brand-950/10 sm:p-8">
            <div className="space-y-4">
              {success && (
                <div role="status" className="rounded-xl border border-whatsapp-dark/30 bg-whatsapp/10 p-4 text-center text-sm font-medium text-whatsapp-dark">
                  ¡Gracias! Tu mensaje ha sido enviado exitosamente. Un asesor te responderá pronto.
                </div>
              )}
              {errorMsg && (
                <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
                  {errorMsg}
                </div>
              )}
              <div className="group/field">
                <label className="text-sm font-medium text-ink/80" htmlFor="c-name">Nombre completo</label>
                <div className="relative flex items-center">
                  <User className={iconCls} strokeWidth={1.8} />
                  <input id="c-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Tu nombre y apellido" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group/field">
                  <label className="text-sm font-medium text-ink/80" htmlFor="c-email">Correo electrónico</label>
                  <div className="relative flex items-center">
                    <Mail className={iconCls} strokeWidth={1.8} />
                    <input id="c-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="correo@empresa.com" />
                  </div>
                </div>
                <div className="group/field">
                  <label className="text-sm font-medium text-ink/80" htmlFor="c-phone">Teléfono / WhatsApp</label>
                  <div className="relative flex items-center">
                    <Phone className={iconCls} strokeWidth={1.8} />
                    <input id="c-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="+51 987 654 321" />
                  </div>
                </div>
              </div>
              <div className="group/field">
                <label className="text-sm font-medium text-ink/80" htmlFor="c-company">Empresa (opcional)</label>
                <div className="relative flex items-center">
                  <Building2 className={iconCls} strokeWidth={1.8} />
                  <input id="c-company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} className={input} placeholder="Nombre de tu empresa" />
                </div>
              </div>
              <div className="group/field">
                <label className="text-sm font-medium text-ink/80" htmlFor="c-message">Mensaje</label>
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-primary/30 transition-colors duration-300 hover:bg-[#0b68b8] disabled:opacity-50"
              >
                <Send className="h-5 w-5" strokeWidth={2} />
                {submitting ? 'Enviando...' : 'Enviar mensaje'}
              </button>
              <p className="text-center text-xs text-ink/65">
                Tu solicitud será enviada a nuestro equipo de ventas y registrada en el sistema de leads.
              </p>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
