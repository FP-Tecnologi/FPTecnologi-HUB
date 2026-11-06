'use client';
/*
 * Tickets de soporte de Imaninki (mismo flujo que fptecnologi.com/tickets): 1) tipo de caso y datos de contacto,
 * 2) datos de la compra, evidencias (fotos o PDF, se suben a la API) y descripción. Va a /api/hub/tickets →
 * API del HUB (POST /public/tickets): llega al correo de tickets de Imaninki y al dashboard → Tickets.
 */
import { useRef, useState } from 'react';
import { Building2, FileText, FileWarning, ImagePlus, Loader2, PackageSearch, Send, User, Wrench, X, type LucideIcon } from 'lucide-react';

type Caso = { id: 'RECLAMO' | 'VERIFICACION' | 'SOPORTE'; titulo: string; texto: string; pruebas: string; icono: LucideIcon };
const CASOS: Caso[] = [
  { id: 'SOPORTE', titulo: 'Soporte técnico', texto: 'Falla o consulta técnica sobre tu equipo o un componente.', pruebas: 'fotos o capturas de la falla, y del equipo con su modelo o número de serie', icono: Wrench },
  { id: 'VERIFICACION', titulo: 'Verificar un equipo', texto: 'Revisión o validación de una PC o pieza que compraste con nosotros.', pruebas: 'fotos del equipo y de su etiqueta o número de serie, y tu comprobante de compra', icono: PackageSearch },
  { id: 'RECLAMO', titulo: 'Registrar un reclamo', texto: 'Problemas con un pedido, la garantía o la atención recibida.', pruebas: 'fotos del producto o del problema, tu boleta o factura y capturas de la conversación', icono: FileWarning },
];
const MAX_EVIDENCIAS = 8;
const MAX_MB = 10;
type Evidencia = { id: string; nombre: string; clave: string; preview: string; pdf: boolean };

const campo = 'mt-1 block min-h-11 w-full rounded-lg border border-carbon/40 bg-white px-4 py-2.5 text-base text-tinta transition focus:border-rojo-hondo';
const etiqueta = 'text-sm font-medium text-carbon';
const celularLimpio = (v: string) => v.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');

