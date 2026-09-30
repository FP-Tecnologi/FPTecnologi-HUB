'use client';
import { HOME_DEFAULTS, type Encabezado } from '@/lib/homeContenido';

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
export function Contact({ c = HOME_DEFAULTS.contacto }: { c?: Encabezado }) {
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
    'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-teal-light focus:bg-white/10';

  return (
    <section id="contacto" className="bg-ink py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-start">
        <ScrollReveal direction="left">
          <SectionBadge tone="dark">{c.badge}</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-white">{c.titulo}</span>{' '}
            <span className="title-shimmer-dark">{c.destacado}</span>
          </h2>
          <p className="mt-4 max-w-lg text-white/70">
            {c.descripcion}
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
                  <span className="block break-words text-sm font-medium">{value.replace('@', '​@')}</span>
                </span>
              </a>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-8">
            <div className="space-y-4">
              {success && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm font-medium text-emerald-400">
                  ¡Gracias! Tu mensaje ha sido enviado exitosamente. Un asesor te responderá pronto.
                </div>
              )}
              {errorMsg && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm font-medium text-rose-400">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="text-sm text-white/70" htmlFor="c-name">Nombre completo</label>
                <input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Tu nombre y apellido" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-white/70" htmlFor="c-email">Correo electrónico</label>
                  <input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="correo@empresa.com" />
                </div>
                <div>
                  <label className="text-sm text-white/70" htmlFor="c-phone">Teléfono / WhatsApp</label>
                  <input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="+51 987 654 321" />
                </div>
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
                  placeholder="Cuéntanos qué solución o equipamiento necesita tu empresa"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold uppercase tracking-wide text-brand-dark transition-colors duration-300 hover:bg-brand-primary hover:text-white disabled:opacity-50"
              >
                <Mail className="h-5 w-5" strokeWidth={2} />
                {submitting ? 'Enviando...' : 'Enviar mensaje'}
              </button>
              <p className="text-center text-xs text-white/40">
                Tu solicitud será enviada a nuestro equipo de ventas y registrada en el sistema de leads.
              </p>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
