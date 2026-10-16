'use client';
/*
 * FPTecnologi-HUB — Mi tarjeta digital (Mi cuenta). Primero se ve lo ya generado (la tarjeta, su vista previa, el enlace, el
 * QR y las versiones) con un botón «Editar»; al pulsarlo se abre el editor completo (el mismo que usa el administrador):
 * datos con interruptor de visibilidad, diseño y estilo en la vista previa, botones y QR personalizable.
 * La página pública /tarjeta/<enlace> solo muestra el resultado; no se edita ahí.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { urlImagen } from '../../components/ui/SubirImagen';
import { ApiError, useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { EditorTarjeta } from '../../components/tarjeta/EditorTarjeta';
import { VistaPreviaReal, type MarcaTarjeta } from '../../components/tarjeta/VistaPreviaReal';
import { aplicarMostrar } from '../../lib/tarjetaOpciones';
import { descargarCanvas, dibujarTarjeta, type EstiloTarjeta } from '../../lib/tarjetaGrafica';
import { descargarQrPng, descargarQrSvg } from '../../lib/descargarQr';

export interface Tarjeta {
  id?: string; etiqueta: string; slug: string; estilo: EstiloTarjeta; vista: 'perfil' | 'linktree'; nombre: string; cargo: string | null; area: string | null; bio: string | null; fotoUrl: string | null; portadaUrl?: string | null; telefono: string | null;
  mostrar?: Record<string, boolean>; qrColor?: string | null; qrFondo?: string | null;
  whatsapp: string | null; email: string | null; linkedin: string | null; web: string | null; agendaUrl: string | null; cotizarUrl?: string | null;
  enlaces: { titulo: string; url: string }[]; activo: boolean; vistas: number;
}
type Guardada = Tarjeta & { id: string; url: string; qr: string };
interface Respuesta { tarjetas: Guardada[]; sugerido: { nombre: string; email: string; cargo: string; telefono: string }; guardadaId?: string | null; webBase?: string; marca?: MarcaTarjeta | null }

export const VACIA: Tarjeta = { etiqueta: 'Principal', slug: '', estilo: 'clasico', vista: 'perfil', nombre: '', cargo: '', area: '', bio: '', fotoUrl: '', portadaUrl: '', mostrar: {}, qrColor: '', qrFondo: '', telefono: '', whatsapp: '', email: '', linkedin: '', web: '', agendaUrl: '', enlaces: [], activo: true, vistas: 0 };

/** Qué le falta a la tarjeta y qué hacer. */
function pendientes(f: Tarjeta) {
  const p: { campo: string; aviso: string }[] = [];
  if (!f.fotoUrl) p.push({ campo: 'foto', aviso: 'Sube tu foto: las tarjetas con foto generan más confianza.' });
  if (!f.cargo?.trim()) p.push({ campo: 'cargo', aviso: 'Escribe tu cargo para que el cliente sepa quién eres.' });
  if (!f.bio?.trim()) p.push({ campo: 'bio', aviso: 'Agrega una presentación corta de lo que haces.' });
  if (!f.whatsapp?.trim() && !f.telefono?.trim()) p.push({ campo: 'contacto', aviso: 'Agrega tu WhatsApp o teléfono para que te puedan contactar.' });
  if (!f.email?.trim()) p.push({ campo: 'email', aviso: 'Agrega tu correo de contacto.' });
  return p;
}

