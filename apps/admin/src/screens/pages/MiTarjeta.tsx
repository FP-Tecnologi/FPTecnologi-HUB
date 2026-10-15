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

export interface Tarjeta {
  id?: string; etiqueta: string; slug: string; estilo: EstiloTarjeta; vista: 'perfil' | 'linktree'; nombre: string; cargo: string | null; area: string | null; bio: string | null; fotoUrl: string | null; telefono: string | null;
  whatsapp: string | null; email: string | null; linkedin: string | null; web: string | null; agendaUrl: string | null;
  enlaces: { titulo: string; url: string }[]; activo: boolean; vistas: number;
}
type Guardada = Tarjeta & { id: string; url: string; qr: string };
interface Respuesta { tarjetas: Guardada[]; sugerido: { nombre: string; email: string; cargo: string; telefono: string }; guardadaId?: string | null }

export const VACIA: Tarjeta = { etiqueta: 'Principal', slug: '', estilo: 'clasico', vista: 'perfil', nombre: '', cargo: '', area: '', bio: '', fotoUrl: '', telefono: '', whatsapp: '', email: '', linkedin: '', web: '', agendaUrl: '', enlaces: [], activo: true, vistas: 0 };
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

/* Paleta aproximada de cada estilo para la vista previa en vivo (la página real se ve en «Página publicada»). */
const PALETA: Record<EstiloTarjeta, { fondo: string; portada: string; texto: string; suave: string; boton: string; botonTxt: string; panel: string }> = {
  clasico: { fondo: '#f7f9fc', portada: 'linear-gradient(135deg,#2898ee,#1a6fb8)', texto: '#10243a', suave: '#5a6b7d', boton: '#2898ee', botonTxt: '#fff', panel: '#fff' },
  moderno: { fondo: 'linear-gradient(135deg,#eaf5ff,#fff,#d6ebff)', portada: 'linear-gradient(45deg,#1a6fb8,#2898ee,#8cc9fb)', texto: '#10243a', suave: '#5a6b7d', boton: 'linear-gradient(90deg,#1f86d8,#5db4f5)', botonTxt: '#fff', panel: 'rgba(255,255,255,.9)' },
  oscuro: { fondo: '#0b1623', portada: 'linear-gradient(135deg,#0f3a5f,#0b1623)', texto: '#fff', suave: 'rgba(255,255,255,.65)', boton: 'rgba(255,255,255,.12)', botonTxt: '#fff', panel: 'rgba(255,255,255,.06)' },
  minimal: { fondo: '#fff', portada: '#e8f3fd', texto: '#10243a', suave: '#5a6b7d', boton: '#10243a', botonTxt: '#fff', panel: '#fff' },
};

