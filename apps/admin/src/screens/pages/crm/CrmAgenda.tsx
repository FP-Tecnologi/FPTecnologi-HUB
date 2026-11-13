'use client';
/*
 * FPTecnologi-HUB — CRM → Agenda: tareas pendientes (vencidas, hoy y próximas) y próximas acciones de las
 * oportunidades abiertas, de todo el equipo o solo las mías. «Hecha» cierra la tarea sin abrir la ficha.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../../components/shell/PageHead';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Alerta, OportunidadPanel, useVeTodoCrm, etapa, fechaHora, msg, nombreDe, vencida, type Actividad, type Etapa, type Oportunidad, type Usuario } from './comun';

type Tarea = Actividad & { oportunidad: { id: string; numero: string; titulo: string; etapa: Etapa; asignado: Usuario | null; contacto: { nombre: string } | null } };
const hoyFin = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };

export function CrmAgenda() {
  const { activeMarcaId } = useAuth();
  const [datos, setDatos] = useState<{ tareas: Tarea[]; acciones: Oportunidad[] } | null>(null);
  const [error, setError] = useState('');
  const [mias, setMias] = useState(true);
  const { veTodo } = useVeTodoCrm();
  const [abierta, setAbierta] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try { setDatos(await api.get(`/crm/agenda${mias ? '?mias=1' : ''}`)); setError(''); } catch (e) { setError(msg(e, 'No se pudo cargar la agenda.')); }
  }, [activeMarcaId, mias]);
  useEffect(() => { cargar(); }, [cargar]);

  async function hecha(t: Tarea) {
    try { await api.patch(`/crm/actividades/${t.id}`, { hecha: true }); cargar(); } catch (e) { setError(msg(e, 'No se pudo marcar.')); }
  }

  const grupos = (() => {
    const t = datos?.tareas ?? [];
    const fin = hoyFin();
    return [
      { titulo: 'Vencidas', filas: t.filter((x) => vencida(x.fecha)), tono: 'var(--ax-danger-500)' },
      { titulo: 'Hoy', filas: t.filter((x) => !vencida(x.fecha) && new Date(x.fecha).getTime() <= fin), tono: 'var(--ax-viz-amber)' },
      { titulo: 'Próximas', filas: t.filter((x) => new Date(x.fecha).getTime() > fin), tono: 'var(--ax-text-muted)' },
    ];
  })();

  return (
    <>
      <PageHead title="Agenda comercial" subtitle="Tareas y próximas acciones de las oportunidades abiertas." actions={
        !veTodo ? null : <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="De quién">
          <button type="button" role="radio" aria-checked={mias} className={`ax-btn ax-btn--sm${mias ? ' is-selected' : ''}`} onClick={() => setMias(true)}>Mías</button>
          <button type="button" role="radio" aria-checked={!mias} className={`ax-btn ax-btn--sm${!mias ? ' is-selected' : ''}`} onClick={() => setMias(false)}>Todo el equipo</button>
        </div>
      } />
      {error && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta>{error}</Alerta></div>}

      <div className="ax-dash-grid">
        <section className="ax-card ax-col--6" aria-label="Tareas pendientes">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Tareas pendientes</h2><p className="ax-card__subtitle">Se crean desde la ficha de cada oportunidad.</p></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
            {!datos ? <p>Cargando…</p> : datos.tareas.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>No hay tareas pendientes.</p> : grupos.filter((g) => g.filas.length).map((g) => (
              <div key={g.titulo}>
                <h3 style={{ margin: '0 0 var(--ax-space-2)', fontSize: 'var(--ax-text-sm)', color: g.tono }}>{g.titulo} ({g.filas.length})</h3>
                <ul className="ax-list ax-list--compact" style={{ margin: 0, padding: 0 }}>
                  {g.filas.map((t) => (
                    <li key={t.id} className="ax-list__row" style={{ paddingInline: 0, alignItems: 'flex-start' }}>
                      <span className="ax-list__content">
                        <span className="ax-list__title">{t.texto}</span>
                        <button type="button" className="ax-btn ax-btn--link" style={{ padding: 0, fontSize: 'var(--ax-text-xs)' }} onClick={() => setAbierta(t.oportunidad.id)}>
                          {t.oportunidad.numero} · {t.oportunidad.titulo}{t.oportunidad.contacto ? ` · ${t.oportunidad.contacto.nombre}` : ''}
                        </button>
                        <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{fechaHora(t.fecha)}{!mias ? ` · ${nombreDe(t.oportunidad.asignado)}` : ''}</span>
                      </span>
                      <span className="ax-list__trailing"><button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => hecha(t)}>Hecha</button></span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="ax-card ax-col--6" aria-label="Próximas acciones">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Próximas acciones</h2><p className="ax-card__subtitle">La «próxima acción» con fecha de cada oportunidad abierta.</p></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {!datos ? <p>Cargando…</p> : datos.acciones.length === 0 ? <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>Ninguna oportunidad abierta tiene una próxima acción con fecha.</p> : (
              <ul className="ax-list ax-list--compact" style={{ margin: 0, padding: 0 }}>
                {datos.acciones.map((o) => (
                  <li key={o.id} className="ax-list__row" style={{ paddingInline: 0, alignItems: 'flex-start' }}>
                    <span className="ax-list__content">
                      <span className="ax-list__title" style={{ color: vencida(o.proximaAccionAt) ? 'var(--ax-danger-500)' : undefined }}>{o.proximaAccion}</span>
                      <button type="button" className="ax-btn ax-btn--link" style={{ padding: 0, fontSize: 'var(--ax-text-xs)' }} onClick={() => setAbierta(o.id)}>
                        {o.numero} · {o.titulo}{o.empresa ? ` · ${o.empresa.razonSocial}` : ''}
                      </button>
                      <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{o.proximaAccionAt ? fechaHora(o.proximaAccionAt) : ''}{vencida(o.proximaAccionAt) ? ' · vencida' : ''} · {etapa(o.etapa).label}{!mias ? ` · ${nombreDe(o.asignado)}` : ''}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      {abierta && <OportunidadPanel id={abierta} onClose={() => setAbierta(null)} onCambio={cargar} />}
    </>
  );
}

export default CrmAgenda;