export function MiTarjeta() {
  const { activeMarcaId } = useAuth();
  const [form, setForm] = useState<Tarjeta>(VACIA);
  const [resp, setResp] = useState<Respuesta | null>(null);
  /** Versión que se ve o edita: el id de una guardada, o null si es una nueva aún sin guardar. */
  const [selId, setSelId] = useState<string | null>(null);
  const [modo, setModo] = useState<'resumen' | 'editar'>('resumen');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);
  const lienzo = useRef<HTMLCanvasElement>(null);

  const nuevaBase = useCallback((r: Respuesta, etiqueta: string): Tarjeta => ({ ...VACIA, etiqueta, nombre: r.sugerido.nombre, email: r.sugerido.email, cargo: r.sugerido.cargo, telefono: r.sugerido.telefono }), []);
  const cargar = useCallback(async () => {
    try {
      const r = await api.get<Respuesta>('/tarjetas/mias');
      setResp(r);
      const primera = r.tarjetas[0];
      setSelId(primera?.id ?? null);
      setForm(primera ?? nuevaBase(r, 'Principal'));
      // Sin tarjeta todavía: se empieza directo por el editor.
      setModo(primera ? 'resumen' : 'editar');
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cargar tu tarjeta.');
    }
  }, [nuevaBase]);
  useEffect(() => { cargar(); }, [cargar, activeMarcaId]);

  const actual = resp?.tarjetas.find((t) => t.id === selId) ?? null;
  const set = <K extends keyof Tarjeta>(k: K, valor: Tarjeta[K]) => setForm((f) => ({ ...f, [k]: valor }));
  function elegir(t: Guardada) { setSelId(t.id); setForm(t); setOk(''); setError(''); setModo('resumen'); }
  function nuevaVersion(copiar: boolean) {
    if (!resp) return;
    const n = resp.tarjetas.length + 1;
    setSelId(null);
    setForm(copiar && actual ? { ...actual, id: undefined, slug: '', etiqueta: `${actual.etiqueta || 'Versión'} (copia)`, vistas: 0 } : nuevaBase(resp, `Versión ${n}`));
    setOk('');
    setError('');
    setModo('editar');
  }
  async function eliminar() {
    if (!actual || !window.confirm(`¿Eliminar la versión «${actual.etiqueta}»? Su enlace y su QR dejarán de funcionar.`)) return;
    try {
      const r = await api.delete<Respuesta>(`/tarjetas/mias/${actual.id}`);
      setResp(r);
      setSelId(r.tarjetas[0]?.id ?? null);
      setForm(r.tarjetas[0] ?? nuevaBase(r, 'Principal'));
      setModo(r.tarjetas[0] ? 'resumen' : 'editar');
      setOk('Versión eliminada.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  async function guardar(datosForm: Tarjeta = form): Promise<boolean> {
    setGuardando(true);
    setError('');
    setOk('');
    try {
      const { vistas: _vistas, id: _id, ...datos } = datosForm;
      void _vistas; void _id;
      const r = selId ? await api.put<Respuesta>(`/tarjetas/mias/${selId}`, datos) : await api.post<Respuesta>('/tarjetas/mias', datos);
      setResp(r);
      const g = r.tarjetas.find((t) => t.id === r.guardadaId) ?? r.tarjetas[0];
      if (g) { setSelId(g.id); setForm(g); }
      setOk('Tarjeta guardada. Ya puedes compartir tu enlace y descargar tu tarjeta.');
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
      return false;
    } finally {
      setGuardando(false);
    }
  }
  async function guardarYVolver() { if (await guardar()) setModo('resumen'); }
  /** Interruptor «visible al público» de la vista inicial: se guarda al instante. */
  async function alternarVisible() {
    if (!actual) return;
    await guardar({ ...actual, activo: !actual.activo });
  }
  function cancelarEdicion() {
    setError('');
    if (actual) { setForm(actual); setModo('resumen'); } else if (resp?.tarjetas[0]) { elegir(resp.tarjetas[0]); }
  }

  const urlPublica = actual?.url ?? '';
  const faltan = useMemo(() => pendientes(actual ?? form), [actual, form]);
  const completa = Math.round(((5 - faltan.length) / 5) * 100);
  const datosGrafica = useMemo(() => (actual ? { ...aplicarMostrar(actual), web: resp?.marca?.web ?? null, empresa: resp?.marca?.nombre ?? 'FPTecnologi & System' } : null), [actual, resp?.marca]);

  // Tarjeta gráfica descargable (con el QR de la tarjeta guardada).
  useEffect(() => {
    if (modo !== 'resumen' || !actual || !datosGrafica || !lienzo.current) return;
    dibujarTarjeta(lienzo.current, actual.estilo, datosGrafica, actual.mostrar?.qr === false ? null : actual.qr, urlImagen).catch(() => undefined);
  }, [modo, actual, datosGrafica]);

  async function copiar() {
    if (!urlPublica) return;
    try { await navigator.clipboard.writeText(urlPublica); setOk('Enlace copiado.'); } catch { setError('No se pudo copiar el enlace.'); }
  }
  async function compartir() {
    if (!urlPublica) return;
    if (navigator.share) { try { await navigator.share({ title: actual?.nombre, text: `Tarjeta digital de ${actual?.nombre}`, url: urlPublica }); } catch { /* cerrado */ } } else await copiar();
  }
  function bajarTarjeta() {
    if (!lienzo.current || !actual) return;
    if (!actual.fotoUrl && !window.confirm('Tu tarjeta no tiene foto. ¿Descargarla igual?')) return;
    descargarCanvas(lienzo.current, `tarjeta-${actual.slug || 'fptecnologi'}-${actual.estilo}.png`);
  }

  // ---------------------------------------------------------------- editor
  if (modo === 'editar') {
    return (
      <EditorTarjeta
        titulo={selId ? `Editar mi tarjeta · ${form.etiqueta || 'Principal'}` : resp?.tarjetas.length ? 'Nueva versión de mi tarjeta' : 'Crea tu tarjeta digital'}
        volver="← Volver a mi tarjeta"
        form={form}
        set={set}
        onGuardar={guardarYVolver}
        onCancelar={cancelarEdicion}
        guardando={guardando}
        error={error}
        webBase={resp?.webBase}
        marca={resp?.marca}
        url={urlPublica || undefined}
        conVersion={(resp?.tarjetas.length ?? 0) > 0 || !!selId}
        extra={actual && (resp?.tarjetas.length ?? 0) > 1 ? <button type="button" className="ax-btn ax-btn--ghost" style={{ color: 'var(--ax-danger-500)' }} onClick={eliminar}>Eliminar esta versión</button> : undefined}
      />
    );
  }

  // ---------------------------------------------------------------- vista inicial: lo ya generado
  return (
    <>
      <PageHead
        title="Mi tarjeta digital"
        subtitle="Tu tarjeta, su vista previa, tu enlace y tu QR para compartir."
        actions={
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={() => nuevaVersion(false)}>+ Nueva versión</button>
            <button type="button" className="ax-btn ax-btn--primary" disabled={!actual} onClick={() => { setForm(actual!); setOk(''); setModo('editar'); }}><span className="ax-btn__label">Editar tarjeta</span></button>
          </div>
        }
      />
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
      {ok && <p role="status" style={{ color: 'var(--ax-success-600, #15803d)' }}>{ok}</p>}

      {(resp?.tarjetas.length ?? 0) > 1 && (
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap', marginBlockEnd: 'var(--ax-space-4)' }}>
          <strong style={{ marginInlineEnd: 'var(--ax-space-2)' }}>Mis versiones</strong>
          {resp?.tarjetas.map((t) => (
            <button key={t.id} type="button" aria-pressed={t.id === selId} className={`ax-btn ax-btn--sm ${t.id === selId ? 'ax-btn--primary' : 'ax-btn--ghost'}`} onClick={() => elegir(t)}>{t.etiqueta}{t.activo ? '' : ' (oculta)'}</button>
          ))}
        </div>
      )}

      {!actual ? (
        <p style={{ color: 'var(--ax-text-muted)' }}>Cargando tu tarjeta…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--ax-space-5)', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 24rem', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
            <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                <strong>Tu tarjeta</strong>
                <label className="ax-cluster" style={{ gap: 6, flexWrap: 'nowrap', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" className="ax-switch" checked={actual.activo} disabled={guardando} onChange={() => void alternarVisible()} aria-label="Tarjeta visible al público" />
                  {actual.activo ? 'Visible al público' : 'Oculta'}
                </label>
              </div>
              <canvas ref={lienzo} style={{ width: '100%', height: 'auto', aspectRatio: '1050 / 600', borderRadius: 12, border: '1px solid var(--ax-border)' }} />
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={bajarTarjeta}>Descargar tarjeta (PNG)</button>
              </div>
              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Imagen de 1050 × 600 px (3,5 × 2 pulgadas a 300 dpi), lista para imprimir o enviar por WhatsApp.</span>
            </section>

            <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <strong>Tu enlace y tu QR</strong>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--ax-space-4)', alignItems: 'center' }}>
                {actual.mostrar?.qr !== false && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(actual.qr)}`} alt="Tu código QR" width={132} height={132} style={{ width: 132, height: 132, borderRadius: 8, border: '1px solid var(--ax-border)', flexShrink: 0 }} />
                )}
                <div style={{ flex: '1 1 14rem', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
                  <code style={{ wordBreak: 'break-all', fontSize: 'var(--ax-text-sm)' }}>{urlPublica}</code>
                  <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{actual.vistas} {actual.vistas === 1 ? 'visita' : 'visitas'} · al escanear el QR se abre este enlace.</span>
                  <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                    <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={copiar}>Copiar enlace</button>
                    <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={compartir}>Compartir…</button>
                    <a className="ax-btn ax-btn--ghost ax-btn--sm" href={urlPublica} target="_blank" rel="noreferrer">Abrir mi página</a>
                  </div>
                  {actual.mostrar?.qr !== false && (
                    <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                      <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => void descargarQrPng(actual.qr, actual.slug)}>Descargar QR (PNG)</button>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => descargarQrSvg(actual.qr, actual.slug)}>SVG</button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div style={{ flex: '1.4 1 28rem', minWidth: 0 }}>
            <section className="ax-card" style={{ padding: 'var(--ax-space-5)' }}>
              <VistaPreviaReal t={actual} url={urlPublica} base={resp?.webBase} marca={resp?.marca} />
            </section>
            <section className="ax-card" style={{ padding: 'var(--ax-space-4) var(--ax-space-5)', marginBlockStart: 'var(--ax-space-4)' }}>
              <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                <strong>Tu tarjeta está al {completa}%</strong>
                <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{faltan.length === 0 ? 'Todo listo para compartir.' : `${faltan.length} por completar`}</span>
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
          </div>
        </div>
      )}
    </>
  );
}

export default MiTarjeta;
