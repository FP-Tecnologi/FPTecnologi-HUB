'use client';

import { useState } from 'react';
import { FileWarning, Mail, PackageSearch, Phone, Wrench, type LucideIcon } from 'lucide-react';
import { ArrowUpRightIcon } from '@/components/site/icons';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { SectionBadge } from '@/components/home/SectionBadge';

type Caso = { id: string; titulo: string; texto: string; icono: LucideIcon; reclamo?: boolean };

const CASOS: Caso[] = [
  { id: 'verificacion', titulo: 'Verificar un producto', texto: 'Revisión o validación de un equipo que compraste con nosotros.', icono: PackageSearch },
  { id: 'reclamo', titulo: 'Registrar un reclamo', texto: 'Problemas con un pedido, garantía o atención recibida.', icono: FileWarning, reclamo: true },
  { id: 'soporte', titulo: 'Soporte técnico', texto: 'Falla o consulta técnica sobre un producto adquirido.', icono: Wrench },
];

const campo =
  'mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/55 focus:border-brand-primary';

/* Soporte por tickets: el cliente elige el tipo de caso (verificación,
   reclamo o soporte), deja los datos del pedido/producto y se registra como
   ticket. Mientras no exista el módulo de tickets en la API, se envía por el
   mismo endpoint del formulario de contacto (/api/contacto) con el tipo de
   caso al inicio del mensaje; los reclamos van como RECLAMO. */
export function SoporteTickets() {
  const [caso, setCaso] = useState(CASOS[0].id);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [referencia, setReferencia] = useState('');
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');
  const actual = CASOS.find((c) => c.id === caso) ?? CASOS[0];

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nombre,
          email,
          phone: telefono,
          tipo: actual.reclamo ? 'RECLAMO' : 'CONTACTO',
          origen: '/contacto#tickets',
          message: `[Ticket: ${actual.titulo}]${referencia ? ` Pedido/producto: ${referencia}.` : ''}\n${detalle}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOk(true);
        setNombre('');
        setEmail('');
        setTelefono('');
        setReferencia('');
        setDetalle('');
      } else setError(data.error || 'No pudimos registrar tu ticket. Inténtalo nuevamente.');
    } catch {
      setError('Error de conexión. Inténtalo más tarde.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="tickets" className="border-t border-brand-100 bg-paper py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-start">
        <ScrollReveal direction="left">
          <SectionBadge>Soporte por tickets</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            <span className="text-ink">¿Problemas con un producto?</span> <span className="title-shimmer-light">Abre un ticket</span>
          </h2>
          <p className="mt-4 max-w-lg text-ink/65">
            Si compraste con nosotros y necesitas verificar un equipo, registrar un reclamo o recibir soporte, abre un ticket y el área comercial le dará seguimiento.
          </p>
          <div className="mt-8 grid gap-3">
            {CASOS.map((c) => {
              const activo = c.id === caso;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCaso(c.id)}
                  aria-pressed={activo}
                  className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                    activo ? 'border-brand-primary bg-brand-primary text-white shadow-[0_14px_28px_-10px_rgba(16,122,204,0.6)]' : 'border-brand-100 bg-white hover:border-brand-primary/50'
                  }`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${activo ? 'bg-white text-brand-primary' : 'bg-brand-50 text-brand-primary'}`}>
                    <c.icono className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span>
                    <span className={`block font-semibold ${activo ? 'text-white' : 'text-ink'}`}>{c.titulo}</span>
                    <span className={`block text-sm ${activo ? 'text-white/90' : 'text-ink/65'}`}>{c.texto}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink/65">
            <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-primary" strokeWidth={2} /> +51 908 856 286</span>
            <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-primary" strokeWidth={2} /> soporte@fptecnologi.com</span>
          </p>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          <form onSubmit={enviar} className="group/form relative overflow-hidden rounded-2xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-950/10 sm:p-8">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-primary via-brand-500 to-brand-700 transition-transform duration-500 ease-out group-focus-within/form:scale-x-100" />
            <p className="font-display text-xl font-bold text-ink">{actual.titulo}</p>
            <p className="mb-5 mt-1 text-sm text-ink/65">Cuéntanos qué pasó y te contactaremos.</p>
            <div className="space-y-4">
              {ok && <div role="status" className="rounded-xl border border-whatsapp-dark/30 bg-whatsapp/10 p-4 text-center text-sm font-medium text-whatsapp-dark">¡Listo! Registramos tu ticket. Un asesor te contactará pronto.</div>}
              {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-center text-sm font-medium text-red-700">{error}</div>}
              <div>
                <label className="text-sm font-medium text-ink/80" htmlFor="t-nombre">Nombres o empresa<span className="text-red-500"> *</span></label>
                <input id="t-nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} placeholder="Tu nombre o el de tu empresa" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-ink/80" htmlFor="t-email">Correo electrónico<span className="text-red-500"> *</span></label>
                  <input id="t-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={campo} placeholder="correo@empresa.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink/80" htmlFor="t-tel">Celular / WhatsApp</label>
                  <input id="t-tel" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={campo} placeholder="+51 987 654 321" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-ink/80" htmlFor="t-ref">N.º de pedido o producto</label>
                <input id="t-ref" value={referencia} onChange={(e) => setReferencia(e.target.value)} className={campo} placeholder="Ej. Pedido 1024 o Monitor HP E24" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink/80" htmlFor="t-detalle">Describe tu caso<span className="text-red-500"> *</span></label>
                <textarea id="t-detalle" required rows={4} value={detalle} onChange={(e) => setDetalle(e.target.value)} className={`${campo} resize-none`} placeholder="¿Qué problema tienes o qué necesitas verificar?" />
              </div>
              <button type="submit" disabled={enviando} className="group/btn flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-[#0b68b8] disabled:opacity-50">
                <span className="flex items-center justify-center rounded-lg bg-white/20 p-1">
                  <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-45" />
                </span>
                {enviando ? 'Enviando...' : 'Abrir ticket'}
              </button>
            </div>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
