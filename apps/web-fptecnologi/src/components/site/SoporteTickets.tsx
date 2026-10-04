'use client';

import { useRef, useState } from 'react';
import { Building2, FileText, FileWarning, ImagePlus, PackageSearch, User, Wrench, X, type LucideIcon } from 'lucide-react';
import { ArrowUpRightIcon } from '@/components/site/icons';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { SectionBadge } from '@/components/home/SectionBadge';

type Caso = { id: string; titulo: string; texto: string; pruebas: string; icono: LucideIcon; reclamo?: boolean };

const CASOS: Caso[] = [
  { id: 'reclamo', titulo: 'Registrar un reclamo', texto: 'Problemas con un pedido, garantía o atención recibida.', pruebas: 'fotos del producto o del problema, tu boleta o factura y capturas de la conversación si las tienes', icono: FileWarning, reclamo: true },
  { id: 'verificacion', titulo: 'Verificar un producto', texto: 'Revisión o validación de un equipo que compraste con nosotros.', pruebas: 'fotos del producto y de su etiqueta o número de serie, y tu comprobante de compra', icono: PackageSearch },
  { id: 'soporte', titulo: 'Soporte técnico', texto: 'Falla o consulta técnica sobre un producto adquirido.', pruebas: 'fotos o capturas de la falla, y del equipo con su modelo o número de serie', icono: Wrench },
];

const MAX_EVIDENCIAS = 8;
const MAX_MB = 10;

type Evidencia = { id: string; nombre: string; url: string; pdf: boolean };

const campo =
  'mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/55 focus:border-brand-primary';

const celularLimpio = (v: string) => v.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');

/* Soporte por tickets en 2 pasos: (1) tipo de caso y datos de contacto, (2) datos de la compra
   (n.º de compra, fecha, producto, comprobante), evidencia (hasta 3 fotos, se suben a la API) y la
   descripción. Mientras no exista el módulo de tickets en la API, se registra por el mismo endpoint
   del formulario de contacto (/api/contacto) con todo el detalle en el mensaje; los reclamos van como
   RECLAMO. */
