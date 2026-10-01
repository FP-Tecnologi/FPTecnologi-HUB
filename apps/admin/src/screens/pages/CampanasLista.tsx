'use client';
/*
 * FPTecnologi-HUB — Campañas → Campañas (GET/POST/PATCH/DELETE /campanas): una campaña agrupa landing pages
 * (eventos, ofertas, anuncios), tiene fechas, objetivo y presupuesto, y muestra cuántos registros captó
 * cada landing. Es la vista para medir qué campañas traen contactos.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'BORRADOR' | 'ACTIVA' | 'FINALIZADA';
interface Campana {
  id: string; nombre: string; descripcion: string | null; objetivo: string | null; estado: Estado;
  inicio: string | null; fin: string | null; presupuesto: string | null; moneda: 'PEN' | 'USD';
  registros: number; landings: { id: string; nombre: string; slug: string; estado: 'BORRADOR' | 'PUBLICADA'; registros: number }[];
}
const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'BORRADOR', label: 'Borrador', badge: 'ax-badge--neutral' },
  { v: 'ACTIVA', label: 'Activa', badge: 'ax-badge--success' },
  { v: 'FINALIZADA', label: 'Finalizada', badge: 'ax-badge--info' },
];
const VACIA = { nombre: '', descripcion: '', objetivo: '', estado: 'BORRADOR' as Estado, inicio: '', fin: '', presupuesto: '', moneda: 'PEN' as 'PEN' | 'USD' };
const dia = (iso: string | null) => (iso ? iso.slice(0, 10) : '');
const verDia = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const errMsg = (e: unknown, fb: string) => (e instanceof ApiError ? e.message : fb);

export function CampanasLista() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Campana[]>([]);
  const [edit, setEdit] = useState<{ id: string | null; f: typeof VACIA } | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try { setLista(await api.get<Campana[]>('/campanas')); } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudieron cargar las campañas.') }); }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);

  function abrir(c?: Campana) {
    setEdit({ id: c?.id ?? null, f: c ? { nombre: c.nombre, descripcion: c.descripcion ?? '', objetivo: c.objetivo ?? '', estado: c.estado, inicio: dia(c.inicio), fin: dia(c.fin), presupuesto: c.presupuesto ? String(Number(c.presupuesto)) : '', moneda: c.moneda } : VACIA });
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!edit || edit.f.nombre.trim().length < 2) return;
    const f = edit.f;
    const body = {
      nombre: f.nombre.trim(), descripcion: f.descripcion, objetivo: f.objetivo, estado: f.estado, moneda: f.moneda,
      inicio: f.inicio ? new Date(`${f.inicio}T00:00:00`).toISOString() : '', fin: f.fin ? new Date(`${f.fin}T23:59:59`).toISOString() : '',
      ...(f.presupuesto !== '' && !Number.isNaN(Number(f.presupuesto)) ? { presupuesto: Number(f.presupuesto) } : {}),
    };
    setBusy(true); setAviso(null);
    try {
      if (edit.id) await api.patch(`/campanas/${edit.id}`, body); else await api.post('/campanas', body);
      setEdit(null); setAviso({ ok: true, texto: 'Campaña guardada.' }); await cargar();
    } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo guardar la campaña.') }); }
    finally { setBusy(false); }
  }

  const totalRegistros = lista.reduce((s, c) => s + c.registros, 0);

  return (
    <>
      <PageHead title="Campañas" subtitle="Agrupa tus landing pages por campaña y mide cuántos contactos trae cada una." actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => abrir()}><span className="ax-btn__label">Nueva campaña</span></button>} />
      <div className="ax-dash-grid">
        {aviso && <div role={aviso.ok ? 'status' : 'alert'} className={`ax-alert ax-col--12 ${aviso.ok ? 'ax-alert--success' : 'ax-alert--danger'}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{aviso.texto}</p></div></div>}
        <section className="ax-card ax-col--12"><div className="ax-card__body ax-cluster" style={{ gap: 'var(--ax-space-6)' }}>
          <div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>Campañas</div><strong style={{ fontSize: 'var(--ax-text-xl)' }}>{lista.length}</strong></div>
          <div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>Activas</div><strong style={{ fontSize: 'var(--ax-text-xl)' }}>{lista.filter((c) => c.estado === 'ACTIVA').length}</strong></div>
          <div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>Registros captados</div><strong style={{ fontSize: 'var(--ax-text-xl)' }}>{totalRegistros}</strong></div>
        </div></section>

        {lista.length === 0 ? (
          <section className="ax-card ax-col--12"><div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)', paddingBlock: 'var(--ax-space-8)' }}>Aún no hay campañas. Crea una y asigna tus landing pages desde Landing pages → Ajustes.</div></section>
        ) : lista.map((c) => {
          const est = ESTADOS.find((e) => e.v === c.estado)!;
          return (
            <section key={c.id} className="ax-card ax-col--6" aria-label={c.nombre}>
              <div className="ax-card__header">
                <div className="ax-card__titles"><h2 className="ax-card__title">{c.nombre}</h2><p className="ax-card__subtitle">{verDia(c.inicio)} → {verDia(c.fin)}{c.presupuesto ? ` · ${c.moneda} ${Number(c.presupuesto).toLocaleString('es-PE')}` : ''}</p></div>
                <span className={`ax-badge ax-badge--soft ax-badge--pill ${est.badge}`}>{est.label}</span>
              </div>
              <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
                {c.objetivo && <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Objetivo: {c.objetivo}</p>}
                <div>
                  <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)', marginBlockEnd: 4 }}>Landings ({c.landings.length}) · {c.registros} registros</div>
                  {c.landings.length === 0 ? <span style={{ color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-sm)' }}>Ninguna asignada.</span> : (
                    <ul className="ax-list">
                      {c.landings.map((l) => (
                        <li key={l.id} className="ax-list__row" style={{ paddingInline: 0 }}>
                          <span className="ax-list__content"><span className="ax-list__title"><a href={`/campanas/landings?id=${l.id}`}>{l.nombre}</a></span><span className="ax-list__meta">/l/{l.slug} · {l.estado === 'PUBLICADA' ? 'publicada' : 'borrador'}</span></span>
                          <span className="ax-list__trailing">{l.registros}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                  <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => abrir(c)}>Editar</button>
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={async () => { if (!window.confirm(`¿Eliminar la campaña “${c.nombre}”? Sus landings no se borran.`)) return; try { await api.delete(`/campanas/${c.id}`); await cargar(); } catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo eliminar.') }); } }}>Eliminar</button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {edit && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setEdit(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
          <form onSubmit={guardar} role="dialog" aria-modal="true" aria-label="Campaña" className="ax-card" style={{ position: 'relative', maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">{edit.id ? 'Editar campaña' : 'Nueva campaña'}</h2></div></div>
            <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <div className="ax-field"><label className="ax-label" htmlFor="cm-nombre">Nombre</label><input id="cm-nombre" className="ax-input" required autoFocus value={edit.f.nombre} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, nombre: e.target.value } })} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="cm-obj">Objetivo</label><input id="cm-obj" className="ax-input" placeholder="Ej. 200 registros en la feria" value={edit.f.objetivo} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, objetivo: e.target.value } })} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="cm-desc">Descripción</label><textarea id="cm-desc" className="ax-input" rows={3} value={edit.f.descripcion} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, descripcion: e.target.value } })} /></div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
                <div className="ax-field" style={{ flex: '1 1 140px' }}><label className="ax-label" htmlFor="cm-ini">Inicio</label><input id="cm-ini" type="date" className="ax-input" value={edit.f.inicio} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, inicio: e.target.value } })} /></div>
                <div className="ax-field" style={{ flex: '1 1 140px' }}><label className="ax-label" htmlFor="cm-fin">Fin</label><input id="cm-fin" type="date" className="ax-input" value={edit.f.fin} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, fin: e.target.value } })} /></div>
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
                <div className="ax-field" style={{ flex: '1 1 140px' }}><label className="ax-label" htmlFor="cm-pres">Presupuesto</label><input id="cm-pres" type="number" min={0} step="0.01" className="ax-input" value={edit.f.presupuesto} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, presupuesto: e.target.value } })} /></div>
                <div className="ax-field" style={{ flex: '0 1 100px' }}><label className="ax-label" htmlFor="cm-mon">Moneda</label><select id="cm-mon" className="ax-select" value={edit.f.moneda} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, moneda: e.target.value as 'PEN' | 'USD' } })}><option value="PEN">PEN</option><option value="USD">USD</option></select></div>
                <div className="ax-field" style={{ flex: '1 1 140px' }}><label className="ax-label" htmlFor="cm-est">Estado</label><select id="cm-est" className="ax-select" value={edit.f.estado} onChange={(e) => setEdit({ ...edit, f: { ...edit.f, estado: e.target.value as Estado } })}>{ESTADOS.map((e) => <option key={e.v} value={e.v}>{e.label}</option>)}</select></div>
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEdit(null)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary" disabled={busy || edit.f.nombre.trim().length < 2}>{busy ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default CampanasLista;
