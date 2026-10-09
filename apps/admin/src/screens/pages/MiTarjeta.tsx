'use client';
/*
 * FPTecnologi-HUB — Mi tarjeta digital (Mi cuenta). Cada persona del equipo comercial arma su tarjeta: foto, cargo,
 * contacto, enlaces y un QR. Se publica en {web}/tarjeta/<enlace> y se comparte por QR o enlace; el visitante puede
 * guardar el contacto (vCard), escribir por WhatsApp o pedir una cotización. Derecha: vista previa de la web real.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { SubirImagen, urlImagen } from '../../components/ui/SubirImagen';
import { ApiError, useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';

interface Tarjeta {
  slug: string; nombre: string; cargo: string | null; area: string | null; bio: string | null; fotoUrl: string | null; telefono: string | null;
  whatsapp: string | null; email: string | null; linkedin: string | null; web: string | null; agendaUrl: string | null;
  enlaces: { titulo: string; url: string }[]; activo: boolean; vistas: number;
}
interface Respuesta { tarjeta: Tarjeta | null; sugerido: { nombre: string; email: string; cargo: string; telefono: string }; url: string | null; qr: string | null }

const VACIA: Tarjeta = { slug: '', nombre: '', cargo: '', area: '', bio: '', fotoUrl: '', telefono: '', whatsapp: '', email: '', linkedin: '', web: '', agendaUrl: '', enlaces: [], activo: true, vistas: 0 };
const v = (x: string | null | undefined) => x ?? '';

export function MiTarjeta() {
  const { activeMarcaId } = useAuth();
  const [form, setForm] = useState<Tarjeta>(VACIA);
  const [resp, setResp] = useState<Respuesta | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [recarga, setRecarga] = useState(0);

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
      setOk('Tarjeta guardada.');
      setRecarga((n) => n + 1);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function copiar() {
    if (!resp?.url) return;
    try { await navigator.clipboard.writeText(resp.url); setOk('Enlace copiado.'); } catch { setError('No se pudo copiar el enlace.'); }
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
        subtitle="Tu perfil profesional (de cualquier área del equipo) para compartir por QR o enlace: tus datos, WhatsApp, un botón para guardar tu contacto y para pedir una cotización."
      />
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
      {ok && <p role="status" style={{ color: 'var(--ax-success-600, #15803d)' }}>{ok}</p>}

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
              <span className="ax-label">Enlaces extra (catálogos, ofertas, eventos…)</span>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={form.enlaces.length >= 8} onClick={() => set('enlaces', [...form.enlaces, { titulo: '', url: '' }])}>Agregar</button>
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
            <label className="ax-label" htmlFor="t-slug">Tu enlace</label>
            <div className="ax-cluster" style={{ gap: 4, flexWrap: 'nowrap' }}>
              <span style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-subtle)' }}>/tarjeta/</span>
              <input id="t-slug" className="ax-input" placeholder="se genera con tu nombre" value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} />
            </div>
            <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Letras minúsculas, números y guiones. Si cambias el enlace, el QR anterior deja de funcionar.</span>
          </div>
          <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap', fontSize: 'var(--ax-text-sm)' }}>
            <input type="checkbox" className="ax-switch" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} />
            Tarjeta visible al público
          </label>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
            <button type="button" className="ax-btn ax-btn--primary" disabled={guardando || form.nombre.trim().length < 2} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar tarjeta'}</button>
          </div>
        </section>

        <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
          {resp?.tarjeta && resp.url ? (
            <>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                <a className="ax-btn ax-btn--secondary ax-btn--sm" href={`${WEB}/tarjeta/${resp.tarjeta.slug}`} target="_blank" rel="noreferrer">Abrir tarjeta</a>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={copiar}>Copiar enlace</button>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={bajarQr}>Descargar QR</button>
                <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{resp.tarjeta.vistas} visitas</span>
              </div>
              <div style={{ border: '1px solid var(--ax-border)', borderRadius: 12, overflow: 'hidden', height: 640 }}>
                <iframe key={recarga} title="Vista previa de tu tarjeta" src={`${WEB}/tarjeta/${resp.tarjeta.slug}`} style={{ width: '100%', height: '100%', border: 0, background: '#fff' }} />
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--ax-text-muted)' }}>Completa tus datos y guarda: aquí verás tu tarjeta, su enlace y su QR para compartir.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default MiTarjeta;
