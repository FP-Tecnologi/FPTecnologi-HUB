'use client';

import { useState } from 'react';
import { useSitio } from '@/context/SitioContext';

const itemsDe = (CONTACT_INFO: { address: string; phoneVentas: string; phoneVentasWeb: string; email: string }) => [
  { label: 'Dirección', value: CONTACT_INFO.address, icon: 'M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' },
  { label: 'Ventas', value: CONTACT_INFO.phoneVentas, icon: 'M6.6 10.2c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1C9.6 20 4 14.4 4 7.5c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1z' },
  { label: 'Ventas web', value: CONTACT_INFO.phoneVentasWeb, icon: 'M6.6 10.2c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1C9.6 20 4 14.4 4 7.5c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1z' },
  { label: 'Correo', value: CONTACT_INFO.email, icon: 'M4 6h16v12H4zm0 1 8 6 8-6' },
] as const;

/*
 * Sección de contacto en 2 columnas lado a lado (no todo centrado):
 * izquierda -> título + descripción corta + datos de contacto en
 * tarjetas; derecha -> formulario. Antes tenía el mapa de Google en la
 * columna izquierda; se quitó (pedido explícito) sin cambiar el layout
 * de 2 columnas que ya tenían los otros 9 modelos que usan este
 * componente.
 */
export function Contact() {
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

  return (
    <section id="contacto" className="relative overflow-hidden bg-brand-700 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-teal-light">Hablemos</span>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            ¿Listo para modernizar la tecnología de tu empresa?
          </h2>
          <p className="mt-4 max-w-lg text-white/70">
            Escríbenos y un asesor especializado te ayuda a armar la mejor solución para tu negocio, con stock
            local y tiempos de entrega reales.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-brand-teal-light">
                  <path d={item.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/80">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
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
              <input
                id="c-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/80 focus:border-brand-teal-light"
                placeholder="Tu nombre y apellido"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-white/70" htmlFor="c-email">Correo electrónico</label>
                <input
                  id="c-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/80 focus:border-brand-teal-light"
                  placeholder="correo@empresa.com"
                />
              </div>
              <div>
                <label className="text-sm text-white/70" htmlFor="c-phone">Teléfono / WhatsApp</label>
                <input
                  id="c-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/80 focus:border-brand-teal-light"
                  placeholder="+51 987 654 321"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/70" htmlFor="c-company">Empresa (opcional)</label>
              <input
                id="c-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/80 focus:border-brand-teal-light"
                placeholder="Nombre de tu empresa"
              />
            </div>
            <div>
              <label className="text-sm text-white/70" htmlFor="c-message">Mensaje</label>
              <textarea
                id="c-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1.5 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/80 focus:border-brand-teal-light"
                placeholder="Cuéntanos qué necesita tu empresa"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-dark shadow-lg transition-transform hover:scale-[1.03] disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              {submitting ? 'Enviando...' : 'Enviar mensaje'}
            </button>
            <p className="text-center text-xs text-white/80">
              Tu solicitud será registrada y un asesor especializado te responderá a la brevedad.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
