'use client';

import { useState, type ReactNode } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

/*
 * Hoja de reclamación virtual (Código de Protección y Defensa del Consumidor,
 * Ley N.° 29571). Envía por /api/contacto (queda como lead para el equipo).
 * ponytail: sin numeración correlativa en servidor ni copia por correo al
 * cliente -- agregar un registro propio en la API antes de producción.
 */
const input =
  'mt-1.5 w-full rounded-xl border border-brand-dark/15 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/65 focus:border-brand-dark focus:bg-white focus:ring-2 focus:ring-brand-dark/15';

function Campo({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={`block text-sm font-medium text-ink ${full ? 'sm:col-span-2' : ''}`}>
      {label.endsWith(' *') ? <>{label.slice(0, -2)}<span className="text-red-500"> *</span></> : label}
      {children}
    </label>
  );
}

function Bloque({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-brand-dark/10 p-5 sm:p-6">
      <legend className="flex items-center gap-2 px-2 font-display text-base font-bold text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary text-xs text-white">{n}</span>
        {titulo}
      </legend>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function LibroReclamacionesForm() {
  const [enviando, setEnviando] = useState(false);
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function enviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(ev.currentTarget)) as Record<string, string>;
    const hoy = new Date();
    const cod = `LR-${hoy.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const detalle = [
      `[LIBRO DE RECLAMACIONES ${cod}] Tipo: ${f.tipo}`,
      `Documento: ${f.documento} · Domicilio: ${f.domicilio}`,
      `Bien: ${f.bien} · Monto: ${f.monto || '-'} · Descripción: ${f.descripcion}`,
      `Detalle: ${f.detalle}`,
      `Pedido del consumidor: ${f.pedido}`,
    ].join('\n');
    setEnviando(true);
    setError('');
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'RECLAMO', name: f.nombre, email: f.email, phone: f.telefono, company: '', message: detalle }),
      });
      if (!res.ok) throw new Error();
      setCodigo(cod);
    } catch {
      setError('No se pudo enviar. Inténtalo de nuevo o escríbenos por correo.');
    } finally {
      setEnviando(false);
    }
  }

  if (codigo) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-whatsapp-dark text-white shadow-lg shadow-whatsapp/30">
          <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-ink">Registramos tu hoja de reclamación</h2>
        <p className="mt-2 max-w-md text-ink/65">
          Tu código es <span className="font-bold text-brand-700">{codigo}</span>. Guárdalo: te responderemos en un plazo máximo de 15 días hábiles.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-6">
      <Bloque n={1} titulo="Identificación del consumidor">
        <Campo label="Nombre completo *"><input name="nombre" required className={input} /></Campo>
        <Campo label="DNI / CE / RUC *"><input name="documento" required className={input} /></Campo>
        <Campo label="Correo electrónico *"><input name="email" type="email" required className={input} /></Campo>
        <Campo label="Teléfono *"><input name="telefono" required className={input} /></Campo>
        <Campo label="Domicilio *" full><input name="domicilio" required className={input} /></Campo>
      </Bloque>

      <Bloque n={2} titulo="Bien contratado">
        <Campo label="Tipo">
          <select name="bien" className={input} defaultValue="Producto">
            <option>Producto</option>
            <option>Servicio</option>
          </select>
        </Campo>
        <Campo label="Monto reclamado"><input name="monto" placeholder="S/ o US$" className={input} /></Campo>
        <Campo label="Descripción del producto o servicio *" full><input name="descripcion" required className={input} /></Campo>
      </Bloque>

      <Bloque n={3} titulo="Detalle de la reclamación">
        <Campo label="Tipo" full>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {[
              { v: 'Reclamo', t: 'Disconformidad con el producto o servicio.' },
              { v: 'Queja', t: 'Disconformidad con la atención recibida.' },
            ].map((o, i) => (
              <label key={o.v} className="flex cursor-pointer gap-3 rounded-xl border border-brand-dark/15 bg-paper p-3.5 has-[:checked]:border-brand-primary has-[:checked]:bg-brand-primary/5">
                <input type="radio" name="tipo" value={o.v} defaultChecked={i === 0} className="mt-1 accent-[#107acc]" />
                <span>
                  <span className="block font-semibold text-ink">{o.v}</span>
                  <span className="block text-xs font-normal text-ink/60">{o.t}</span>
                </span>
              </label>
            ))}
          </div>
        </Campo>
        <Campo label="Detalle *" full><textarea name="detalle" required rows={4} className={input} /></Campo>
        <Campo label="Pedido (qué solicitas) *" full><textarea name="pedido" required rows={3} className={input} /></Campo>
      </Bloque>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="max-w-md text-xs text-ink/65">
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante INDECOPI.
        </p>
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand-primary px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-dark/30 transition-colors hover:bg-brand-primary disabled:opacity-50"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
          {enviando ? 'Enviando…' : 'Enviar hoja de reclamación'}
        </button>
      </div>
    </form>
  );
}
