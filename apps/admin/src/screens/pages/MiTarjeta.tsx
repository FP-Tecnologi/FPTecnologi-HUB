'use client';
/*
 * FPTecnologi-HUB — Mi tarjeta digital (Mi cuenta). Cada persona del equipo, de cualquier área, arma y gestiona AQUÍ su
 * tarjeta: datos, foto, estilo, enlace único para compartir, QR y tarjeta gráfica descargable (PNG). La página pública
 * /tarjeta/<enlace> solo muestra el resultado; no se edita ahí.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { SubirImagen, urlImagen } from '../../components/ui/SubirImagen';
import { ApiError, useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { descargarCanvas, dibujarTarjeta, ESTILOS_TARJETA, type EstiloTarjeta } from '../../lib/tarjetaGrafica';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

interface Tarjeta {
  slug: string; estilo: EstiloTarjeta; vista: 'perfil' | 'linktree'; nombre: string; cargo: string | null; area: string | null; bio: string | null; fotoUrl: string | null; telefono: string | null;
  whatsapp: string | null; email: string | null; linkedin: string | null; web: string | null; agendaUrl: string | null;
  enlaces: { titulo: string; url: string }[]; activo: boolean; vistas: number;
}
interface Respuesta { tarjeta: Tarjeta | null; sugerido: { nombre: string; email: string; cargo: string; telefono: string }; faltantes: { campo: string; aviso: string }[]; url: string | null; qr: string | null }

const VACIA: Tarjeta = { slug: '', estilo: 'clasico', vista: 'perfil', nombre: '', cargo: '', area: '', bio: '', fotoUrl: '', telefono: '', whatsapp: '', email: '', linkedin: '', web: '', agendaUrl: '', enlaces: [], activo: true, vistas: 0 };
const v = (x: string | null | undefined) => x ?? '';

/** Qué le falta a la tarjeta (sobre lo que hay en el formulario) y qué hacer. */
function pendientes(f: Tarjeta) {
  const p: { campo: string; aviso: string }[] = [];
  if (!f.fotoUrl) p.push({ campo: 'foto', aviso: 'Falta tu foto: pulsa «Subir foto» (arriba, junto a tu nombre). Las tarjetas con foto generan más confianza.' });
  if (!f.cargo?.trim()) p.push({ campo: 'cargo', aviso: 'Escribe tu cargo para que el cliente sepa quién eres.' });
  if (!f.bio?.trim()) p.push({ campo: 'bio', aviso: 'Agrega una presentación corta de lo que haces.' });
  if (!f.whatsapp?.trim() && !f.telefono?.trim()) p.push({ campo: 'contacto', aviso: 'Agrega tu WhatsApp o teléfono para que te puedan contactar.' });
  if (!f.email?.trim()) p.push({ campo: 'email', aviso: 'Agrega tu correo de contacto.' });
  return p;
}

/** Miniatura de un estilo (se dibuja con el mismo código de la tarjeta descargable). */
function Mini({ estilo, datos, activo, onElegir, nombre, detalle }: { estilo: EstiloTarjeta; datos: Tarjeta; activo: boolean; onElegir: () => void; nombre: string; detalle: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) dibujarTarjeta(ref.current, estilo, { ...datos, empresa: 'FPTecnologi & System' }, null, urlImagen).catch(() => undefined);
  }, [estilo, datos]);
  return (
    <button type="button" onClick={onElegir} aria-pressed={activo} style={{ textAlign: 'left', padding: 6, borderRadius: 12, border: activo ? '2px solid var(--ax-primary-500, #2898ee)' : '2px solid var(--ax-border)', background: 'transparent', cursor: 'pointer' }}>
      <canvas ref={ref} style={{ width: '100%', height: 'auto', aspectRatio: '1050 / 600', borderRadius: 8, display: 'block' }} />
      <strong style={{ display: 'block', fontSize: 'var(--ax-text-sm)', marginTop: 6 }}>{nombre}</strong>
      <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{detalle}</span>
    </button>
  );
}

