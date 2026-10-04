'use client';
import { HOME_DEFAULTS, type Encabezado } from '@/lib/homeContenido';

import { useState } from 'react';
import { Building2, FileText, Handshake, Headset, Mail, MapPin, MessageCircle, MessageSquareText, Phone, Receipt, Server, User, type LucideIcon } from 'lucide-react';
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
const PREFERENCIAS = ['WhatsApp', 'Correo', 'Llamada'] as const;
const celularLimpio = (v: string) => v.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');

const MOTIVOS = [
  { id: 'Cotización', texto: 'Equipos o proyectos a medida.', Icono: Receipt },
  { id: 'Servicios TI', texto: 'Seguridad, redes, cloud y más.', Icono: Server },
  { id: 'Ser partner', texto: 'Integradores y revendedores.', Icono: Handshake },
  { id: 'Soporte', texto: 'Ayuda con un producto o pedido.', Icono: Headset },
  { id: 'Otro', texto: 'Cualquier otra consulta.', Icono: MessageCircle },
] as const;

/* Dos versiones del mismo formulario:
   - Simple (por defecto, home y demás páginas): tarjetas de datos a la izquierda y campos básicos. El
     mensaje viaja con la página de origen (`origen` = ruta actual), así se sabe desde dónde escribió.
   - `completo` (solo /contacto): título, texto y selector de motivo (tarjetas) a la izquierda y los datos
     del formulario a la derecha; el motivo se antepone al mensaje como «[Motivo: …]». Sus datos de
     contacto ya están en «Contacto por área». */
