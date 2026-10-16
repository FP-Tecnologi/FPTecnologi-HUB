'use client';
/*
 * FPTecnologi-HUB — Tarjetas del equipo (Web informativa). Para quien administra: tabla con las tarjetas digitales de todo
 * el equipo, qué le falta a cada una, enlace único, y puede EDITAR cualquiera (o crear la de quien aún no la tiene), con
 * vista previa en vivo. Cada persona también edita la suya en Mi cuenta → Mi tarjeta digital.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { SubirImagen, urlImagen } from '../../components/ui/SubirImagen';
import { ApiError, useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { PanelOpciones } from '../../components/tarjeta/PanelOpciones';
import { VistaPreviaReal } from '../../components/tarjeta/VistaPreviaReal';
import type { CampoMostrar } from '../../lib/tarjetaOpciones';
import { MenuPuntos } from '../../components/ui/MenuPuntos';
import { VACIA, type Tarjeta } from './MiTarjeta';

type Fila = Tarjeta & { id: string; usuarioId: string; propietario: string | null; url: string; faltantes: { campo: string; aviso: string }[] };
interface SinTarjeta { usuarioId: string; nombre: string; email: string; rol: string }
interface Datos { tarjetas: Fila[]; sinTarjeta: SinTarjeta[]; webBase?: string }
/** Qué se está editando: una tarjeta existente (id) o una nueva para alguien del equipo (usuarioId). */
type Edicion = { id?: string; usuarioId?: string; quien: string; form: Tarjeta };

const ESTILO: Record<string, string> = { clasico: 'Clásico', moderno: 'Moderno', oscuro: 'Oscuro', minimal: 'Minimal' };
const v = (x: string | null | undefined) => x ?? '';