export function MiTarjeta() {
  const { activeMarcaId } = useAuth();
  const [form, setForm] = useState<Tarjeta>(VACIA);
  const [resp, setResp] = useState<Respuesta | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const lienzo = useRef<HTMLCanvasElement>(null);

  const cargar = useCallback(async () => {
    try {
      const r = await api.get<Respuesta>('/tarjetas/mia');
      setResp(r);
      setForm(r.tarjeta ?? { ...VACIA, nombre: r.sugerido.nombre, email: r.sugerido.email, cargo: r.sugerido.cargo, telefono: r.sugerido.telefono });
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cargar tu tarjeta.');
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar, activeMarcaId]);

  const set = <K extends keyof Tarjeta>(k: K, valor: Tarjeta[K]) => setForm((f) => ({ ...f, [k]: valor }));
  const faltan = useMemo(() => pendientes(form), [form]);
  const completa = Math.round(((5 - faltan.length) / 5) * 100);
  const datosGrafica = useMemo(() => ({ ...form, empresa: 'FPTecnologi & System' }), [form]);

  // Tarjeta gráfica grande (con el QR de la tarjeta ya guardada).
  useEffect(() => {
    if (lienzo.current) dibujarTarjeta(lienzo.current, form.estilo, datosGrafica, resp?.qr ?? null, urlImagen).catch(() => undefined);
  }, [form.estilo, datosGrafica, resp?.qr]);

  async function guardar() {
    setGuardando(true);
    setError('');
    setOk('');
    try {
      const { vistas: _vistas, ...datos } = form;
      void _vistas;
      const r = await api.put<Respuesta>('/tarjetas/mia', datos);
      setResp(r);
      if (r.tarjeta) setForm(r.tarjeta);
      setOk('Tarjeta guardada. Ya puedes compartir tu enlace y descargar tu tarjeta.');
      setRecarga((n) => n + 1);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  const guardada = !!resp?.tarjeta && !!resp.url;
  async function copiar() {
    if (!resp?.url) return;
    try { await navigator.clipboard.writeText(resp.url); setOk('Enlace copiado.'); } catch { setError('No se pudo copiar el enlace.'); }
  }
  async function compartir() {
    if (!resp?.url) return;
    if (navigator.share) { try { await navigator.share({ title: form.nombre, text: `Tarjeta digital de ${form.nombre}`, url: resp.url }); } catch { /* cerrado */ } } else await copiar();
  }
  function bajarTarjeta() {
    if (!lienzo.current) return;
    if (!form.fotoUrl && !window.confirm('Tu tarjeta no tiene foto. ¿Descargarla igual? Puedes agregar tu foto con «Subir foto» y volver a descargarla.')) return;
    descargarCanvas(lienzo.current, `tarjeta-${form.slug || 'fptecnologi'}-${form.estilo}.png`);
  }
  function bajarQr() {
    if (!resp?.qr) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([resp.qr], { type: 'image/svg+xml' }));
    a.download = `qr-${form.slug || 'tarjeta'}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const campo = (k: keyof Tarjeta, label: string, opciones: { ayuda?: string; area?: boolean; placeholder?: string } = {}) => (
    <div className="ax-field">
      <label className="ax-label" htmlFor={`t-${k}`}>{label}</label>
      {opciones.area ? (
        <textarea id={`t-${k}`} className="ax-textarea" rows={3} maxLength={400} value={v(form[k] as string)} onChange={(e) => set(k, e.target.value as never)} />
      ) : (
        <input id={`t-${k}`} className="ax-input" placeholder={opciones.placeholder} value={v(form[k] as string)} onChange={(e) => set(k, e.target.value as never)} />
      )}
      {opciones.ayuda && <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{opciones.ayuda}</span>}
    </div>
  );

  return (
    <>
      <PageHead
        title="Mi tarjeta digital"
        subtitle="Tu perfil profesional, de cualquier área del equipo. Aquí lo gestionas todo: tus datos, el estilo, tu enlace único para compartir y la tarjeta gráfica para descargar."
      />
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
      {ok && <p role="status" style={{ color: 'var(--ax-success-600, #15803d)' }}>{ok}</p>}

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)', marginBlockEnd: 'var(--ax-space-4)' }}>
        <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
          <strong>Tu tarjeta está al {completa}%</strong>
          <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{faltan.length === 0 ? 'Todo listo para compartir.' : `${faltan.length} cosa${faltan.length === 1 ? '' : 's'} por completar`}</span>
        </div>
        <div aria-hidden style={{ height: 8, borderRadius: 99, background: 'var(--ax-surface-subtle)', marginBlock: 8, overflow: 'hidden' }}>
          <div style={{ width: `${completa}%`, height: '100%', background: 'var(--ax-primary-500, #2898ee)', transition: 'width .3s' }} />
        </div>
        {faltan.length > 0 && (
          <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)', display: 'grid', gap: 4 }}>
            {faltan.map((f) => <li key={f.campo}>{f.aviso}</li>)}
          </ul>
        )}
      </section>

      <div style={{ display: 'grid', gap: 'var(--ax-space-5)', gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))', alignItems: 'start' }}>
        <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
            {form.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urlImagen(form.fotoUrl)} alt="Tu foto" width={72} height={72} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--ax-surface-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{(form.nombre || '?').charAt(0).toUpperCase()}</span>
            )}
            <SubirImagen etiqueta={form.fotoUrl ? 'Cambiar foto' : 'Subir foto'} onSubida={(urls) => set('fotoUrl', urls[0])} />
          </div>
          {campo('nombre', 'Nombre completo')}
          {campo('cargo', 'Cargo', { placeholder: 'Ejecutiva de ventas' })}
          {campo('area', 'Área', { placeholder: 'Ventas, Soporte, Marketing…' })}
          {campo('bio', 'Presentación corta', { area: true, ayuda: 'Hasta 400 caracteres. Qué haces y cómo ayudas al cliente.' })}
          {campo('telefono', 'Teléfono (como se muestra)', { placeholder: '+51 970 614 881' })}
          {campo('whatsapp', 'WhatsApp (con código de país)', { placeholder: '51970614881', ayuda: 'Solo números. Abre un chat directo contigo.' })}
          {campo('email', 'Correo')}
          {campo('linkedin', 'LinkedIn (enlace)', { placeholder: 'https://www.linkedin.com/in/…' })}
          {campo('web', 'Sitio web (enlace)', { placeholder: 'https://fptecnologi.com' })}
          {campo('agendaUrl', 'Enlace para agendar una reunión', { placeholder: 'https://calendly.com/…', ayuda: 'Opcional: Calendly, Google Calendar, Teams…' })}

          <div className="ax-field" style={{ gap: 'var(--ax-space-2)' }}>
            <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
              <span className="ax-label">Enlaces extra (aparecen como botones; hasta 12)</span>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={form.enlaces.length >= 12} onClick={() => set('enlaces', [...form.enlaces, { titulo: '', url: '' }])}>Agregar</button>
            </div>
            {form.enlaces.map((e, i) => (
              <div key={i} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
                <input className="ax-input" placeholder="Título" aria-label={`Título del enlace ${i + 1}`} value={e.titulo} onChange={(ev) => set('enlaces', form.enlaces.map((x, j) => (j === i ? { ...x, titulo: ev.target.value } : x)))} />
                <input className="ax-input" placeholder="https://…" aria-label={`Enlace ${i + 1}`} value={e.url} onChange={(ev) => set('enlaces', form.enlaces.map((x, j) => (j === i ? { ...x, url: ev.target.value } : x)))} />
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Quitar enlace" onClick={() => set('enlaces', form.enlaces.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>

          <div className="ax-field">
            <label className="ax-label" htmlFor="t-slug">Tu enlace único</label>
            <div className="ax-cluster" style={{ gap: 4, flexWrap: 'nowrap' }}>
              <span style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>/tarjeta/</span>
              <input id="t-slug" className="ax-input" placeholder="se genera con tu nombre" value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} />
            </div>
            <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Letras minúsculas, números y guiones. Es único para ti. Si lo cambias, el QR anterior deja de funcionar.</span>
          </div>
          <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap', fontSize: 'var(--ax-text-sm)' }}>
            <input type="checkbox" className="ax-switch" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} />
            Tarjeta visible al público
          </label>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
            <button type="button" className="ax-btn ax-btn--primary" disabled={guardando || form.nombre.trim().length < 2} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar tarjeta'}</button>
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
          <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <strong>Diseño de tu página</strong>
            <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Tu enlace único abre una página que puedes poner en tus redes, en tu biografía o enviar por WhatsApp.</span>
            <div style={{ display: 'grid', gap: 'var(--ax-space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))' }}>
              {([['perfil', 'Perfil completo', 'Tarjeta con tu presentación, contacto y QR. En computadora se ve en dos columnas.'], ['linktree', 'Estilo Linktree', 'Tu foto y una lista de botones grandes con todos tus enlaces, ideal para redes sociales.']] as const).map(([id, nombre, detalle]) => (
                <button key={id} type="button" aria-pressed={form.vista === id} onClick={() => set('vista', id)} style={{ textAlign: 'left', padding: 12, borderRadius: 12, border: form.vista === id ? '2px solid var(--ax-primary-500, #2898ee)' : '2px solid var(--ax-border)', background: 'transparent', cursor: 'pointer' }}>
                  <strong style={{ display: 'block', fontSize: 'var(--ax-text-sm)' }}>{nombre}</strong>
                  <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{detalle}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <strong>Estilo de tarjeta</strong>
            <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Los colores se aplican a tu página (en cualquier diseño) y a la tarjeta que descargas. Recuerda guardar para publicarlo.</span>
            <div style={{ display: 'grid', gap: 'var(--ax-space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))' }}>
              {ESTILOS_TARJETA.map((e) => (
                <Mini key={e.id} estilo={e.id} datos={form} activo={form.estilo === e.id} onElegir={() => set('estilo', e.id)} nombre={e.nombre} detalle={e.detalle} />
              ))}
            </div>
          </section>

          <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <strong>Tarjeta para descargar</strong>
            <canvas ref={lienzo} style={{ width: '100%', height: 'auto', aspectRatio: '1050 / 600', borderRadius: 12, border: '1px solid var(--ax-border)' }} />
            {!guardada && <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Guarda tu tarjeta para que se agregue tu código QR.</span>}
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
              <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={bajarTarjeta}>Descargar tarjeta (PNG)</button>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={!guardada} onClick={bajarQr}>Descargar solo el QR</button>
            </div>
            <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Imagen de 1050 × 600 px (3,5 × 2 pulgadas a 300 dpi), lista para imprimir o enviar por WhatsApp.</span>
          </section>

          <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <strong>Tu enlace para compartir</strong>
            {guardada ? (
              <>
                <code style={{ wordBreak: 'break-all', fontSize: 'var(--ax-text-sm)' }}>{`${WEB}/tarjeta/${resp!.tarjeta!.slug}`}</code>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                  <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={copiar}>Copiar enlace</button>
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={compartir}>Compartir…</button>
                  <a className="ax-btn ax-btn--ghost ax-btn--sm" href={`${WEB}/tarjeta/${resp!.tarjeta!.slug}`} target="_blank" rel="noreferrer">Abrir mi página</a>
                  <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{resp!.tarjeta!.vistas} visitas</span>
                </div>
                <div style={{ border: '1px solid var(--ax-border)', borderRadius: 12, overflow: 'hidden', height: 520 }}>
                  <iframe key={recarga} title="Vista previa de tu página" src={`${WEB}/tarjeta/${resp!.tarjeta!.slug}`} style={{ width: '100%', height: '100%', border: 0, background: '#fff' }} />
                </div>
              </>
            ) : (
              <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>Completa tus datos y pulsa «Guardar tarjeta»: aquí aparecerá tu enlace único, tu página y su vista previa.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default MiTarjeta;