export function Contact({ c = HOME_DEFAULTS.contacto, completo = false }: { c?: Encabezado; completo?: boolean }) {
  const conDatos = !completo;
  // En /contacto el encabezado es propio y sin descripción (los datos de contacto ya están arriba).
  const t = completo ? { badge: 'Escríbenos', titulo: 'Cuéntanos qué', destacado: 'necesitas', descripcion: '' } : c;
  const ITEMS = itemsDe(useSitio().contact);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [motivo, setMotivo] = useState<(typeof MOTIVOS)[number]['id']>(MOTIVOS[0].id);
  // Formulario completo: persona natural (DNI) o empresa (RUC, razón social, responsable y cargo).
  const [tipo, setTipo] = useState<'PERSONA' | 'EMPRESA'>('PERSONA');
  const [documento, setDocumento] = useState('');
  const [preferencia, setPreferencia] = useState<(typeof PREFERENCIAS)[number]>(PREFERENCIAS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    let payload: { name: string; email: string; phone: string; company?: string; message: string };
    if (completo) {
      const esEmpresa = tipo === 'EMPRESA';
      if (esEmpresa ? !/^(10|15|16|17|20)\d{9}$/.test(documento) : !/^\d{8}$/.test(documento)) return setErrorMsg(esEmpresa ? 'El RUC debe tener 11 dígitos (empieza con 10 o 20).' : 'El DNI debe tener 8 dígitos.');
      if (name.trim().length < 2) return setErrorMsg(esEmpresa ? 'Ingresa la razón social.' : 'Ingresa tus nombres y apellidos.');
      if (!/^9\d{8}$/.test(celularLimpio(phone))) return setErrorMsg('Ingresa un celular de 9 dígitos (empieza con 9).');
      payload = {
        name,
        email,
        phone: celularLimpio(phone),
        company: esEmpresa ? name.trim() : undefined,
        message: [
          `[Motivo: ${motivo}]`,
          esEmpresa ? `Empresa · RUC ${documento}` : `Persona natural · DNI ${documento}`,
          `Contacto preferido: ${preferencia}`,
          message,
        ].filter(Boolean).join('\n'),
      };
    } else {
      payload = { name, email, phone, message };
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, origen: window.location.pathname }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setDocumento('');
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

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-start">
        <ScrollReveal direction="left">
          <SectionBadge>{t.badge}</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">{t.titulo}</span>{' '}
            <span className="title-shimmer-light">{t.destacado}</span>
          </h2>
          {t.descripcion && (
            <p className="mt-4 max-w-lg text-ink/65">
              {t.descripcion}
            </p>
          )}

          {completo && (
            <div className="mt-8 grid gap-3" role="radiogroup" aria-label="Motivo del mensaje">
              {MOTIVOS.map(({ id, texto, Icono }) => {
                const activo = motivo === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => setMotivo(id)}
                    className={`group flex items-center gap-4 rounded-xl border p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      activo ? 'border-brand-primary bg-brand-primary text-white shadow-[0_14px_28px_-10px_rgba(16,122,204,0.6)]' : 'border-brand-100 bg-white hover:border-brand-primary/50'
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${activo ? 'bg-white text-brand-primary' : 'bg-brand-50 text-brand-primary'}`}>
                      <Icono className="icon-hop h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span>
                      <span className={`block text-sm font-semibold ${activo ? 'text-white' : 'text-ink'}`}>{id}</span>
                      <span className={`block text-xs ${activo ? 'text-white/90' : 'text-ink/65'}`}>{texto}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {completo && (
              <div className="mt-6">
                <p className="text-sm font-medium text-ink/80">¿Cómo prefieres que te contactemos?</p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Contacto preferido">
                  {PREFERENCIAS.map((pf) => {
                    const activo = preferencia === pf;
                    return (
                      <button key={pf} type="button" role="radio" aria-checked={activo} onClick={() => setPreferencia(pf)} className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${activo ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-200 bg-white text-brand-700 hover:border-brand-primary hover:bg-brand-50'}`}>
                        {pf}
                      </button>
                    );
                  })}
                </div>
              </div>
          )}
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
              <p className="mt-1 text-sm text-ink/65">{completo ? `Motivo: ${motivo}. Un asesor te responderá pronto.` : 'Un asesor te responderá pronto.'}</p>
            </div>
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
              {completo ? (
                <>
                  <div role="radiogroup" aria-label="Tipo de cliente" className="grid grid-cols-2 gap-2">
                    {([
                      { id: 'PERSONA', titulo: 'Persona natural', Icono: User },
                      { id: 'EMPRESA', titulo: 'Empresa', Icono: Building2 },
                    ] as const).map(({ id, titulo, Icono }) => {
                      const activo = tipo === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={activo}
                          onClick={() => { setTipo(id); setDocumento(''); }}
                          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-200 ${activo ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-200 bg-white text-brand-700 hover:border-brand-primary hover:bg-brand-50'}`}
                        >
                          <Icono className="h-4 w-4" strokeWidth={2} />
                          {titulo}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="group/field">
                      <label className="text-sm font-medium text-ink/80" htmlFor="c-doc">{tipo === 'EMPRESA' ? 'RUC' : 'DNI'}<span className="text-red-500"> *</span></label>
                      <div className="relative flex items-center">
                        <FileText className={iconCls} strokeWidth={1.8} />
                        <input id="c-doc" inputMode="numeric" maxLength={tipo === 'EMPRESA' ? 11 : 8} value={documento} onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))} className={input} placeholder={tipo === 'EMPRESA' ? '20123456789' : '12345678'} />
                      </div>
                    </div>
                    <div className="group/field">
                      <label className="text-sm font-medium text-ink/80" htmlFor="c-name">{tipo === 'EMPRESA' ? 'Razón social' : 'Nombres y apellidos'}<span className="text-red-500"> *</span></label>
                      <div className="relative flex items-center">
                        {tipo === 'EMPRESA' ? <Building2 className={iconCls} strokeWidth={1.8} /> : <User className={iconCls} strokeWidth={1.8} />}
                        <input id="c-name" autoComplete={tipo === 'EMPRESA' ? 'organization' : 'name'} value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder={tipo === 'EMPRESA' ? 'Nombre legal de la empresa' : 'Tu nombre completo'} />
                      </div>
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
                      <label className="text-sm font-medium text-ink/80" htmlFor="c-phone">Celular / WhatsApp<span className="text-red-500"> *</span></label>
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
                      <textarea id="c-message" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={`${input} resize-none`} placeholder="Cuéntanos qué solución o equipamiento necesitas" />
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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
