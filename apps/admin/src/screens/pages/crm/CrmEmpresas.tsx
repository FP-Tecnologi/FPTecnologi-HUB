'use client';
/*
 * FPTecnologi-HUB — CRM → Empresas y contactos: la cartera de la marca. Las solicitudes de la web crean o reutilizan
 * estos registros (por RUC y por correo), así que aquí se corrigen datos y se agregan los que llegan por otra vía.
 * Una empresa puede tener varias SEDES o subempresas (universidad con sedes, grupo con filiales) y varios CONTACTOS
 * (las personas con las que se trata): ambos se administran dentro de la ficha de la empresa.
 * Borrar: solo admin (las oportunidades quedan, sin la empresa o el contacto; las sedes pasan a ser empresas principales).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHead } from '../../../components/shell/PageHead';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Alerta, BotonIcono, Modal, dinero, etapa, montos, msg, nombreDe, numeroWa, useConfirmar, useVeTodoCrm, ABIERTAS, type Oportunidad } from './comun';
import { Select } from '../../../components/ui/Select';
import { descargarCsv } from '../../../lib/csv';

interface Empresa {
  id: string; razonSocial: string; ruc: string | null; rubro: string | null; web: string | null; telefono: string | null; direccion: string | null; notas: string | null;
  empresaPadreId: string | null; empresaPadre: { id: string; razonSocial: string } | null; _count: { contactos: number; oportunidades: number; sedes: number };
}
interface Contacto { id: string; nombre: string; cargo: string | null; email: string | null; celular: string | null; documento: string | null; notas: string | null; empresaId: string | null; empresa: { id: string; razonSocial: string } | null; _count: { oportunidades: number } }

const E_VACIA = { razonSocial: '', ruc: '', rubro: '', web: '', telefono: '', direccion: '', notas: '', empresaPadreId: '' };
const C_VACIO = { nombre: '', cargo: '', email: '', celular: '', documento: '', notas: '', empresaId: '' };
const fila = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--ax-space-3)' } as const;
const nulos = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.trim() || null]));
const subtitulo = { fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' } as const;

/** Ficha del cliente: sus oportunidades (de la empresa o del contacto), con lo abierto y lo ganado. */
function OportunidadesDeCliente({ filtro }: { filtro: { empresaId: string } | { contactoId: string } }) {
  const { veTodo } = useVeTodoCrm();
  const [lista, setLista] = useState<Oportunidad[] | null>(null);
  const [error, setError] = useState('');
  const qs = new URLSearchParams({ estado: 'todas', ...filtro }).toString();
  useEffect(() => { api.get<Oportunidad[]>(`/crm/oportunidades?${qs}`).then(setLista).catch((e) => setError(msg(e, 'No se pudieron cargar las oportunidades.'))); }, [qs]);
  const sumar = (f: Oportunidad[]) => f.reduce<Record<string, number>>((a, o) => ((a[o.moneda] = (a[o.moneda] ?? 0) + Number(o.monto ?? 0)), a), {});
  const abiertas = (lista ?? []).filter((o) => ABIERTAS.includes(o.etapa));
  const ganadas = (lista ?? []).filter((o) => o.etapa === 'GANADO');
  return (
    <section className="ax-card__body" style={{ borderTop: '1px solid var(--ax-border)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} aria-label="Oportunidades del cliente">
      <h3 style={{ margin: 0, fontSize: 'var(--ax-text-sm)' }}>{veTodo ? 'Oportunidades' : 'Mis oportunidades con este cliente'} ({lista?.length ?? '…'})</h3>
      {error && <Alerta>{error}</Alerta>}
      {lista && lista.length > 0 && <p style={{ margin: 0, ...subtitulo }}>Abierto: {montos(sumar(abiertas))} ({abiertas.length}) · Ganado: {montos(sumar(ganadas))} ({ganadas.length})</p>}
      {lista && lista.length === 0 ? <p style={{ margin: 0, ...subtitulo }}>Aún no hay oportunidades.</p> : (
        <ul className="ax-list" style={{ margin: 0, padding: 0 }}>
          {(lista ?? []).map((o) => (
            <li key={o.id} className="ax-list__row" style={{ paddingInline: 0 }}>
              <span className="ax-list__content"><span className="ax-list__title">{o.titulo}</span><span className="ax-list__meta">{[o.numero, etapa(o.etapa).label, dinero(o.monto, o.moneda), nombreDe(o.asignado)].join(' · ')}</span></span>
              <span className="ax-list__trailing"><Link className="ax-btn ax-btn--ghost ax-btn--sm" href={`${veTodo ? '/crm/oportunidades' : '/crm/mis-oportunidades'}?id=${o.id}`}>Abrir</Link></span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CrmEmpresas() {
  const { activeMarcaId, marcas } = useAuth();
  const esAdmin = marcas.find((m) => m.marcaId === activeMarcaId)?.rol.nombre === 'admin';
  // Descargar la cartera completa: solo quien ve todo el CRM.
  const { veTodo } = useVeTodoCrm();
  const { confirmar, dialogo } = useConfirmar();
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

  // Los selectores (empresa principal, empresa del contacto) y la ficha necesitan la lista completa, no la filtrada por la búsqueda.
  const [todas, setTodas] = useState<Empresa[]>([]);
  const [todosContactos, setTodosContactos] = useState<Contacto[]>([]);
  const recargarCompletas = useCallback(() => {
    api.get<Empresa[]>('/crm/empresas').then(setTodas).catch(() => undefined);
    api.get<Contacto[]>('/crm/contactos').then(setTodosContactos).catch(() => undefined);
  }, []);
  useEffect(() => { if (editE || editC) recargarCompletas(); }, [editE, editC, recargarCompletas]);

  const nombreCompleto = useCallback((e: { razonSocial: string; empresaPadre?: { razonSocial: string } | null }) => (e.empresaPadre ? `${e.empresaPadre.razonSocial} › ${e.razonSocial}` : e.razonSocial), []);

  // Tabla en jerarquía: cada empresa principal seguida de sus sedes. Con búsqueda, una sede puede aparecer sola.
  const filas = useMemo(() => {
    const ids = new Set(empresas.map((e) => e.id));
    const principales = empresas.filter((e) => !e.empresaPadreId || !ids.has(e.empresaPadreId));
    const salida: { e: Empresa; nivel: number }[] = [];
    const agregar = (e: Empresa, nivel: number, vistos: Set<string>) => {
      if (vistos.has(e.id)) return;
      vistos.add(e.id);
      salida.push({ e, nivel });
      empresas.filter((s) => s.empresaPadreId === e.id).forEach((s) => agregar(s, nivel + 1, vistos));
    };
    const vistos = new Set<string>();
    principales.forEach((e) => agregar(e, 0, vistos));
    return salida;
  }, [empresas]);

  function abrirE(e: Empresa | 'nueva', padreId = '') {
    setModalErr('');
    setFe(e === 'nueva' ? { ...E_VACIA, empresaPadreId: padreId } : { razonSocial: e.razonSocial, ruc: e.ruc ?? '', rubro: e.rubro ?? '', web: e.web ?? '', telefono: e.telefono ?? '', direccion: e.direccion ?? '', notas: e.notas ?? '', empresaPadreId: e.empresaPadreId ?? '' });
    setEditE(e);
  }
  function abrirC(c: Contacto | 'nuevo', empresaId = '') {
    setModalErr('');
    setFc(c === 'nuevo' ? { ...C_VACIO, empresaId } : { nombre: c.nombre, cargo: c.cargo ?? '', email: c.email ?? '', celular: c.celular ?? '', documento: c.documento ?? '', notas: c.notas ?? '', empresaId: c.empresaId ?? '' });
    setEditC(c);
  }

  async function guardar(fn: () => Promise<unknown>, okTxt: string, cerrar: () => void) {
    setBusy(true); setModalErr('');
    try { await fn(); cerrar(); setOk(okTxt); cargar(); recargarCompletas(); } catch (e) { setModalErr(msg(e, 'No se pudo guardar.')); } finally { setBusy(false); }
  }
  const guardarE = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (fe.razonSocial.trim().length < 2) return setModalErr('Escribe la razón social.');
    if (fe.ruc && !/^(10|15|16|17|20)\d{9}$/.test(fe.ruc)) return setModalErr('El RUC debe tener 11 dígitos.');
    const body = { ...nulos(fe), razonSocial: fe.razonSocial.trim() };
    guardar(() => (editE === 'nueva' ? api.post('/crm/empresas', body) : api.patch(`/crm/empresas/${(editE as Empresa).id}`, body)), editE === 'nueva' ? (fe.empresaPadreId ? 'Sede creada.' : 'Empresa creada.') : 'Empresa actualizada.', () => setEditE(null));
  };
  const guardarC = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (fc.nombre.trim().length < 2) return setModalErr('Escribe el nombre.');
    const body = { ...nulos(fc), nombre: fc.nombre.trim() };
    guardar(() => (editC === 'nuevo' ? api.post('/crm/contactos', body) : api.patch(`/crm/contactos/${(editC as Contacto).id}`, body)), editC === 'nuevo' ? 'Contacto creado.' : 'Contacto actualizado.', () => setEditC(null));
  };
  async function borrar(ruta: string, nombre: string, aviso = 'Sus oportunidades se conservan.') {
    if (!(await confirmar('Eliminar', `¿Eliminar «${nombre}»? ${aviso}`))) return;
    try { await api.delete(ruta); setOk('Eliminado.'); cargar(); recargarCompletas(); } catch (e) { setError(msg(e, 'No se pudo eliminar.')); }
  }

  const campo = (f: Record<string, string>, setF: (v: never) => void, k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="ax-field"><label className="ax-label" htmlFor={`crm-${k}`}>{label}</label>
      <input id={`crm-${k}`} className="ax-input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value } as never)} {...props} /></div>
  );

  // Ficha de la empresa abierta: sus sedes y sus contactos.
  const empresaAbierta = editE && editE !== 'nueva' ? editE : null;
  const sedesAbiertas = empresaAbierta ? todas.filter((s) => s.empresaPadreId === empresaAbierta.id) : [];
  const contactosAbiertos = empresaAbierta ? todosContactos.filter((c) => c.empresaId === empresaAbierta.id) : [];
  const padreDeNueva = editE === 'nueva' && fe.empresaPadreId ? todas.find((x) => x.id === fe.empresaPadreId) : null;

  function exportar() {
    if (tab === 'empresas') {
      descargarCsv('empresas', ['Razón social', 'Sede de', 'RUC', 'Rubro', 'Teléfono', 'Web', 'Dirección', 'Contactos', 'Oportunidades', 'Notas'],
        empresas.map((e) => [e.razonSocial, e.empresaPadre?.razonSocial, e.ruc, e.rubro, e.telefono, e.web, e.direccion, e._count.contactos, e._count.oportunidades, e.notas]));
    } else {
      descargarCsv('contactos', ['Nombre', 'Cargo', 'Empresa', 'Correo', 'Celular', 'DNI / RUC', 'Oportunidades', 'Notas'],
        contactos.map((c) => [c.nombre, c.cargo, c.empresa?.razonSocial, c.email, c.celular, c.documento, c._count.oportunidades, c.notas]));
    }
  }

  return (
    <>
      <PageHead title="Empresas y contactos" subtitle="Cartera de clientes y prospectos de la marca. Cada empresa puede tener sedes o subempresas y varios contactos. Las solicitudes de la web se agregan solas, sin duplicar por RUC ni por correo."
        actions={
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
            {veTodo && <button type="button" className="ax-btn ax-btn--secondary" disabled={(tab === 'empresas' ? empresas : contactos).length === 0} onClick={exportar}><span className="ax-btn__label">Exportar CSV</span></button>}
            <button type="button" className="ax-btn ax-btn--primary" onClick={() => (tab === 'empresas' ? abrirE('nueva') : abrirC('nuevo'))}><span className="ax-btn__label">{tab === 'empresas' ? 'Nueva empresa' : 'Nuevo contacto'}</span></button>
          </div>
        } />
      {error && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta>{error}</Alerta></div>}
      {ok && <div style={{ marginBlockEnd: 'var(--ax-space-4)' }}><Alerta tono="success">{ok}</Alerta></div>}

      <div>
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
                  <th className="ax-table__th" scope="col">Sedes</th><th className="ax-table__th" scope="col">Contactos</th><th className="ax-table__th" scope="col">Oportunidades</th><th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
                </tr></thead>
                <tbody>
                  {filas.length === 0 ? <tr><td className="ax-table__td" colSpan={7} style={{ color: 'var(--ax-text-muted)' }}>Sin empresas.</td></tr> : filas.map(({ e, nivel }) => (
                    <tr key={e.id} className="ax-table__row" onClick={() => abrirE(e)} style={{ cursor: 'pointer' }}>
                      <td className="ax-table__td" style={{ paddingInlineStart: nivel ? `calc(var(--ax-space-4) + ${nivel * 22}px)` : undefined }}>
                        <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{nivel > 0 && <span aria-hidden="true" style={{ color: 'var(--ax-text-subtle)' }}>↳ </span>}{e.razonSocial}</div>
                        <div style={subtitulo}>{e.empresaPadre ? `Sede de ${e.empresaPadre.razonSocial}` : ''}{e.empresaPadre && e.ruc ? ' · ' : ''}{e.ruc ? `RUC ${e.ruc}` : ''}</div>
                      </td>
                      <td className="ax-table__td">{e.rubro ?? '—'}</td>
                      <td className="ax-table__td">{e.telefono ?? '—'}</td>
                      <td className="ax-table__td ax-num">{e._count.sedes || '—'}</td>
                      <td className="ax-table__td ax-num">{e._count.contactos}</td>
                      <td className="ax-table__td ax-num">{e._count.oportunidades}</td>
                      <td className="ax-table__td" style={{ whiteSpace: 'nowrap', textAlign: 'right' }} onClick={(ev) => ev.stopPropagation()}>
                        <BotonIcono icono="edit" label={`Abrir ${e.razonSocial}`} onClick={() => abrirE(e)} />
                        {esAdmin && <BotonIcono icono="trash" label={`Eliminar ${e.razonSocial}`} peligro onClick={() => borrar(`/crm/empresas/${e.id}`, e.razonSocial, e._count.sedes ? 'Sus sedes pasan a ser empresas principales y sus oportunidades se conservan.' : undefined)} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="ax-table ax-table--hover">
                <thead className="ax-table__head"><tr>
                  <th className="ax-table__th" scope="col">Contacto</th><th className="ax-table__th" scope="col">Empresa</th><th className="ax-table__th" scope="col">Correo</th>
                  <th className="ax-table__th" scope="col">Celular</th><th className="ax-table__th" scope="col">Oportunidades</th><th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
                </tr></thead>
                <tbody>
                  {contactos.length === 0 ? <tr><td className="ax-table__td" colSpan={6} style={{ color: 'var(--ax-text-muted)' }}>Sin contactos.</td></tr> : contactos.map((c) => {
                    const emp = c.empresaId ? empresas.find((x) => x.id === c.empresaId) : undefined;
                    return (
                      <tr key={c.id} className="ax-table__row">
                        <td className="ax-table__td"><div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{c.nombre}</div>{c.cargo && <div style={subtitulo}>{c.cargo}</div>}</td>
                        <td className="ax-table__td">{emp ? nombreCompleto(emp) : (c.empresa?.razonSocial ?? '—')}</td>
                        <td className="ax-table__td">{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : '—'}</td>
                        <td className="ax-table__td">{c.celular ? <a href={`https://wa.me/${numeroWa(c.celular)}`} target="_blank" rel="noreferrer">{c.celular}</a> : '—'}</td>
                        <td className="ax-table__td ax-num">{c._count.oportunidades}</td>
                        <td className="ax-table__td" style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                          <BotonIcono icono="edit" label={`Editar ${c.nombre}`} onClick={() => abrirC(c)} />
                          {esAdmin && <BotonIcono icono="trash" label={`Eliminar ${c.nombre}`} peligro onClick={() => borrar(`/crm/contactos/${c.id}`, c.nombre)} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {editE && (
        <Modal ancho={760} titulo={editE === 'nueva' ? (padreDeNueva ? `Nueva sede de ${padreDeNueva.razonSocial}` : 'Nueva empresa') : editE.razonSocial} onClose={() => setEditE(null)}>
          <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} onSubmit={guardarE}>
            {modalErr && <Alerta>{modalErr}</Alerta>}
            {campo(fe, setFe as never, 'razonSocial', fe.empresaPadreId ? 'Nombre de la sede o subempresa *' : 'Razón social *', { maxLength: 160, placeholder: fe.empresaPadreId ? 'Ej. Sede Arequipa' : undefined })}
            <div style={fila}>{campo(fe, setFe as never, 'ruc', fe.empresaPadreId ? 'RUC (si es distinto al de la principal)' : 'RUC', { inputMode: 'numeric', maxLength: 11 })}{campo(fe, setFe as never, 'rubro', 'Rubro', { maxLength: 80, placeholder: 'Ej. Educación, Minería' })}</div>
            <div style={fila}>{campo(fe, setFe as never, 'telefono', 'Teléfono', { maxLength: 40 })}{campo(fe, setFe as never, 'web', 'Web', { maxLength: 200 })}</div>
            {campo(fe, setFe as never, 'direccion', 'Dirección', { maxLength: 200 })}
            <div className="ax-field"><label className="ax-label" htmlFor="crm-padre">Es sede o subempresa de</label>
              <Select id="crm-padre" className="ax-select" value={fe.empresaPadreId} onChange={(e) => setFe({ ...fe, empresaPadreId: e.target.value })}>
                <option value="">Ninguna (empresa principal)</option>
                {todas.filter((x) => x.id !== empresaAbierta?.id).map((x) => <option key={x.id} value={x.id}>{nombreCompleto(x)}</option>)}
              </Select></div>
            <div className="ax-field"><label className="ax-label" htmlFor="crm-enotas">Notas</label><textarea id="crm-enotas" className="ax-textarea" rows={3} maxLength={2000} value={fe.notas} onChange={(e) => setFe({ ...fe, notas: e.target.value })} /></div>
            <div className="ax-cluster" style={{ justifyContent: 'flex-end', gap: 'var(--ax-space-2)' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEditE(null)}>Cancelar</button>
              <button type="submit" className="ax-btn ax-btn--primary" disabled={busy}><span className="ax-btn__label">Guardar</span></button>
            </div>
          </form>

          {empresaAbierta && (
            <>
              <section className="ax-card__body" style={{ borderTop: '1px solid var(--ax-border)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} aria-label="Sedes y subempresas">
                <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--ax-text-sm)' }}>Sedes y subempresas ({sedesAbiertas.length})</h3>
                  <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => abrirE('nueva', empresaAbierta.id)}>Agregar sede</button>
                </div>
                {sedesAbiertas.length === 0 ? <p style={{ margin: 0, ...subtitulo }}>Esta empresa no tiene sedes. Agrégalas si tiene filiales, subsidiarias o campus (por ejemplo, una universidad con sedes).</p> : (
                  <ul className="ax-list" style={{ margin: 0, padding: 0 }}>
                    {sedesAbiertas.map((s) => (
                      <li key={s.id} className="ax-list__row" style={{ paddingInline: 0 }}>
                        <span className="ax-list__content"><span className="ax-list__title">{s.razonSocial}</span><span className="ax-list__meta">{[s.direccion, s.ruc ? `RUC ${s.ruc}` : null, `${s._count.contactos} contacto${s._count.contactos === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}</span></span>
                        <span className="ax-list__trailing"><button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrirE(s)}>Abrir</button></span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="ax-card__body" style={{ borderTop: '1px solid var(--ax-border)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} aria-label="Contactos de la empresa">
                <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--ax-text-sm)' }}>Contactos ({contactosAbiertos.length})</h3>
                  <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => abrirC('nuevo', empresaAbierta.id)}>Agregar contacto</button>
                </div>
                {contactosAbiertos.length === 0 ? <p style={{ margin: 0, ...subtitulo }}>Aún no hay personas de contacto. Puedes agregar varias: responsable de compras, TI, gerencia…</p> : (
                  <ul className="ax-list" style={{ margin: 0, padding: 0 }}>
                    {contactosAbiertos.map((c) => (
                      <li key={c.id} className="ax-list__row" style={{ paddingInline: 0 }}>
                        <span className="ax-list__content"><span className="ax-list__title">{c.nombre}{c.cargo ? ` · ${c.cargo}` : ''}</span><span className="ax-list__meta">{[c.email, c.celular].filter(Boolean).join(' · ') || 'Sin correo ni celular'}</span></span>
                        <span className="ax-list__trailing ax-cluster" style={{ gap: 'var(--ax-space-1)' }}>
                          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrirC(c)}>Editar</button>
                          {esAdmin && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => borrar(`/crm/contactos/${c.id}`, c.nombre)}>Eliminar</button>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <OportunidadesDeCliente key={empresaAbierta.id} filtro={{ empresaId: empresaAbierta.id }} />
            </>
          )}
        </Modal>
      )}
      {editC && (
        <Modal titulo={editC === 'nuevo' ? 'Nuevo contacto' : `Editar ${editC.nombre}`} onClose={() => setEditC(null)}>
          <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} onSubmit={guardarC}>
            {modalErr && <Alerta>{modalErr}</Alerta>}
            <div style={fila}>{campo(fc, setFc as never, 'nombre', 'Nombre *', { maxLength: 160 })}{campo(fc, setFc as never, 'cargo', 'Cargo', { maxLength: 80 })}</div>
            <div style={fila}>{campo(fc, setFc as never, 'email', 'Correo', { type: 'email', maxLength: 120 })}{campo(fc, setFc as never, 'celular', 'Celular', { maxLength: 30 })}{campo(fc, setFc as never, 'documento', 'DNI / RUC', { maxLength: 15 })}</div>
            <div className="ax-field"><label className="ax-label" htmlFor="crm-cemp">Empresa o sede</label>
              <Select id="crm-cemp" className="ax-select" value={fc.empresaId} onChange={(e) => setFc({ ...fc, empresaId: e.target.value })}>
                <option value="">Sin empresa</option>{todas.map((e) => <option key={e.id} value={e.id}>{nombreCompleto(e)}</option>)}
              </Select></div>
            <div className="ax-field"><label className="ax-label" htmlFor="crm-cnotas">Notas</label><textarea id="crm-cnotas" className="ax-textarea" rows={3} maxLength={2000} value={fc.notas} onChange={(e) => setFc({ ...fc, notas: e.target.value })} /></div>
            <div className="ax-cluster" style={{ justifyContent: 'flex-end', gap: 'var(--ax-space-2)' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEditC(null)}>Cancelar</button>
              <button type="submit" className="ax-btn ax-btn--primary" disabled={busy}><span className="ax-btn__label">Guardar</span></button>
            </div>
          </form>
          {editC !== 'nuevo' && <OportunidadesDeCliente key={editC.id} filtro={{ contactoId: editC.id }} />}
        </Modal>
      )}
      {dialogo}
    </>
  );
}

export default CrmEmpresas;