export function SoporteTickets() {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [caso, setCaso] = useState(CASOS[0].id);
  const [tipo, setTipo] = useState<'PERSONA' | 'EMPRESA'>('PERSONA');
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [numeroCompra, setNumeroCompra] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [producto, setProducto] = useState('');
  const [comprobante, setComprobante] = useState('');
  const [detalle, setDetalle] = useState('');
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');
  const inputFile = useRef<HTMLInputElement>(null);
  const actual = CASOS.find((c) => c.id === caso) ?? CASOS[0];

  function continuar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const esEmpresa = tipo === 'EMPRESA';
    if (esEmpresa ? !/^(10|15|16|17|20)\d{9}$/.test(documento) : !/^\d{8}$/.test(documento)) return setError(esEmpresa ? 'El RUC debe tener 11 dígitos (empieza con 10 o 20).' : 'El DNI debe tener 8 dígitos.');
    if (nombre.trim().length < 2) return setError(esEmpresa ? 'Ingresa la razón social.' : 'Ingresa tus nombres y apellidos.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Ingresa un correo válido.');
    if (!/^9\d{8}$/.test(celularLimpio(telefono))) return setError('Ingresa un celular de 9 dígitos (empieza con 9).');
    setOk(false);
    setPaso(2);
  }

  async function agregarArchivos(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    const libres = MAX_EVIDENCIAS - evidencias.length;
    if (libres <= 0) return setError(`Puedes adjuntar hasta ${MAX_EVIDENCIAS} archivos.`);
    setSubiendo(true);
    try {
      for (const f of Array.from(files).slice(0, libres)) {
        const esPdf = f.type === 'application/pdf';
        if (!esPdf && !f.type.startsWith('image/')) {
          setError('Solo se pueden adjuntar fotos (JPG, PNG, WEBP) o PDF.');
          continue;
        }
        if (f.size > MAX_MB * 1024 * 1024) {
          setError(`"${f.name}" pesa más de ${MAX_MB} MB.`);
          continue;
        }
        const fd = new FormData();
        fd.append('archivo', f);
        const res = await fetch('/api/evidencia', { method: 'POST', body: fd });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) setEvidencias((prev) => [...prev, { id: `${Date.now()}-${f.name}`, nombre: f.name, url: data.url, pdf: esPdf }]);
        else setError(data.error || `No pudimos subir "${f.name}".`);
      }
    } finally {
      setSubiendo(false);
      if (inputFile.current) inputFile.current.value = '';
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!numeroCompra.trim()) return setError('Ingresa el número de tu compra o pedido.');
    if (!producto.trim()) return setError('Indica el producto de la compra.');
    if (detalle.trim().length < 5) return setError('Describe brevemente tu caso.');
    setEnviando(true);
    try {
      const lineas = [
        `[Ticket: ${actual.titulo}]`,
        tipo === 'EMPRESA' ? `Empresa · RUC ${documento}` : `Persona natural · DNI ${documento}`,
        `Compra: N.º ${numeroCompra.trim()}${fechaCompra ? ` · Fecha: ${fechaCompra}` : ''}${comprobante.trim() ? ` · Comprobante: ${comprobante.trim()}` : ''}`,
        `Producto: ${producto.trim()}`,
        detalle.trim(),
        evidencias.length ? `Evidencia: ${evidencias.map((x) => x.url).join(' ')}` : '',
      ].filter(Boolean);
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nombre,
          email,
          phone: celularLimpio(telefono),
          company: tipo === 'EMPRESA' ? nombre.trim() : undefined,
          tipo: actual.reclamo ? 'RECLAMO' : 'CONTACTO',
          origen: '/tickets',
          message: lineas.join('\n'),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOk(true);
        setPaso(1);
        setNombre('');
        setDocumento('');
        setEmail('');
        setTelefono('');
        setNumeroCompra('');
        setFechaCompra('');
        setProducto('');
        setComprobante('');
        setDetalle('');
        setEvidencias([]);
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
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120}>
          <form onSubmit={paso === 1 ? continuar : enviar} noValidate className="group/form relative overflow-hidden rounded-2xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-950/10 sm:p-8">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-primary via-brand-500 to-brand-700 transition-transform duration-500 ease-out group-focus-within/form:scale-x-100" />

            {/* Pasos */}
            <ol className="mb-6 flex items-center gap-3 text-sm font-semibold" aria-label="Pasos del ticket">
              {['Tus datos', 'Tu compra'].map((t, i) => {
                const n = i + 1;
                const hecho = paso > n;
                const activo = paso === n;
                return (
                  <li key={t} className="flex flex-1 items-center gap-2" aria-current={activo ? 'step' : undefined}>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${activo || hecho ? 'bg-brand-primary text-white' : 'bg-brand-100 text-brand-700'}`}>{n}</span>
                    <span className={activo ? 'text-ink' : 'text-ink/65'}>{t}</span>
                    {i === 0 && <span className={`h-px flex-1 ${hecho ? 'bg-brand-primary' : 'bg-brand-100'}`} />}
                  </li>
                );
              })}
            </ol>

            <p className="font-display text-xl font-bold text-ink">{actual.titulo}</p>
            <p className="mb-5 mt-1 text-sm text-ink/65">{paso === 1 ? 'Primero, cómo te contactamos.' : 'Ahora, los datos de la compra y tu evidencia.'}</p>

            <div className="space-y-4">
              {ok && <div role="status" className="rounded-xl border border-whatsapp-dark/30 bg-whatsapp/10 p-4 text-center text-sm font-medium text-whatsapp-dark">¡Listo! Registramos tu ticket. Un asesor te contactará pronto.</div>}
              {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-center text-sm font-medium text-red-700">{error}</div>}

              {paso === 1 ? (
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
                    <div>
                      <label className="text-sm font-medium text-ink/80" htmlFor="t-doc">{tipo === 'EMPRESA' ? 'RUC' : 'DNI'}<span className="text-red-500"> *</span></label>
                      <input id="t-doc" inputMode="numeric" maxLength={tipo === 'EMPRESA' ? 11 : 8} value={documento} onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))} className={campo} placeholder={tipo === 'EMPRESA' ? '20123456789' : '12345678'} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ink/80" htmlFor="t-nombre">{tipo === 'EMPRESA' ? 'Razón social' : 'Nombres y apellidos'}<span className="text-red-500"> *</span></label>
                      <input id="t-nombre" autoComplete={tipo === 'EMPRESA' ? 'organization' : 'name'} value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} placeholder={tipo === 'EMPRESA' ? 'Nombre legal de la empresa' : 'Tu nombre completo'} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-ink/80" htmlFor="t-email">Correo electrónico<span className="text-red-500"> *</span></label>
                      <input id="t-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} placeholder="correo@empresa.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ink/80" htmlFor="t-tel">Celular / WhatsApp<span className="text-red-500"> *</span></label>
                      <input id="t-tel" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={campo} placeholder="+51 987 654 321" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-ink/80" htmlFor="t-compra">N.º de compra o pedido<span className="text-red-500"> *</span></label>
                      <input id="t-compra" value={numeroCompra} onChange={(e) => setNumeroCompra(e.target.value)} className={campo} placeholder="Ej. 1024" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ink/80" htmlFor="t-fecha">Fecha de compra</label>
                      <input id="t-fecha" type="date" max={new Date().toISOString().slice(0, 10)} value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} className={campo} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-ink/80" htmlFor="t-prod">Producto<span className="text-red-500"> *</span></label>
                      <input id="t-prod" value={producto} onChange={(e) => setProducto(e.target.value)} className={campo} placeholder="Ej. Monitor HP E24" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ink/80" htmlFor="t-comp">Boleta o factura</label>
                      <input id="t-comp" value={comprobante} onChange={(e) => setComprobante(e.target.value)} className={campo} placeholder="Ej. F001-123" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-ink/80" htmlFor="t-detalle">Describe tu caso<span className="text-red-500"> *</span></label>
                    <textarea id="t-detalle" rows={3} value={detalle} onChange={(e) => setDetalle(e.target.value)} className={`${campo} resize-none`} placeholder="¿Qué problema tienes o qué necesitas verificar?" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-ink/80">Evidencia (fotos o PDF, hasta {MAX_EVIDENCIAS} archivos)</p>
                    <div className="mt-1.5 flex flex-wrap gap-3">
                      {evidencias.map((x) => (
                        <div key={x.id} className="relative h-20 w-20 overflow-hidden rounded-xl border border-brand-200">
                          {x.pdf ? (
                            <a href={x.url} target="_blank" rel="noreferrer" title={x.nombre} className="flex h-full w-full flex-col items-center justify-center gap-1 bg-brand-50 px-1 text-center text-[10px] font-semibold leading-tight text-brand-700">
                              <FileText className="h-6 w-6" strokeWidth={1.8} />
                              <span className="line-clamp-2 break-all">{x.nombre}</span>
                            </a>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={x.url} alt={x.nombre} className="h-full w-full object-cover" />
                          )}
                          <button type="button" onClick={() => setEvidencias((prev) => prev.filter((e) => e.id !== x.id))} aria-label={`Quitar ${x.nombre}`} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white transition-colors hover:bg-red-600">
                            <X className="h-3 w-3" strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                      {evidencias.length < MAX_EVIDENCIAS && (
                        <button type="button" onClick={() => inputFile.current?.click()} disabled={subiendo} className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-200 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-primary hover:bg-brand-50 disabled:opacity-60">
                          <ImagePlus className="h-5 w-5" strokeWidth={1.8} />
                          {subiendo ? 'Subiendo…' : 'Agregar'}
                        </button>
                      )}
                    </div>
                    <input ref={inputFile} type="file" accept="image/*,application/pdf" multiple className="sr-only" onChange={(e) => agregarArchivos(e.target.files)} aria-label="Agregar fotos o PDF de evidencia" />
                    <p className="mt-1.5 text-xs text-ink/65">JPG, PNG, WEBP o PDF, máximo {MAX_MB} MB cada archivo.</p>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                {paso === 2 && (
                  <button type="button" onClick={() => { setError(''); setPaso(1); }} className="inline-flex h-12 items-center rounded-xl border border-brand-200 px-5 text-sm font-semibold uppercase tracking-wide text-brand-700 transition-colors hover:bg-brand-50">
                    Atrás
                  </button>
                )}
                <button type="submit" disabled={enviando || subiendo} className="group/btn flex h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-[#0b68b8] disabled:opacity-50">
                  <span className="flex items-center justify-center rounded-lg bg-white/20 p-1">
                    <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-45" />
                  </span>
                  {paso === 1 ? 'Continuar' : enviando ? 'Enviando...' : 'Abrir ticket'}
                </button>
              </div>
              {paso === 1 && (
                <p className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-ink/75">
                  <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" strokeWidth={2} />
                  <span>
                    En el siguiente paso podrás adjuntar pruebas (fotos o PDF, hasta {MAX_EVIDENCIAS} archivos): <strong className="text-ink">{actual.pruebas}</strong>.
                  </span>
                </p>
              )}
            </div>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
