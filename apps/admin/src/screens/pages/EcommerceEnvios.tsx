'use client';
/*
 * FPTecnologi-HUB — Ecommerce → Envíos: tarifario por departamento del courier
 * (Shalom). El checkout de la tienda toma de aquí el costo, el plazo y las
 * agencias; el servidor vuelve a cotizar al crear el pedido. El costo va en USD
 * (moneda del pedido) y sin IGV adicional: el courier factura aparte.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Tarifa { id: string; proveedor: string; departamento: string; costo: string; plazoDias: string | null; activo: boolean }

const DEPARTAMENTOS = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
];
const VACIA = { departamento: '', costo: '', plazoDias: '' };
const errMsg = (e: unknown, fb: string) => (e instanceof ApiError ? e.message : fb);

export function EcommerceEnvios() {
  const { activeMarcaId } = useAuth();
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [editId, setEditId] = useState<string | 'nueva' | null>(null);
  const [form, setForm] = useState(VACIA);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try { setTarifas(await api.get<Tarifa[]>('/envios/tarifas')); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo cargar el tarifario.') }); }
  }, [activeMarcaId]);
  useEffect(() => { void cargar(); }, [cargar]);

  async function accion(fn: () => Promise<unknown>, ok: string) {
    setAviso(null);
    try { await fn(); setAviso({ ok: true, texto: ok }); setEditId(null); await cargar(); }
    catch (e) { setAviso({ ok: false, texto: errMsg(e, 'No se pudo completar la acción.') }); }
  }

  function abrir(t?: Tarifa) {
    setEditId(t ? t.id : 'nueva');
    setForm(t ? { departamento: t.departamento, costo: String(Number(t.costo)), plazoDias: t.plazoDias ?? '' } : VACIA);
  }

  function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    const costo = Number(form.costo);
    if (!form.departamento || Number.isNaN(costo) || costo < 0) return;
    return editId === 'nueva'
      ? accion(() => api.post('/envios/tarifas', { departamento: form.departamento, costo, plazoDias: form.plazoDias }), 'Tarifa creada.')
      : accion(() => api.patch(`/envios/tarifas/${editId}`, { costo, plazoDias: form.plazoDias }), 'Tarifa actualizada.');
  }

  const usados = new Set(tarifas.map((t) => t.departamento));
  const th = (t: string, right = false) => <th className="ax-table__th" scope="col" style={right ? { textAlign: 'right' } : undefined}>{t}</th>;

  return (
    <>
      <PageHead
        title="Envíos"
        subtitle="Tarifas de envío por departamento (Shalom). El checkout de la tienda las usa para calcular el total."
        actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => abrir()}><span className="ax-btn__label">Nueva tarifa</span></button>}
      />
      <div className="ax-dash-grid">
        {aviso && (
          <div role={aviso.ok ? 'status' : 'alert'} className={`ax-alert ax-col--12 ${aviso.ok ? 'ax-alert--success' : 'ax-alert--danger'}`} style={{ padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
            <div className="ax-alert__content"><p className="ax-alert__message">{aviso.texto}</p></div>
          </div>
        )}
        <section className="ax-card ax-col--12" aria-label="Tarifas de envío">
          <div className="ax-card__body" style={{ paddingBottom: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
            Un departamento sin tarifa activa no ofrece envío en la tienda (solo recojo). El cliente elige la agencia Shalom más cercana de un directorio oficial (544 agencias) o con su ubicación; aquí solo defines cuánto cuesta y en cuánto tiempo llega a cada departamento.
          </div>
          {tarifas.length === 0 ? (
            <div className="ax-card__body" style={{ textAlign: 'center', color: 'var(--ax-text-muted)' }}>Aún no hay tarifas: la tienda solo ofrece recojo.</div>
          ) : (
            <div className="ax-table-wrap">
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head"><tr>{th('Departamento')}{th('Costo (USD)')}{th('Plazo')}{th('Estado')}{th('Acciones', true)}</tr></thead>
                <tbody>
                  {tarifas.map((t) => (
                    <tr key={t.id} className="ax-table__row">
                      <td className="ax-table__td" style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{t.departamento}</td>
                      <td className="ax-table__td" style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(t.costo).toFixed(2)}</td>
                      <td className="ax-table__td">{t.plazoDias ?? '—'}</td>
                      <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--pill ${t.activo ? 'ax-badge--success' : 'ax-badge--neutral'}`}>{t.activo ? 'Activa' : 'Inactiva'}</span></td>
                      <td className="ax-table__td" style={{ textAlign: 'right' }}>
                        <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end' }}>
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrir(t)}>Editar</button>
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => accion(() => api.patch(`/envios/tarifas/${t.id}`, { activo: !t.activo }), t.activo ? 'Tarifa desactivada.' : 'Tarifa activada.')}>{t.activo ? 'Desactivar' : 'Activar'}</button>
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => window.confirm(`¿Borrar la tarifa de ${t.departamento}?`) && accion(() => api.delete(`/envios/tarifas/${t.id}`), 'Tarifa eliminada.')}>Borrar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {editId && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setEditId(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
          <form onSubmit={guardar} role="dialog" aria-modal="true" aria-label="Tarifa de envío" className="ax-card" style={{ position: 'relative', maxWidth: 460, width: '100%' }}>
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">{editId === 'nueva' ? 'Nueva tarifa' : `Tarifa · ${form.departamento}`}</h2></div></div>
            <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              {editId === 'nueva' && (
                <div className="ax-field"><label className="ax-label" htmlFor="env-dep">Departamento</label>
                  <select id="env-dep" className="ax-select" required value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })}>
                    <option value="">Elige…</option>
                    {DEPARTAMENTOS.filter((d) => !usados.has(d)).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
              <div className="ax-field"><label className="ax-label" htmlFor="env-costo">Costo de envío (USD)</label><input id="env-costo" type="number" min={0} step="0.01" required className="ax-input" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} /></div>
              <div className="ax-field"><label className="ax-label" htmlFor="env-plazo">Plazo (opcional)</label><input id="env-plazo" className="ax-input" placeholder="2-3 días" value={form.plazoDias} onChange={(e) => setForm({ ...form, plazoDias: e.target.value })} /></div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEditId(null)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary" disabled={!form.departamento || form.costo === ''}>Guardar</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default EcommerceEnvios;
