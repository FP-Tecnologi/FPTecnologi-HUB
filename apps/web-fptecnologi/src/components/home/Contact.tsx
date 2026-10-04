'use client';
import { HOME_DEFAULTS, type Encabezado } from '@/lib/homeContenido';

import { useState } from 'react';
import { Mail, MapPin, MessageCircle, MessageSquareText, Phone, User, type LucideIcon } from 'lucide-react';
import { useSitio } from '@/context/SitioContext';
import { whatsappHref } from '@/lib/chatActions';
import { ArrowUpRightIcon } from '@/components/site/icons';
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
const MOTIVOS = ['Cotización', 'Servicios TI', 'Ser partner', 'Soporte', 'Otro'] as const;

/* `conDatos`: muestra a la izquierda las tarjetas de dirección/teléfonos/correo (home). En /contacto
   esos datos ya están en «Contacto por área», así que se pasa conDatos={false}: título arriba y el
   formulario a todo el ancho. El motivo elegido se antepone al mensaje: «[Motivo: …]». */
export function Contact({ c = HOME_DEFAULTS.contacto, conDatos = true }: { c?: Encabezado; conDatos?: boolean }) {
  const ITEMS = itemsDe(useSitio().contact);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [motivo, setMotivo] = useState<(typeof MOTIVOS)[number]>(MOTIVOS[0]);
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
        body: JSON.stringify({ name, email, phone, message: `[Motivo: ${motivo}] ${message}` }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
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
    'mt-1.5 w-full rounded-xl border border-brand-200 bg-white py-3 pl-12 pr-4 text-sm text-ink outline-none transition-all placeholder:text-ink/55 focus:border-brand-primary';
  const iconCls = 'pointer-events-none absolute left-4 h-5 w-5 text-brand-primary/70 transition-colors group-focus-within/field:text-brand-primary';

  return (
    <section id="contacto" className="relative overflow-hidden border-t border-brand-100 bg-white py-20 text-ink">
      {/* Fondo blanco con retícula azul tenue que se desvanece, y resplandores suaves; el color lo lleva el formulario. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(16_122_204/0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgb(16_122_204/0.07)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_80%_80%_at_70%_40%,black,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />

      <div className={`relative mx-auto grid gap-12 px-6 ${conDatos ? 'max-w-7xl lg:grid-cols-2 lg:items-start' : 'max-w-3xl'}`}>
        <ScrollReveal direction="left" className={conDatos ? '' : 'text-center'}>
          <SectionBadge>{c.badge}</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{c.titulo}</span>{' '}
            <span className="title-shimmer-light">{c.destacado}</span>
          </h2>
          <p className={`mt-4 max-w-lg text-ink/65 ${conDatos ? '' : 'mx-auto'}`}>
            {c.descripcion}
          </p>

          {conDatos && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ITEMS.map(({ label, value, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="group flex items-center gap-3.5 rounded-xl border border-brand-100 bg-white p-3.5 shadow-sm shadow-brand-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary hover:shadow-[0_16px_32px_-10px_rgba(16,122,204,0.6)]"
              >
                {/* Hover notorio: la tarjeta se rellena de azul primario, el texto pasa a blanco y el ícono flota y gira un poco. */}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-primary transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-white group-hover:text-brand-primary">
                  {/* .icon-hop: el ícono "salta" flotando al pasar el cursor (efecto definido en globals.css). */}
                  <Icon className="icon-hop h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="block min-w-0">
                  <span className="block text-xs uppercase tracking-wide text-ink/65 transition-colors duration-300 group-hover:text-white/90">{label}</span>
                  <span className="block break-words text-sm font-semibold text-ink transition-colors duration-300 group-hover:text-white">{value.replace('@', '​@')}</span>
                </span>
              </a>
            ))}
          </div>
          )}
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          <form onSubmit={handleSubmit} className="group/form relative overflow-hidden rounded-2xl border border-brand-100 bg-paper p-6 shadow-xl shadow-brand-950/10 sm:p-8">
            {/* La línea azul superior solo aparece (crece desde la izquierda) cuando se empieza a escribir. */}
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-primary via-brand-500 to-brand-700 transition-transform duration-500 ease-out group-focus-within/form:scale-x-100" />
            <div className="mb-5">
              <p className="font-display text-xl font-bold text-ink">Déjanos tu mensaje</p>
              <p className="mt-1 text-sm text-ink/65">Un asesor te responderá pronto.</p>
            </div>
            <fieldset className="mb-5">
              <legend className="text-sm font-medium text-ink/80">Motivo<span className="text-red-500"> *</span></legend>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Motivo del mensaje">
                {MOTIVOS.map((m) => {
                  const activo = motivo === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => setMotivo(m)}
                      className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${activo ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-200 bg-white text-brand-700 hover:border-brand-primary hover:bg-brand-50'}`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </fieldset>
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
                <label className="text-sm font-medium text-ink/80" htmlFor="c-name">Nombres o empresa<span className="text-red-500"> *</span></label>
                <div className="relative flex items-center">
                  <User className={iconCls} strokeWidth={1.8} />
                  <input id="c-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Tu nombre o el de tu empresa" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group/field">
                  <label className="text-sm font-medium text-ink/80" htmlFor="c-email">Correo electrónico<span className="text-red-500"> *</span></label>
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
                <label className="text-sm font-medium text-ink/80" htmlFor="c-message">Mensaje<span className="text-red-500"> *</span></label>
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
                className="group/btn flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-[#0b68b8] disabled:opacity-50"
              >
                {/* Mismo gesto que los demás botones: chip con la flecha, que gira 45° al hover. */}
                <span className="flex items-center justify-center rounded-lg bg-white/20 p-1">
                  <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-45" />
                </span>
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