/** `acciones`: se muestran a la derecha del título de la lista (p. ej. el selector de marca en Administración). */
export function WebTarjetasEquipo({ acciones }: { acciones?: ReactNode }) {
  const { activeMarcaId } = useAuth();
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'incompletas' | 'ocultas'>('todas');
  const [edit, setEdit] = useState<Edicion | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setDatos(await api.get<Datos>('/tarjetas'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las tarjetas.');
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar, activeMarcaId]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (datos?.tarjetas ?? []).filter((f) => {
      if (filtro === 'incompletas' && f.faltantes.length === 0) return false;
      if (filtro === 'ocultas' && f.activo) return false;
      return !t || [f.nombre, f.propietario, f.cargo, f.area, f.etiqueta, f.slug].some((x) => v(x).toLowerCase().includes(t));
    });
  }, [datos, q, filtro]);

  async function alternar(f: Fila) {
    try {
      await api.patch(`/tarjetas/${f.id}/activo`, { activo: !f.activo });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cambiar.');
    }
  }
  async function copiar(url: string) {
    try { await navigator.clipboard.writeText(url); setAviso('Enlace copiado.'); setError(''); } catch { setError('No se pudo copiar el enlace.'); }
  }

  const set = <K extends keyof Tarjeta>(k: K, valor: Tarjeta[K]) => setEdit((e) => (e ? { ...e, form: { ...e.form, [k]: valor } } : e));

  async function guardar() {
    if (!edit) return;
    setGuardando(true);
    setError('');
    try {
      const { vistas: _vistas, id: _id, ...cuerpo } = edit.form;
      void _vistas; void _id;
      const r = edit.id ? await api.put<Datos>(`/tarjetas/${edit.id}`, cuerpo) : await api.post<Datos>(`/tarjetas/para/${edit.usuarioId}`, cuerpo);
      setDatos(r);
      setEdit(null);
      setAviso('Tarjeta guardada.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  // «Mostrar en la tarjeta»: cada dato tiene su interruptor al lado; las mismas claves que usa la API.
  const mostrar = edit?.form.mostrar ?? {};
  const alternarMostrar = (id: CampoMostrar, visible: boolean) => set('mostrar', { ...mostrar, [id]: visible });
  const interruptor = (id: CampoMostrar, etiqueta: string) => (
    <label className="ax-cluster" style={{ gap: 6, flexWrap: 'nowrap', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)', cursor: 'pointer' }}>
      <input type="checkbox" className="ax-switch" checked={mostrar[id] !== false} onChange={(e) => alternarMostrar(id, e.target.checked)} aria-label={`Mostrar ${etiqueta} en la tarjeta`} />
      {mostrar[id] !== false ? 'Visible' : 'Oculto'}
    </label>
  );

  const campo = (k: keyof Tarjeta, label: string, placeholder?: string, id?: CampoMostrar) => (
    <div className="ax-field">
      <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <label className="ax-label" htmlFor={`a-${k}`}>{label}</label>
        {id && interruptor(id, label)}
      </div>
      <input id={`a-${k}`} className="ax-input" placeholder={placeholder} value={v(edit?.form[k] as string)} onChange={(e) => set(k, e.target.value as never)} />
    </div>
  );

  // Editar en la misma pantalla (sin ventana): reemplaza la lista y se vuelve con «Volver a la lista».
  if (edit) {
    return (
      <>
        <PageHead
          title={`${edit.id ? 'Editar tarjeta de' : 'Nueva tarjeta para'} ${edit.quien}`}
          subtitle="Los cambios se ven en la vista previa mientras editas. Guarda para publicarlos."
          actions={<button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEdit(null)}>← Volver a la lista</button>}
        />
        {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--ax-space-5)', alignItems: 'flex-start' }}>
          <section className="ax-card" style={{ flex: '1 1 24rem', minWidth: 0, padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--ax-space-4)', alignItems: 'flex-start' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                {edit.form.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={urlImagen(edit.form.fotoUrl)} alt="Foto" width={64} height={64} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ax-surface-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{(edit.form.nombre || '?').charAt(0).toUpperCase()}</span>
                )}
                <SubirImagen etiqueta={edit.form.fotoUrl ? 'Cambiar foto' : 'Subir foto'} onSubida={(urls) => set('fotoUrl', urls[0])} />
                {edit.form.fotoUrl && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => set('fotoUrl', '')}>Quitar foto</button>}
                {interruptor('foto', 'la foto')}
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                {edit.form.portadaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={urlImagen(edit.form.portadaUrl)} alt="Portada" style={{ width: 160, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <span style={{ width: 160, height: 60, borderRadius: 8, background: 'var(--ax-surface-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Sin portada</span>
                )}
                <SubirImagen etiqueta={edit.form.portadaUrl ? 'Cambiar portada' : 'Subir portada'} onSubida={(urls) => set('portadaUrl', urls[0])} />
                {edit.form.portadaUrl && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => set('portadaUrl', '')}>Quitar portada</button>}
              </div>
            </div>
            {campo('etiqueta', 'Nombre de la versión', 'Comercial, Redes…')}
            {campo('nombre', 'Nombre completo')}
            {campo('cargo', 'Cargo', undefined, 'cargo')}
            {campo('area', 'Área', undefined, 'area')}
            <div className="ax-field">
              <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <label className="ax-label" htmlFor="a-bio">Presentación corta</label>
                {interruptor('bio', 'la presentación')}
              </div>
              <textarea id="a-bio" className="ax-textarea" rows={3} maxLength={400} value={v(edit.form.bio)} onChange={(e) => set('bio', e.target.value)} />
            </div>
            {campo('telefono', 'Teléfono', '+51 970 614 881', 'telefono')}
            {campo('whatsapp', 'WhatsApp (solo números con código de país)', '51970614881', 'whatsapp')}
            {campo('email', 'Correo', undefined, 'email')}
            {campo('linkedin', 'LinkedIn (enlace)', 'https://www.linkedin.com/in/…', 'linkedin')}
            {campo('web', 'Sitio web (enlace)', 'https://fptecnologi.com', 'web')}
            {campo('agendaUrl', 'Enlace para agendar', 'https://calendly.com/…', 'agenda')}
            {campo('slug', 'Enlace único (/tarjeta/…)', 'se genera con el nombre')}

            <div className="ax-field" style={{ gap: 'var(--ax-space-2)' }}>
              <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                <span className="ax-label">Enlaces extra (hasta 12)</span>
                <span className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                  {interruptor('enlaces', 'los enlaces extra')}
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={edit.form.enlaces.length >= 12} onClick={() => set('enlaces', [...edit.form.enlaces, { titulo: '', url: '' }])}>Agregar</button>
                </span>
              </div>
              {edit.form.enlaces.map((e, i) => (
                <div key={i} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
                  <input className="ax-input" placeholder="Título" aria-label={`Título del enlace ${i + 1}`} value={e.titulo} onChange={(ev) => set('enlaces', edit.form.enlaces.map((x, j) => (j === i ? { ...x, titulo: ev.target.value } : x)))} />
                  <input className="ax-input" placeholder="https://…" aria-label={`Enlace ${i + 1}`} value={e.url} onChange={(ev) => set('enlaces', edit.form.enlaces.map((x, j) => (j === i ? { ...x, url: ev.target.value } : x)))} />
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Quitar enlace" onClick={() => set('enlaces', edit.form.enlaces.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>

            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
              <button type="button" className="ax-btn ax-btn--primary" disabled={guardando || edit.form.nombre.trim().length < 2} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEdit(null)}>Cancelar</button>
            </div>
          </section>

          <div style={{ flex: '1.7 1 36rem', minWidth: 0 }}>
            <VistaPreviaReal onCambio={set} base={datos?.webBase} t={edit.form} url={edit.id ? datos?.tarjetas.find((x) => x.id === edit.id)?.url : undefined} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)', marginBlockStart: 'var(--ax-space-4)' }}>
              <section className="ax-card" style={{ padding: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
                <strong>Botones de la tarjeta</strong>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-5)', flexWrap: 'wrap' }}>
                  {([['cotizar', 'Pide una cotización'], ['vcard', 'Guardar contacto'], ['compartir', 'Compartir']] as const).map(([id, nombre]) => (
                    <label key={id} className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap', fontSize: 'var(--ax-text-sm)' }}>
                      <input type="checkbox" className="ax-switch" checked={mostrar[id] !== false} onChange={(e) => alternarMostrar(id, e.target.checked)} />
                      {nombre}
                    </label>
                  ))}
                </div>
              </section>
              <PanelOpciones t={edit.form} onCambio={set} solo="qr" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Tarjetas del equipo" subtitle="Todas las tarjetas digitales del equipo en una tabla. Puedes editar la de cualquier persona, crear la de quien aún no la tiene, ocultarla o copiar su enlace." actions={acciones} />
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
      {aviso && <p role="status" style={{ color: 'var(--ax-text-muted)' }}>{aviso}</p>}

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)' }}>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap', marginBlockEnd: 'var(--ax-space-3)' }}>
          <input className="ax-input" style={{ maxWidth: 260 }} placeholder="Buscar persona, cargo, área o enlace…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
          {(['todas', 'incompletas', 'ocultas'] as const).map((id) => (
            <button key={id} type="button" aria-pressed={filtro === id} className={`ax-btn ax-btn--sm ${filtro === id ? 'ax-btn--secondary' : 'ax-btn--ghost'}`} onClick={() => setFiltro(id)}>
              {id === 'todas' ? `Todas (${datos?.tarjetas.length ?? 0})` : id === 'incompletas' ? 'Incompletas' : 'Ocultas'}
            </button>
          ))}
        </div>
        <div className="ax-table-wrap">
          <table className="ax-table ax-table--hover">
            <thead className="ax-table__head">
              <tr>
                <th className="ax-table__th" scope="col">Visible</th>
                <th className="ax-table__th" scope="col">Persona</th>
                <th className="ax-table__th" scope="col">Versión</th>
                <th className="ax-table__th" scope="col">Cargo / área</th>
                <th className="ax-table__th" scope="col">Diseño</th>
                <th className="ax-table__th" scope="col">Visitas</th>
                <th className="ax-table__th" scope="col">Estado</th>
                <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!datos ? (
                <tr><td className="ax-table__td" colSpan={8}>Cargando…</td></tr>
              ) : visibles.length === 0 ? (
                <tr><td className="ax-table__td" colSpan={8} style={{ color: 'var(--ax-text-muted)' }}>{datos.tarjetas.length === 0 ? 'Aún nadie del equipo creó su tarjeta.' : 'Ninguna tarjeta coincide con el filtro.'}</td></tr>
              ) : (
                visibles.map((f) => (
                  <tr key={f.id} className="ax-table__row" style={{ opacity: f.activo ? 1 : 0.6 }}>
                    <td className="ax-table__td">
                      <input type="checkbox" className="ax-switch" checked={f.activo} aria-label={`Tarjeta de ${f.nombre} visible al público`} onChange={() => void alternar(f)} />
                    </td>
                    <td className="ax-table__td">
                      <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
                        {f.fotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={urlImagen(f.fotoUrl)} alt="" width={40} height={40} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', background: 'var(--ax-surface-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{f.nombre.charAt(0).toUpperCase()}</span>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: 'block' }}>{f.nombre}</strong>
                          <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>/tarjeta/{f.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="ax-table__td">{f.etiqueta}</td>
                    <td className="ax-table__td">{[f.cargo, f.area].filter(Boolean).join(' · ') || <span style={{ color: 'var(--ax-text-subtle)' }}>Sin cargo</span>}</td>
                    <td className="ax-table__td">{f.vista === 'linktree' ? 'Linktree' : 'Perfil'} · {ESTILO[f.estilo] ?? f.estilo}</td>
                    <td className="ax-table__td">{f.vistas}</td>
                    <td className="ax-table__td">
                      <span className={`ax-badge ax-badge--soft ax-badge--sm ${f.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`}>{f.activo ? 'Visible' : 'Oculta'}</span>
                      {f.faltantes.length > 0 && <div title={f.faltantes.map((x) => x.aviso).join('\n')} style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-warning-600, #b45309)' }}>Falta: {f.faltantes.map((x) => x.campo).join(', ')}</div>}
                    </td>
                    <td className="ax-table__td" style={{ textAlign: 'right' }}>
                      <MenuPuntos etiqueta={`Acciones de ${f.nombre}`} opciones={[
                        { etiqueta: 'Editar', onClick: () => setEdit({ id: f.id, quien: f.propietario ?? f.nombre, form: f }) },
                        { etiqueta: 'Copiar enlace', onClick: () => void copiar(f.url) },
                        { etiqueta: 'Abrir tarjeta', href: f.url },
                      ]} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {datos && datos.sinTarjeta.length > 0 && (
        <section className="ax-card" style={{ padding: 'var(--ax-space-4)', marginBlockStart: 'var(--ax-space-4)' }}>
          <strong>Aún sin tarjeta ({datos.sinTarjeta.length})</strong>
          <p style={{ margin: '4px 0 8px', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Puedes crearla tú por ellos o pedirles que entren a Mi cuenta → Mi tarjeta digital.</p>
          <div className="ax-table-wrap">
            <table className="ax-table">
              <tbody>
                {datos.sinTarjeta.map((s) => (
                  <tr key={s.usuarioId} className="ax-table__row">
                    <td className="ax-table__td">{s.nombre}<span style={{ color: 'var(--ax-text-subtle)' }}> · {s.rol}</span></td>
                    <td className="ax-table__td" style={{ textAlign: 'right' }}>
                      <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => setEdit({ usuarioId: s.usuarioId, quien: s.nombre, form: { ...VACIA, nombre: s.nombre, email: s.email } })}>Crear tarjeta</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

export default WebTarjetasEquipo;