/** Cómo se verá la página pública mientras se edita (sin guardar). Marco de celular. */
export function VistaPrevia({ t }: { t: Tarjeta }) {
  const c = PALETA[t.estilo] ?? PALETA.clasico;
  const botones: string[] = [
    ...(t.whatsapp?.trim() ? ['Escríbeme por WhatsApp'] : []),
    ...(t.agendaUrl?.trim() ? ['Agenda una reunión'] : []),
    ...t.enlaces.filter((e) => e.titulo.trim()).map((e) => e.titulo),
    'Pide una cotización',
    ...(t.web?.trim() ? ['Visita nuestra web'] : []),
    ...(t.linkedin?.trim() ? ['LinkedIn'] : []),
    ...(t.email?.trim() ? [t.email] : []),
    ...(t.telefono?.trim() ? [t.telefono] : []),
    'Guardar mi contacto',
  ];
  const avatar = t.fotoUrl
    ? // eslint-disable-next-line @next/next/no-img-element
      <img src={urlImagen(t.fotoUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <span style={{ fontSize: 36, color: 'rgba(255,255,255,.8)', fontWeight: 700 }}>{(t.nombre || '?').charAt(0).toUpperCase()}</span>;
  const centrado = t.vista === 'linktree';
  const circulo = { width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', border: '3px solid #fff', background: c.portada, display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <div style={{ width: 300, maxWidth: '100%', margin: '0 auto', border: '8px solid #1b2430', borderRadius: 34, overflow: 'hidden', background: '#1b2430', boxShadow: '0 10px 30px rgba(0,0,0,.18)' }}>
      <div style={{ height: 520, overflowY: 'auto', background: c.fondo, color: c.texto, padding: centrado ? '28px 16px 20px' : 0, textAlign: centrado ? 'center' : 'left' }}>
        {centrado ? (
          <>
            <div style={{ ...circulo, margin: '0 auto' }}>{avatar}</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 10 }}>{t.nombre || 'Tu nombre'}</div>
            <div style={{ fontSize: 13, color: c.suave }}>{[t.cargo, t.area].filter(Boolean).join(' · ') || 'Tu cargo'}</div>
            <div style={{ fontSize: 12, fontStyle: 'italic', color: c.suave }}>FPTecnologi &amp; System</div>
            {t.bio && <p style={{ fontSize: 12, color: c.suave, margin: '8px 0 0' }}>{t.bio}</p>}
            <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
              {botones.map((b, i) => <span key={i} style={{ background: c.boton, color: c.botonTxt, borderRadius: 99, padding: '10px 12px', fontSize: 13, fontWeight: 600, wordBreak: 'break-word' }}>{b}</span>)}
            </div>
          </>
        ) : (
          <>
            <div style={{ height: 120, background: c.portada }} />
            <div style={{ ...circulo, margin: '-42px 0 0 16px', position: 'relative' }}>{avatar}</div>
            <div style={{ padding: '8px 16px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{t.nombre || 'Tu nombre'}</div>
              <div style={{ fontSize: 13, color: c.suave }}>{t.cargo || 'Tu cargo'}</div>
              {t.area && <div style={{ fontSize: 12, fontWeight: 600, color: '#2898ee' }}>{t.area}</div>}
              <div style={{ fontSize: 12, fontStyle: 'italic', color: c.suave }}>FPTecnologi &amp; System</div>
              {t.bio && <p style={{ fontSize: 12, color: c.suave, margin: '8px 0 0' }}>{t.bio}</p>}
              <div style={{ display: 'grid', gap: 6, marginTop: 12, background: c.panel, borderRadius: 16, padding: 8 }}>
                {botones.map((b, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, wordBreak: 'break-word' }}>
                    <span style={{ width: 26, height: 26, flex: '0 0 26px', borderRadius: '50%', background: t.estilo === 'minimal' ? '#10243a' : '#2898ee' }} />{b}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function MiTarjeta() {
  const { activeMarcaId } = useAuth();
  const [form, setForm] = useState<Tarjeta>(VACIA);
  const [resp, setResp] = useState<Respuesta | null>(null);
  /** Versión que se edita: el id de una guardada, o null si es una nueva aún sin guardar. */
  const [selId, setSelId] = useState<string | null>(null);
  const [panel, setPanel] = useState<'vivo' | 'publicada'>('vivo');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const lienzo = useRef<HTMLCanvasElement>(null);

  const nuevaBase = useCallback((r: Respuesta, etiqueta: string): Tarjeta => ({ ...VACIA, etiqueta, nombre: r.sugerido.nombre, email: r.sugerido.email, cargo: r.sugerido.cargo, telefono: r.sugerido.telefono }), []);
  const cargar = useCallback(async () => {
    try {
      const r = await api.get<Respuesta>('/tarjetas/mias');
      setResp(r);
      const primera = r.tarjetas[0];
      setSelId(primera?.id ?? null);
      setForm(primera ?? nuevaBase(r, 'Principal'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cargar tu tarjeta.');
    }
  }, [nuevaBase]);
  useEffect(() => { cargar(); }, [cargar, activeMarcaId]);

  const actual = resp?.tarjetas.find((t) => t.id === selId) ?? null;
  function elegir(t: Guardada) { setSelId(t.id); setForm(t); setOk(''); setError(''); }
  function nuevaVersion(copiar: boolean) {
    if (!resp) return;
    const n = resp.tarjetas.length + 1;
    setSelId(null);
    setForm(copiar ? { ...form, id: undefined, slug: '', etiqueta: `${form.etiqueta || 'Versión'} (copia)`, vistas: 0 } : nuevaBase(resp, `Versión ${n}`));
    setOk(copiar ? 'Copia lista: cámbiale lo que quieras y pulsa «Guardar» para publicarla con su propio enlace.' : 'Versión nueva: completa los datos y pulsa «Guardar».');
    setError('');
  }
  async function eliminar() {
    if (!actual || !window.confirm(`¿Eliminar la versión «${actual.etiqueta}»? Su enlace y su QR dejarán de funcionar.`)) return;
    try {
      const r = await api.delete<Respuesta>(`/tarjetas/mias/${actual.id}`);
      setResp(r);
      setSelId(r.tarjetas[0]?.id ?? null);
      setForm(r.tarjetas[0] ?? nuevaBase(r, 'Principal'));
      setOk('Versión eliminada.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  const set = <K extends keyof Tarjeta>(k: K, valor: Tarjeta[K]) => setForm((f) => ({ ...f, [k]: valor }));
  const faltan = useMemo(() => pendientes(form), [form]);
  const completa = Math.round(((5 - faltan.length) / 5) * 100);
  const guardada = !!actual;
  const urlPublica = actual?.url ?? '';
  const datosGrafica = useMemo(() => ({ ...form, empresa: 'FPTecnologi & System' }), [form]);

  // Tarjeta gráfica grande (con el QR de la tarjeta ya guardada).
  useEffect(() => {
    if (lienzo.current) dibujarTarjeta(lienzo.current, form.estilo, datosGrafica, actual?.qr ?? null, urlImagen).catch(() => undefined);
  }, [form.estilo, datosGrafica, actual?.qr]);

  async function guardar() {
    setGuardando(true);
    setError('');
    setOk('');
    try {
      const { vistas: _vistas, id: _id, ...datos } = form;
      void _vistas; void _id;
      const r = selId ? await api.put<Respuesta>(`/tarjetas/mias/${selId}`, datos) : await api.post<Respuesta>('/tarjetas/mias', datos);
      setResp(r);
      const g = r.tarjetas.find((t) => t.id === r.guardadaId) ?? r.tarjetas[0];
      if (g) { setSelId(g.id); setForm(g); }
      setOk('Tarjeta guardada. Ya puedes compartir tu enlace y descargar tu tarjeta.');
      setRecarga((n) => n + 1);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function copiar() {
    if (!urlPublica) return;
    try { await navigator.clipboard.writeText(urlPublica); setOk('Enlace copiado.'); } catch { setError('No se pudo copiar el enlace.'); }
  }
  async function compartir() {
    if (!urlPublica) return;
    if (navigator.share) { try { await navigator.share({ title: form.nombre, text: `Tarjeta digital de ${form.nombre}`, url: urlPublica }); } catch { /* cerrado */ } } else await copiar();
  }
  function bajarTarjeta() {
    if (!lienzo.current) return;
    if (!form.fotoUrl && !window.confirm('Tu tarjeta no tiene foto. ¿Descargarla igual? Puedes agregar tu foto con «Subir foto» y volver a descargarla.')) return;
    descargarCanvas(lienzo.current, `tarjeta-${form.slug || 'fptecnologi'}-${form.estilo}.png`);
  }
  function bajarQr() {
    if (!actual?.qr) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([actual.qr], { type: 'image/svg+xml' }));
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
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
          <strong style={{ marginInlineEnd: 'var(--ax-space-2)' }}>Mis versiones</strong>
          {resp?.tarjetas.map((t) => (
            <button key={t.id} type="button" aria-pressed={t.id === selId} className={`ax-btn ax-btn--sm ${t.id === selId ? 'ax-btn--primary' : 'ax-btn--ghost'}`} onClick={() => elegir(t)}>{t.etiqueta}{t.activo ? '' : ' (oculta)'}</button>
          ))}
          {selId === null && <span className="ax-btn ax-btn--sm ax-btn--primary" aria-current="true">{form.etiqueta || 'Nueva'} · sin guardar</span>}
          <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => nuevaVersion(false)}>+ Nueva versión</button>
          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => nuevaVersion(true)}>Duplicar esta</button>
        </div>
        <span style={{ display: 'block', marginBlockStart: 6, fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Cada versión tiene su propio enlace, QR y diseño: por ejemplo una para clientes y otra para redes. Los datos y la foto se editan en cada una.</span>
      </section>

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
            {form.fotoUrl && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => set('fotoUrl', '')}>Quitar foto</button>}
          </div>
          {campo('etiqueta', 'Nombre de esta versión', { placeholder: 'Comercial, Redes, Soporte…', ayuda: 'Solo para que la identifiques tú; no se muestra al público.' })}
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
            <button type="button" className="ax-btn ax-btn--primary" disabled={guardando || form.nombre.trim().length < 2} onClick={guardar}>{guardando ? 'Guardando…' : selId ? 'Guardar cambios' : 'Guardar tarjeta'}</button>
            {guardada && (resp?.tarjetas.length ?? 0) > 1 && <button type="button" className="ax-btn ax-btn--ghost" onClick={eliminar}>Eliminar esta versión</button>}
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
                <code style={{ wordBreak: 'break-all', fontSize: 'var(--ax-text-sm)' }}>{urlPublica}</code>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                  <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={copiar}>Copiar enlace</button>
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={compartir}>Compartir…</button>
                  <a className="ax-btn ax-btn--ghost ax-btn--sm" href={urlPublica} target="_blank" rel="noreferrer">Abrir mi página</a>
                  <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{actual!.vistas} visitas</span>
                </div>
              </>
            ) : (
              <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>Pulsa «Guardar» para generar el enlace único, el QR y poder compartir esta versión.</p>
            )}
          </section>

          <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
              <strong>Vista previa</strong>
              <div className="ax-cluster" style={{ gap: 4 }}>
                <button type="button" aria-pressed={panel === 'vivo'} className={`ax-btn ax-btn--sm ${panel === 'vivo' ? 'ax-btn--secondary' : 'ax-btn--ghost'}`} onClick={() => setPanel('vivo')}>En vivo</button>
                <button type="button" aria-pressed={panel === 'publicada'} className={`ax-btn ax-btn--sm ${panel === 'publicada' ? 'ax-btn--secondary' : 'ax-btn--ghost'}`} onClick={() => setPanel('publicada')}>Página publicada</button>
              </div>
            </div>
            {panel === 'vivo' ? (
              <>
                <VistaPrevia t={form} />
                <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', textAlign: 'center' }}>Se actualiza mientras escribes (aproximada). Guarda para publicar los cambios.</span>
              </>
            ) : guardada ? (
              <div style={{ border: '1px solid var(--ax-border)', borderRadius: 12, overflow: 'hidden', height: 520 }}>
                <iframe key={`${selId}-${recarga}`} title="Página publicada" src={urlPublica} style={{ width: '100%', height: '100%', border: 0, background: '#fff' }} />
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>Esta versión aún no está publicada. Pulsa «Guardar» para verla.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default MiTarjeta;