export default function AbrirTicket() {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [caso, setCaso] = useState<Caso['id']>('SOPORTE');
  const [empresa, setEmpresa] = useState(false);
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [numeroCompra, setNumeroCompra] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [producto, setProducto] = useState('');
  const [comprobante, setComprobante] = useState('');
  const [detalle, setDetalle] = useState('');
  const [website, setWebsite] = useState('');
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [numeroTicket, setNumeroTicket] = useState<string | null>(null);
  const [error, setError] = useState('');
  const inputFile = useRef<HTMLInputElement>(null);
  const actual = CASOS.find((c) => c.id === caso) ?? CASOS[0]!;

  function continuar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (empresa ? !/^(10|15|16|17|20)\d{9}$/.test(documento) : !/^\d{8}$/.test(documento)) return setError(empresa ? 'El RUC debe tener 11 dígitos (empieza con 10 o 20).' : 'El DNI debe tener 8 dígitos.');
    if (nombre.trim().length < 2) return setError(empresa ? 'Ingresa la razón social.' : 'Ingresa tus nombres y apellidos.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Ingresa un correo válido.');
    if (!/^9\d{8}$/.test(celularLimpio(telefono))) return setError('Ingresa un celular de 9 dígitos (empieza con 9).');
    setNumeroTicket(null);
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
        const pdf = f.type === 'application/pdf';
        if (!pdf && !f.type.startsWith('image/')) { setError('Solo se pueden adjuntar fotos (JPG, PNG, WEBP) o PDF.'); continue; }
        if (f.size > MAX_MB * 1024 * 1024) { setError(`"${f.name}" pesa más de ${MAX_MB} MB.`); continue; }
        const fd = new FormData();
        fd.append('archivo', f);
        const res = await fetch('/api/hub/evidencia', { method: 'POST', body: fd });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.clave) setEvidencias((p) => [...p, { id: `${Date.now()}-${f.name}`, nombre: f.name, clave: data.clave, preview: URL.createObjectURL(f), pdf }]);
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
    if (!producto.trim()) return setError('Indica el equipo o producto.');
    if (detalle.trim().length < 5) return setError('Describe brevemente tu caso.');
    setEnviando(true);
    try {
      const res = await fetch('/api/hub/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: caso, esEmpresa: empresa, documento, nombre: nombre.trim(), email: email.trim(), celular: celularLimpio(telefono),
          numeroCompra: numeroCompra.trim(), fechaCompra: fechaCompra || undefined, producto: producto.trim(), comprobante: comprobante.trim() || undefined,
          descripcion: detalle.trim(), evidencias: evidencias.map((x) => x.clave), origen: '/tickets', website: website || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) return setError(data.error || 'No pudimos registrar tu ticket. Inténtalo nuevamente.');
      setNumeroTicket(data.numero ?? '');
      setPaso(1);
      setDocumento(''); setNombre(''); setEmail(''); setTelefono(''); setNumeroCompra(''); setFechaCompra('');
      setProducto(''); setComprobante(''); setDetalle(''); setEvidencias([]);
    } catch {
      setError('Error de conexión. Inténtalo más tarde.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-start">
      <div role="radiogroup" aria-label="Tipo de caso" className="grid gap-3">
        {CASOS.map((c) => {
          const activo = c.id === caso;
          return (
            <button key={c.id} type="button" role="radio" aria-checked={activo} onClick={() => setCaso(c.id)}
              className={`border border-carbon/15 bg-niebla flex items-center gap-4 rounded-md p-4 text-left transition ${activo ? 'border-rojo-hondo bg-rojo/10' : 'hover:border-rojo-hondo/60'}`}>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${activo ? 'bg-rojo-hondo text-white' : 'bg-rojo/10 text-rojo-hondo'}`}><c.icono aria-hidden="true" size={20} /></span>
              <span>
                <span className="block font-titulo font-bold text-tinta">{c.titulo}</span>
                <span className="block text-sm text-carbon">{c.texto}</span>
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={paso === 1 ? continuar : enviar} noValidate className="border border-carbon/15 bg-niebla rounded-md p-5 sm:p-8">
        <ol className="mb-5 flex items-center gap-3 text-sm font-semibold" aria-label="Pasos del ticket">
          {['Tus datos', 'Tu compra'].map((t, i) => (
            <li key={t} className="flex flex-1 items-center gap-2" aria-current={paso === i + 1 ? 'step' : undefined}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${paso >= i + 1 ? 'bg-rojo-hondo text-white' : 'bg-rojo/10 text-rojo-hondo'}`}>{i + 1}</span>
              <span className={paso === i + 1 ? 'text-tinta' : 'text-carbon/70'}>{t}</span>
            </li>
          ))}
        </ol>
        <p className="font-titulo text-xl font-bold text-tinta">{actual.titulo}</p>
        <p className="mb-5 mt-1 text-sm text-carbon">{paso === 1 ? 'Primero, cómo te contactamos.' : 'Ahora, los datos de la compra y tu evidencia.'}</p>

        <div className="space-y-4">
          {numeroTicket !== null && (
            <p role="status" className="rounded-md border border-rojo-hondo/50 bg-rojo/10 p-4 text-sm text-tinta">
              ¡Listo! Registramos tu ticket{numeroTicket ? <> <b>{numeroTicket}</b></> : ''}. Te enviamos una copia por correo y un asesor te contactará pronto.{' '}
              {numeroTicket && <a href={`/tickets/seguimiento?n=${encodeURIComponent(numeroTicket)}`} className="font-bold text-rojo-hondo underline">Ver seguimiento</a>}
            </p>
          )}
          {error && <p role="alert" className="rounded-md border border-red-700 p-4 text-sm text-red-700">{error}</p>}
          <div aria-hidden="true" className="hidden"><input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>

          {paso === 1 ? (
            <>
              <div role="radiogroup" aria-label="Tipo de cliente" className="grid grid-cols-2 gap-2">
                {([[false, 'Persona natural', User], [true, 'Empresa', Building2]] as const).map(([valor, titulo, Icono]) => (
                  <button key={titulo} type="button" role="radio" aria-checked={empresa === valor} onClick={() => { setEmpresa(valor); setDocumento(''); }}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${empresa === valor ? 'border-rojo-hondo bg-rojo/10 text-tinta' : 'border-carbon/40 text-carbon hover:border-rojo-hondo'}`}>
                    <Icono aria-hidden="true" size={16} />{titulo}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="t-doc" className={etiqueta}>{empresa ? 'RUC' : 'DNI'} *</label>
                  <input id="t-doc" inputMode="numeric" maxLength={empresa ? 11 : 8} value={documento} onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))} className={campo} placeholder={empresa ? '20123456789' : '12345678'} /></div>
                <div><label htmlFor="t-nombre" className={etiqueta}>{empresa ? 'Razón social' : 'Nombres y apellidos'} *</label>
                  <input id="t-nombre" autoComplete={empresa ? 'organization' : 'name'} value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="t-email" className={etiqueta}>Correo electrónico *</label>
                  <input id="t-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} placeholder="correo@empresa.com" /></div>
                <div><label htmlFor="t-tel" className={etiqueta}>Celular / WhatsApp *</label>
                  <input id="t-tel" type="tel" autoComplete="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={campo} placeholder="987 654 321" /></div>
              </div>
              <p className="flex items-start gap-2 rounded-md bg-rojo/10 p-3 text-xs leading-relaxed text-carbon">
                <ImagePlus aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-rojo-hondo" />
                <span>En el siguiente paso podrás adjuntar pruebas (fotos o PDF, hasta {MAX_EVIDENCIAS}): <b className="text-tinta">{actual.pruebas}</b>.</span>
              </p>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="t-compra" className={etiqueta}>N.º de compra o pedido *</label>
                  <input id="t-compra" value={numeroCompra} onChange={(e) => setNumeroCompra(e.target.value)} className={campo} placeholder="Ej. 1024" /></div>
                <div><label htmlFor="t-fecha" className={etiqueta}>Fecha de compra</label>
                  <input id="t-fecha" type="date" max={new Date().toISOString().slice(0, 10)} value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} className={campo} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="t-prod" className={etiqueta}>Equipo o producto *</label>
                  <input id="t-prod" value={producto} onChange={(e) => setProducto(e.target.value)} className={campo} placeholder="Ej. Turing Pro RTX 4070" /></div>
                <div><label htmlFor="t-comp" className={etiqueta}>Boleta o factura</label>
                  <input id="t-comp" value={comprobante} onChange={(e) => setComprobante(e.target.value)} className={campo} placeholder="Ej. F001-123" /></div>
              </div>
              <div><label htmlFor="t-detalle" className={etiqueta}>Describe tu caso *</label>
                <textarea id="t-detalle" rows={4} maxLength={4000} value={detalle} onChange={(e) => setDetalle(e.target.value)} className={`${campo} resize-none`} placeholder="¿Qué problema tienes o qué necesitas verificar?" /></div>
              <div>
                <p className={etiqueta}>Evidencia (fotos o PDF, hasta {MAX_EVIDENCIAS} archivos)</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {evidencias.map((x) => (
                    <div key={x.id} className="relative h-20 w-20 overflow-hidden rounded-md border border-carbon/40">
                      {x.pdf ? (
                        <span title={x.nombre} className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center text-[10px] font-semibold text-carbon"><FileText aria-hidden="true" size={22} /><span className="line-clamp-2 break-all">{x.nombre}</span></span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={x.preview} alt={x.nombre} className="h-full w-full object-cover" />
                      )}
                      <button type="button" onClick={() => setEvidencias((p) => p.filter((e) => e.id !== x.id))} aria-label={`Quitar ${x.nombre}`} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600"><X aria-hidden="true" size={12} /></button>
                    </div>
                  ))}
                  {evidencias.length < MAX_EVIDENCIAS && (
                    <button type="button" onClick={() => inputFile.current?.click()} disabled={subiendo} className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-carbon/40 text-xs font-semibold text-carbon transition hover:border-rojo-hondo disabled:opacity-60">
                      {subiendo ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <ImagePlus aria-hidden="true" size={18} />}{subiendo ? 'Subiendo…' : 'Agregar'}
                    </button>
                  )}
                </div>
                <input ref={inputFile} type="file" accept="image/*,application/pdf" multiple className="sr-only" onChange={(e) => agregarArchivos(e.target.files)} aria-label="Agregar fotos o PDF de evidencia" />
                <p className="mt-1.5 text-xs text-carbon/70">JPG, PNG, WEBP o PDF, máximo {MAX_MB} MB cada uno.</p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-1">
            {paso === 2 && <button type="button" onClick={() => { setError(''); setPaso(1); }} className="btn-borde min-h-12 rounded-full px-6 font-titulo text-sm">ATRÁS</button>}
            <button type="submit" disabled={enviando || subiendo} className="btn-neon flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-8 font-titulo text-sm disabled:opacity-60">
              {enviando ? <Loader2 aria-hidden="true" size={18} className="animate-spin" /> : <Send aria-hidden="true" size={18} />}
              {paso === 1 ? 'CONTINUAR' : enviando ? 'ENVIANDO…' : 'ABRIR TICKET'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
