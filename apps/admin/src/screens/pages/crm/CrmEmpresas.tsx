'use client';
/*
 * FPTecnologi-HUB — CRM → Empresas y contactos: la cartera de la marca. Las solicitudes de la web crean o reutilizan
 * estos registros (por RUC y por correo), así que aquí se corrigen datos y se agregan los que llegan por otra vía.
 * Borrar: solo admin (las oportunidades quedan, sin la empresa o el contacto).
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../../components/shell/PageHead';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Alerta, Modal, msg } from './comun';

interface Empresa { id: string; razonSocial: string; ruc: string | null; rubro: string | null; web: string | null; telefono: string | null; direccion: string | null; notas: string | null; _count: { contactos: number; oportunidades: number } }
interface Contacto { id: string; nombre: string; cargo: string | null; email: string | null; celular: string | null; documento: string | null; notas: string | null; empresaId: string | null; empresa: { id: string; razonSocial: string } | null; _count: { oportunidades: number } }

const E_VACIA = { razonSocial: '', ruc: '', rubro: '', web: '', telefono: '', direccion: '', notas: '' };
const C_VACIO = { nombre: '', cargo: '', email: '', celular: '', documento: '', notas: '', empresaId: '' };
const fila = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--ax-space-3)' } as const;
const nulos = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.trim() || null]));

export function CrmEmpresas() {
  const { activeMarcaId, marcas } = useAuth();
  const esAdmin = marcas.find((m) => m.marcaId === activeMarcaId)?.rol.nombre === 'admin';
  const [tab, setTab] = useState<'empresas' | 'contactos'>('empresas');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [editE, setEditE] = useState<Empresa | 'nueva' | null>(null);
  const [editC, setEditC] = useState<Contacto | 'nuevo' | null>(null);
  const [fe, setFe] = useState(E_VACIA);
  const [fc, setFc] = useState(C_VACIO);
  const [modalErr, setModalErr] = useState('');
  const [busy, setBusy] = useState(false);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
    try {
      const [e, c] = await Promise.all([api.get<Empresa[]>(`/crm/empresas${qs}`), api.get<Contacto[]>(`/crm/contactos${qs}`)]);
      setEmpresas(e); setContactos(c); setError('');
    } catch (err) { setError(msg(err, 'No se pudo cargar la cartera.')); }
  }, [activeMarcaId, q]);
  useEffect(() => { const t = setTimeout(cargar, 250); return () => clearTimeout(t); }, [cargar]);
  // Para el selector de empresa del contacto se necesita la lista completa, no la filtrada.
  const [todas, setTodas] = useState<Empresa[]>([]);
  useEffect(() => { if (editC) api.get<Empresa[]>('/crm/empresas').then(setTodas).catch(() => undefined); }, [editC]);

  function abrirE(e: Empresa | 'nueva') {
    setModalErr('');
    setFe(e === 'nueva' ? E_VACIA : { razonSocial: e.razonSocial, ruc: e.ruc ?? '', rubro: e.rubro ?? '', web: e.web ?? '', telefono: e.telefono ?? '', direccion: e.direccion ?? '', notas: e.notas ?? '' });
    setEditE(e);
  }
  function abrirC(c: Contacto | 'nuevo') {
    setModalErr('');
    setFc(c === 'nuevo' ? C_VACIO : { nombre: c.nombre, cargo: c.cargo ?? '', email: c.email ?? '', celular: c.celular ?? '', documento: c.documento ?? '', notas: c.notas ?? '', empresaId: c.empresaId ?? '' });
    setEditC(c);
  }

  async function guardar(fn: () => Promise<unknown>, okTxt: string, cerrar: () => void) {
    setBusy(true); setModalErr('');
    try { await fn(); cerrar(); setOk(okTxt); cargar(); } catch (e) { setModalErr(msg(e, 'No se pudo guardar.')); } finally { setBusy(false); }
  }
  const guardarE = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (fe.razonSocial.trim().length < 2) return setModalErr('Escribe la razón social.');
    if (fe.ruc && !/^(10|15|16|17|20)\d{9}$/.test(fe.ruc)) return setModalErr('El RUC debe tener 11 dígitos.');
    const body = { ...nulos(fe), razonSocial: fe.razonSocial.trim() };
    guardar(() => (editE === 'nueva' ? api.post('/crm/empresas', body) : api.patch(`/crm/empresas/${(editE as Empresa).id}`, body)), editE === 'nueva' ? 'Empresa creada.' : 'Empresa actualizada.', () => setEditE(null));
  };
  const guardarC = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (fc.nombre.trim().length < 2) return setModalErr('Escribe el nombre.');
    const body = { ...nulos(fc), nombre: fc.nombre.trim() };
    guardar(() => (editC === 'nuevo' ? api.post('/crm/contactos', body) : api.patch(`/crm/contactos/${(editC as Contacto).id}`, body)), editC === 'nuevo' ? 'Contacto creado.' : 'Contacto actualizado.', () => setEditC(null));
  };
  async function borrar(ruta: string, nombre: string) {
    if (!window.confirm(`¿Eliminar «${nombre}»? Sus oportunidades se conservan.`)) return;
    try { await api.delete(ruta); setOk('Eliminado.'); cargar(); } catch (e) { setError(msg(e, 'No se pudo eliminar.')); }
  }

  const campo = (f: Record<string, string>, setF: (v: never) => void, k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="ax-field"><label className="ax-label" htmlFor={`crm-${k}`}>{label}</label>
      <input id={`crm-${k}`} className="ax-input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value } as never)} {...props} /></div>
  );

  return (
    <>
      <PageHead title="Empresas y contactos" subtitle="Cartera de clientes y prospectos de la marca. Las solicitudes de la web se agregan solas, sin duplicar por RUC ni por correo."
        actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => (tab === 'empresas' ? abrirE('nueva') : abrirC('nuevo'))}><span className="ax-btn__label">{tab === 'empresas' ? 'Nueva empresa' : 'Nuevo contacto'}</span></button>} />
      {error && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta>{error}</Alerta></div>}
      {ok && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta tono="success">{ok}</Alerta></div>}

      <section className="ax-card" aria-label="Cartera">
        <div className="ax-card__body ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
          <div className="ax-btn-group ax-btn-group--segmented" role="tablist" aria-label="Ver">
            <button type="button" role="tab" aria-selected={tab === 'empresas'} className={`ax-btn ax-btn--sm${tab === 'empresas' ? ' is-selected' : ''}`} onClick={() => setTab('empresas')}>Empresas ({empresas.length})</button>
            <button type="button" role="tab" aria-selected={tab === 'contactos'} className={`ax-btn ax-btn--sm${tab === 'contactos' ? ' is-selected' : ''}`} onClick={() => setTab('contactos')}>Contactos ({contactos.length})</button>
          </div>
          <input type="search" className="ax-input" placeholder={tab === 'empresas' ? 'Buscar razón social o RUC…' : 'Buscar nombre, correo o celular…'} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" style={{ maxWidth: 300 }} />
        </div>
        <div className="ax-table-wrap">
          {tab === 'empresas' ? (
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head"><tr>
                <th className="ax-table__th" scope="col">Empresa</th><th className="ax-table__th" scope="col">Rubro</th><th className="ax-table__th" scope="col">Teléfono</th>
                <th className="ax-table__th" scope="col">Contactos</th><th className="ax-table__th" scope="col">Oportunidades</th><th className="ax-table__th" scope="col"><span className="sr-only">Acciones</span></th>
              </tr></thead>
              <tbody>
                {empresas.length === 0 ? <tr><td className="ax-table__td" colSpan={6} style={{ color: 'var(--ax-text-muted)' }}>Sin empresas.</td></tr> : empresas.map((e) => (
                  <tr key={e.id} className="ax-table__row">
                    <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{e.razonSocial}</div>{e.ruc && <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>RUC {e.ruc}</div>}</td>
                    <td className="ax-table__td">{e.rubro ?? '—'}</td>
                    <td className="ax-table__td">{e.telefono ?? '—'}</td>
                    <td className="ax-table__td ax-num">{e._count.contactos}</td>
                    <td className="ax-table__td ax-num">{e._count.oportunidades}</td>
                    <td className="ax-table__td" style={{ whiteSpace: 'nowrap' }}>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrirE(e)}>Editar</button>
                      {esAdmin && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => borrar(`/crm/empresas/${e.id}`, e.razonSocial)}>Eliminar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head"><tr>
                <th className="ax-table__th" scope="col">Contacto</th><th className="ax-table__th" scope="col">Empresa</th><th className="ax-table__th" scope="col">Correo</th>
                <th className="ax-table__th" scope="col">Celular</th><th className="ax-table__th" scope="col">Oportunidades</th><th className="ax-table__th" scope="col"><span className="sr-only">Acciones</span></th>
              </tr></thead>
              <tbody>
                {contactos.length === 0 ? <tr><td className="ax-table__td" colSpan={6} style={{ color: 'var(--ax-text-muted)' }}>Sin contactos.</td></tr> : contactos.map((c) => (
                  <tr key={c.id} className="ax-table__row">
                    <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{c.nombre}</div>{c.cargo && <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{c.cargo}</div>}</td>
                    <td className="ax-table__td">{c.empresa?.razonSocial ?? '—'}</td>
                    <td className="ax-table__td">{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : '—'}</td>
                    <td className="ax-table__td">{c.celular ? <a href={`https://wa.me/51${c.celular}`} target="_blank" rel="noreferrer">{c.celular}</a> : '—'}</td>
                    <td className="ax-table__td ax-num">{c._count.oportunidades}</td>
                    <td className="ax-table__td" style={{ whiteSpace: 'nowrap' }}>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrirC(c)}>Editar</button>
                      {esAdmin && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => borrar(`/crm/contactos/${c.id}`, c.nombre)}>Eliminar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {editE && (
        <Modal titulo={editE === 'nueva' ? 'Nueva empresa' : `Editar ${editE.razonSocial}`} onClose={() => setEditE(null)}>
          <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} onSubmit={guardarE}>
            {modalErr && <Alerta>{modalErr}</Alerta>}
            {campo(fe, setFe as never, 'razonSocial', 'Razón social *', { maxLength: 160 })}
            <div style={fila}>{campo(fe, setFe as never, 'ruc', 'RUC', { inputMode: 'numeric', maxLength: 11 })}{campo(fe, setFe as never, 'rubro', 'Rubro', { maxLength: 80, placeholder: 'Ej. Educación, Minería' })}</div>
            <div style={fila}>{campo(fe, setFe as never, 'telefono', 'Teléfono', { maxLength: 40 })}{campo(fe, setFe as never, 'web', 'Web', { maxLength: 200 })}</div>
            {campo(fe, setFe as never, 'direccion', 'Dirección', { maxLength: 200 })}
            <div className="ax-field"><label className="ax-label" htmlFor="crm-enotas">Notas</label><textarea id="crm-enotas" className="ax-textarea" rows={3} maxLength={2000} value={fe.notas} onChange={(e) => setFe({ ...fe, notas: e.target.value })} /></div>
            <div className="ax-cluster" style={{ justifyContent: 'flex-end', gap: 'var(--ax-space-2)' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEditE(null)}>Cancelar</button>
              <button type="submit" className="ax-btn ax-btn--primary" disabled={busy}><span className="ax-btn__label">Guardar</span></button>
            </div>
          </form>
        </Modal>
      )}
      {editC && (
        <Modal titulo={editC === 'nuevo' ? 'Nuevo contacto' : `Editar ${editC.nombre}`} onClose={() => setEditC(null)}>
          <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} onSubmit={guardarC}>
            {modalErr && <Alerta>{modalErr}</Alerta>}
            <div style={fila}>{campo(fc, setFc as never, 'nombre', 'Nombre *', { maxLength: 160 })}{campo(fc, setFc as never, 'cargo', 'Cargo', { maxLength: 80 })}</div>
            <div style={fila}>{campo(fc, setFc as never, 'email', 'Correo', { type: 'email', maxLength: 120 })}{campo(fc, setFc as never, 'celular', 'Celular', { maxLength: 30 })}{campo(fc, setFc as never, 'documento', 'DNI / RUC', { maxLength: 15 })}</div>
            <div className="ax-field"><label className="ax-label" htmlFor="crm-cemp">Empresa</label>
              <select id="crm-cemp" className="ax-select" value={fc.empresaId} onChange={(e) => setFc({ ...fc, empresaId: e.target.value })}>
                <option value="">Sin empresa</option>{todas.map((e) => <option key={e.id} value={e.id}>{e.razonSocial}</option>)}
              </select></div>
            <div className="ax-field"><label className="ax-label" htmlFor="crm-cnotas">Notas</label><textarea id="crm-cnotas" className="ax-textarea" rows={3} maxLength={2000} value={fc.notas} onChange={(e) => setFc({ ...fc, notas: e.target.value })} /></div>
            <div className="ax-cluster" style={{ justifyContent: 'flex-end', gap: 'var(--ax-space-2)' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEditC(null)}>Cancelar</button>
              <button type="submit" className="ax-btn ax-btn--primary" disabled={busy}><span className="ax-btn__label">Guardar</span></button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export default CrmEmpresas;
