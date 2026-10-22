'use client';
/*
 * FPTecnologi-HUB — Libro de Reclamaciones (GET /libro-reclamaciones). Bandeja de las hojas que llegan de la web
 * pública: resumen por estado y plazo, filtros, búsqueda, detalle con TODOS los datos de la hoja, notas internas,
 * marcar en proceso y responder (la respuesta se envía por correo al consumidor). Exporta lo filtrado a CSV (interno).
 * El plazo viene de la API (`vencida`, `diasHabilesRestantes`): nunca se infiere en el cliente.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { Icon } from '../../components/ui/Icon';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Estado = 'RECIBIDO' | 'EN_PROCESO' | 'RESPONDIDO';

interface Hoja {
  id: string;
  codigo: string;
  fecha: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  nroDocumento: string;
  domicilio: string;
  telefono: string;
  email: string;
  menorEdad: boolean;
  repNombres: string | null;
  repTipoDocumento: string | null;
  repNroDocumento: string | null;
  tipoBien: 'PRODUCTO' | 'SERVICIO';
  montoReclamado: string | number | null;
  moneda: 'PEN' | 'USD';
  descripcionBien: string;
  nroPedido: string | null;
  tipo: 'RECLAMO' | 'QUEJA';
  detalle: string;
  pedidoConsumidor: string;
  medioRespuesta: 'CORREO' | 'CARTA';
  estado: Estado;
  fechaLimite: string;
  respuesta: string | null;
  respondidoAt: string | null;
  respondidoPor: string | null;
  notasInternas: string | null;
  atendidoPor: string | null;
  diasHabilesRestantes: number | null;
  vencida: boolean;
}

interface Resumen { recibidas: number; enProceso: number; porVencer: number; vencidas: number; respondidas: number }

const ESTADOS: { v: Estado; label: string; badge: string }[] = [
  { v: 'RECIBIDO', label: 'Recibido', badge: 'ax-badge--info' },
  { v: 'EN_PROCESO', label: 'En proceso', badge: 'ax-badge--warning' },
  { v: 'RESPONDIDO', label: 'Respondido', badge: 'ax-badge--success' },
];
const meta = (e: Estado) => ESTADOS.find((x) => x.v === e)!;

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
const fechaHora = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const consumidor = (h: Hoja) => `${h.nombres} ${h.apellidos}`;
const monto = (h: Hoja) => (h.montoReclamado == null || h.montoReclamado === '' ? '—' : `${h.moneda === 'USD' ? 'US$' : 'S/'} ${Number(h.montoReclamado).toFixed(2)}`);
const tipoLabel = (t: Hoja['tipo']) => (t === 'RECLAMO' ? 'Reclamo' : 'Queja');
const plural = (n: number) => `${n} día${n === 1 ? '' : 's'} háb.`;

/** Badge del plazo según lo que dice la API (vencida / diasHabilesRestantes). */
function plazo(h: Hoja): { texto: string; badge: string } {
  if (h.estado === 'RESPONDIDO') return { texto: 'Respondida', badge: 'ax-badge--neutral' };
  if (h.vencida) return { texto: 'Vencida', badge: 'ax-badge--danger' };
  const d = h.diasHabilesRestantes;
  if (d === null || d === undefined) return { texto: '—', badge: 'ax-badge--neutral' };
  if (d === 0) return { texto: 'Vence hoy', badge: 'ax-badge--warning' };
  return { texto: plural(d), badge: d <= 3 ? 'ax-badge--warning' : 'ax-badge--success' };
}

/** CSV de uso INTERNO: incluye documento y notas internas. Escapa fórmulas como CotizadorLeads. */
function csv(hojas: Hoja[]) {
  const cab = ['Código', 'Fecha', 'Tipo', 'Estado', 'Plazo', 'Fecha límite', 'Nombres', 'Apellidos', 'Tipo documento', 'Nro documento', 'Domicilio', 'Teléfono', 'Correo', 'Menor de edad', 'Representante', 'Doc. representante', 'Bien', 'Descripción del bien', 'Monto', 'Nro pedido', 'Detalle', 'Pedido del consumidor', 'Medio de respuesta', 'Respuesta', 'Respondido el', 'Respondido por', 'Atendido por', 'Notas internas'];
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@\t\r])/, "'$1")}"`;
  const filas = hojas.map((h) => [h.codigo, fecha(h.fecha), tipoLabel(h.tipo), meta(h.estado).label, plazo(h).texto, fecha(h.fechaLimite), h.nombres, h.apellidos, h.tipoDocumento, h.nroDocumento, h.domicilio, h.telefono, h.email, h.menorEdad ? 'Sí' : 'No', `${h.repNombres ?? ''}`, `${h.repTipoDocumento ?? ''} ${h.repNroDocumento ?? ''}`.trim(), h.tipoBien === 'PRODUCTO' ? 'Producto' : 'Servicio', h.descripcionBien, monto(h), h.nroPedido ?? '', h.detalle, h.pedidoConsumidor, h.medioRespuesta === 'CARTA' ? 'Carta' : 'Correo', h.respuesta ?? '', h.respondidoAt ? fechaHora(h.respondidoAt) : '', h.respondidoPor ?? '', h.atendidoPor ?? '', h.notasInternas ?? '']);
  const blob = new Blob(['﻿' + [cab, ...filas].map((f) => f.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `libro-reclamaciones-INTERNO-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const dt: React.CSSProperties = { color: 'var(--ax-text-muted)' };
const dd: React.CSSProperties = { margin: 0, wordBreak: 'break-word' };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(110px, auto) 1fr', gap: 'var(--ax-space-2) var(--ax-space-4)', fontSize: 'var(--ax-text-sm)', margin: 0 };
const H3: React.CSSProperties = { margin: '0 0 var(--ax-space-2)', fontSize: 'var(--ax-text-sm)', fontWeight: 'var(--ax-weight-semibold)' };
const fila = (k: string, v: React.ReactNode) => (<><dt style={dt}>{k}</dt><dd style={dd}>{v}</dd></>);
const bloque = (titulo: string, texto: string) => (
  <div className="ax-field"><span className="ax-label">{titulo}</span><p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 'var(--ax-text-sm)' }}>{texto}</p></div>
);

export function LibroReclamaciones() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Hoja[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'' | Estado>('');
  const [vencidas, setVencidas] = useState(false);
  const [q, setQ] = useState('');
  const [qDeb, setQDeb] = useState('');
  const [sel, setSel] = useState<Hoja | null>(null);
  const [notas, setNotas] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [modalErr, setModalErr] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  useFocusTrap(dialogRef, !!sel);

  useEffect(() => {
    const t = setTimeout(() => setQDeb(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    const mi = ++seq.current;
    const qs = new URLSearchParams();
    if (filtro) qs.set('estado', filtro);
    if (vencidas) qs.set('vencidas', 'true');
    if (qDeb) qs.set('q', qDeb);
    try {
      const [hojas, res] = await Promise.all([
        api.get<Hoja[]>(`/libro-reclamaciones${qs.size ? `?${qs}` : ''}`),
        api.get<Resumen>('/libro-reclamaciones/resumen'),
      ]);
      if (mi !== seq.current) return; // llegó una respuesta más nueva
      setLista(hojas);
      setResumen(res);
      setError('');
    } catch (e) {
      if (mi !== seq.current) return;
      setError(e instanceof ApiError ? e.message : 'No se pudo cargar el libro de reclamaciones.');
    } finally {
      if (mi === seq.current) setCargando(false);
    }
  }, [activeMarcaId, filtro, vencidas, qDeb]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  function abrir(h: Hoja) {
    setSel(h);
    setNotas(h.notasInternas ?? '');
    setRespuesta('');
    setAviso('');
    setModalErr('');
  }
  const cerrar = useCallback(() => setSel(null), []);

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel, cerrar]);

  async function guardar(req: () => Promise<Hoja>, okTexto: string, errTexto: string) {
    setGuardando(true);
    setAviso('');
    setModalErr('');
    try {
      const nueva = await req();
      setSel(nueva);
      setNotas(nueva.notasInternas ?? '');
      setAviso(okTexto);
      void cargar();
    } catch (e) {
      setModalErr(e instanceof ApiError ? e.message : errTexto);
    } finally {
      setGuardando(false);
    }
  }

  const marcarEnProceso = (h: Hoja) => guardar(() => api.patch<Hoja>(`/libro-reclamaciones/${h.id}`, { estado: 'EN_PROCESO' }), 'Marcada en proceso.', 'No se pudo cambiar el estado.');
  const guardarNotas = (h: Hoja) => guardar(() => api.patch<Hoja>(`/libro-reclamaciones/${h.id}`, { notasInternas: notas }), 'Notas guardadas.', 'No se pudieron guardar las notas.');
  function responder(h: Hoja) {
    const carta = h.medioRespuesta === 'CARTA';
    const ok = window.confirm(
      `La respuesta se enviará por correo a ${h.email} y la hoja quedará como respondida (ya no se podrá editar).` +
      (carta ? '\n\nEl consumidor eligió recibir la respuesta por CARTA: además del correo, debes enviársela por carta a su domicilio.' : '') +
      '\n\n¿Enviar la respuesta?',
    );
    if (!ok) return;
    void guardar(() => api.patch<Hoja>(`/libro-reclamaciones/${h.id}/responder`, { respuesta: respuesta.trim() }), 'Respuesta enviada por correo al consumidor.', 'No se pudo enviar la respuesta.');
  }

  const tarjetas: { icon: string; tono: string; label: string; valor: number | undefined }[] = [
    { icon: 'article', tono: 'c1', label: 'Recibidas', valor: resumen?.recibidas },
    { icon: 'briefcase-2', tono: 'c3', label: 'En proceso', valor: resumen?.enProceso },
    { icon: 'bell', tono: 'c2', label: 'Por vencer', valor: resumen?.porVencer },
    { icon: 'files', tono: 'c4', label: 'Vencidas', valor: resumen?.vencidas },
    { icon: 'messages', tono: 'c6', label: 'Respondidas', valor: resumen?.respondidas },
  ];
  const filtrando = !!(filtro || vencidas || qDeb);
  const respondida = sel?.estado === 'RESPONDIDO';

  return (
    <>
      <PageHead
        title="Libro de reclamaciones"
        subtitle="Hojas de reclamación de la web. La respuesta debe darse dentro de los 15 días hábiles que fija Indecopi."
        actions={
          <button type="button" className="ax-btn ax-btn--secondary" disabled={lista.length === 0} onClick={() => csv(lista)} title="Archivo interno: incluye documentos y notas internas">
            <span className="ax-btn__label">Exportar CSV (interno)</span>
          </button>
        }
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <div className="ax-dash-grid">
        <section className="ax-card ax-card--flat ax-col--12" role="region" aria-label="Resumen del libro" aria-busy={cargando}>
          <div className="ax-card__body">
            <div className="ax-statgroup">
              {tarjetas.map((t) => (
                <div key={t.label} className="ax-statgroup__cell">
                  <span className={`ax-statgroup__icon ax-statgroup__icon--${t.tono}`}><Icon name={t.icon} /></span>
                  <span className="ax-statgroup__text">
                    <span className="ax-statgroup__label">{t.label}</span>
                    <span className="ax-statgroup__value ax-num">{t.valor ?? '—'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ax-card ax-col--12" role="region" aria-label="Hojas de reclamación" style={{ alignSelf: 'start' }}>
          <div className="ax-card__body">
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
                <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
                  <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Filtrar por estado">
                    {([{ v: '' as const, label: 'Todas' }, ...ESTADOS] as { v: '' | Estado; label: string }[]).map((e) => (
                      <button key={e.label} type="button" role="radio" aria-checked={filtro === e.v} className={`ax-btn ax-btn--sm${filtro === e.v ? ' is-selected' : ''}`} onClick={() => setFiltro(e.v)}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="ax-cluster" style={{ gap: 'var(--ax-space-2)', fontSize: 'var(--ax-text-sm)' }}>
                  <input type="checkbox" checked={vencidas} onChange={(e) => setVencidas(e.target.checked)} />
                  Solo vencidas
                </label>
              </div>
              <input type="search" className="ax-input" placeholder="Buscar código, nombre, documento, correo…" value={q} maxLength={60} onChange={(e) => setQ(e.target.value)} aria-label="Buscar hojas de reclamación" style={{ maxWidth: 320 }} />
            </div>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head">
                <tr>
                  <th className="ax-table__th" scope="col">Código</th>
                  <th className="ax-table__th" scope="col">Fecha</th>
                  <th className="ax-table__th" scope="col">Consumidor</th>
                  <th className="ax-table__th" scope="col">Tipo</th>
                  <th className="ax-table__th" scope="col">Estado</th>
                  <th className="ax-table__th" scope="col">Plazo</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="ax-table__td" colSpan={6}>Cargando…</td></tr>
                ) : lista.length === 0 ? (
                  <tr><td className="ax-table__td" colSpan={6} style={{ color: 'var(--ax-text-muted)' }}>{error ? 'No se pudo cargar la lista.' : filtrando ? 'Ninguna hoja coincide con el filtro.' : 'Todavía no hay hojas de reclamación. Aparecerán cuando alguien llene el libro en la web.'}</td></tr>
                ) : (
                  lista.map((h) => {
                    const p = plazo(h);
                    return (
                      <tr key={h.id} className="ax-table__row" onClick={() => abrir(h)} style={{ cursor: 'pointer' }}>
                        <td className="ax-table__td">
                          <button type="button" className="ax-btn ax-btn--link" onClick={(ev) => { ev.stopPropagation(); abrir(h); }} aria-label={`Abrir hoja ${h.codigo}`}>{h.codigo}</button>
                        </td>
                        <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{fecha(h.fecha)}</td>
                        <td className="ax-table__td">
                          <div style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{consumidor(h)}</div>
                          <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{h.tipoDocumento} {h.nroDocumento}{h.menorEdad ? ' · menor de edad' : ''}</div>
                        </td>
                        <td className="ax-table__td">{tipoLabel(h.tipo)}</td>
                        <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--sm ${meta(h.estado).badge}`}>{meta(h.estado).label}</span></td>
                        <td className="ax-table__td"><span className={`ax-badge ax-badge--soft ax-badge--sm ${p.badge}`}>{p.texto}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {sel && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 400, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={cerrar} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="lr-title" className="ax-card" style={{ position: 'relative', maxWidth: 720, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="ax-card__header">
              <div className="ax-card__titles">
                <h2 className="ax-card__title" id="lr-title">Hoja {sel.codigo}</h2>
                <p className="ax-card__subtitle">{tipoLabel(sel.tipo)} · recibida el {fechaHora(sel.fecha)}</p>
              </div>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={cerrar}>Cerrar</button>
            </div>
            <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                <span className={`ax-badge ax-badge--soft ax-badge--sm ${meta(sel.estado).badge}`}>{meta(sel.estado).label}</span>
                <span className={`ax-badge ax-badge--soft ax-badge--sm ${plazo(sel).badge}`}>{plazo(sel).texto}</span>
                <span style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Fecha límite de respuesta: <b>{fecha(sel.fechaLimite)}</b></span>
              </div>

              <div aria-live="polite">
                {aviso && <div role="status" className="ax-alert ax-alert--success" style={{ padding: 'var(--ax-space-2) var(--ax-space-3)' }}><div className="ax-alert__content"><p className="ax-alert__message">{aviso}</p></div></div>}
              </div>
              {modalErr && <div role="alert" className="ax-alert ax-alert--danger" style={{ padding: 'var(--ax-space-2) var(--ax-space-3)' }}><div className="ax-alert__content"><p className="ax-alert__message">{modalErr}</p></div></div>}

              <section aria-label="Consumidor">
                <h3 className="ax-label" style={H3}>1. Consumidor reclamante</h3>
                <dl style={grid}>
                  {fila('Nombre', consumidor(sel))}
                  {fila('Documento', `${sel.tipoDocumento} ${sel.nroDocumento}`)}
                  {fila('Domicilio', sel.domicilio)}
                  {fila('Teléfono', <a href={`tel:${sel.telefono}`}>{sel.telefono}</a>)}
                  {fila('Correo', <a href={`mailto:${sel.email}`}>{sel.email}</a>)}
                  {fila('Menor de edad', sel.menorEdad ? 'Sí' : 'No')}
                  {sel.menorEdad && fila('Representante', `${sel.repNombres ?? '—'} · ${sel.repTipoDocumento ?? ''} ${sel.repNroDocumento ?? ''}`.trim())}
                </dl>
              </section>

              <section aria-label="Bien contratado">
                <h3 className="ax-label" style={H3}>2. Bien contratado</h3>
                <dl style={grid}>
                  {fila('Tipo', sel.tipoBien === 'PRODUCTO' ? 'Producto' : 'Servicio')}
                  {fila('Monto reclamado', monto(sel))}
                  {fila('Descripción', sel.descripcionBien)}
                  {fila('Nro. de pedido', sel.nroPedido || '—')}
                </dl>
              </section>

              <section aria-label="Detalle de la hoja" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
                <h3 className="ax-label" style={H3}>3. Detalle del {sel.tipo === 'RECLAMO' ? 'reclamo' : 'queja'}</h3>
                {bloque('Detalle', sel.detalle)}
                {bloque('Pedido del consumidor', sel.pedidoConsumidor)}
                <dl style={grid}>{fila('Medio de respuesta', sel.medioRespuesta === 'CARTA' ? 'Carta (a su domicilio)' : 'Correo electrónico')}</dl>
              </section>

              <section aria-label="Gestión" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
                <h3 className="ax-label" style={H3}>Gestión</h3>
                {sel.atendidoPor && <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Gestionó: {sel.atendidoPor}</p>}

                {sel.estado === 'RECIBIDO' && (
                  <div><button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={guardando} onClick={() => marcarEnProceso(sel)}><span className="ax-btn__label">Marcar en proceso</span></button></div>
                )}

                <div className="ax-field">
                  <label className="ax-label" htmlFor="lr-notas">Notas internas (el consumidor no las ve)</label>
                  <textarea id="lr-notas" className="ax-textarea" rows={3} maxLength={2000} value={notas} readOnly={respondida} onChange={(e) => setNotas(e.target.value)} placeholder="Llamadas, acuerdos, próximos pasos…" />
                  {!respondida && (
                    <div className="ax-cluster" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" disabled={guardando || notas === (sel.notasInternas ?? '')} onClick={() => guardarNotas(sel)}><span className="ax-btn__label">Guardar notas</span></button>
                    </div>
                  )}
                </div>

                {respondida ? (
                  <div className="ax-field">
                    <span className="ax-label">Respuesta enviada</span>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 'var(--ax-text-sm)' }}>{sel.respuesta}</p>
                    <p style={{ margin: 0, fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
                      {sel.respondidoAt ? fechaHora(sel.respondidoAt) : ''}{sel.respondidoPor || sel.atendidoPor ? ` · por ${sel.respondidoPor ?? sel.atendidoPor}` : ''}
                    </p>
                  </div>
                ) : (
                  <form className="ax-field" onSubmit={(ev) => { ev.preventDefault(); if (respuesta.trim().length >= 10) responder(sel); }}>
                    <label className="ax-label" htmlFor="lr-respuesta">Responder al consumidor</label>
                    {sel.medioRespuesta === 'CARTA' && (
                      <p role="note" style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-warning-500)' }}>
                        El consumidor eligió recibir la respuesta por carta: además del correo que enviará el sistema, debes enviársela por carta a su domicilio.
                      </p>
                    )}
                    <textarea id="lr-respuesta" className="ax-textarea" rows={5} maxLength={5000} value={respuesta} onChange={(e) => setRespuesta(e.target.value)} placeholder="Escribe la respuesta (mínimo 10 caracteres). Se enviará por correo a quien reclamó." aria-describedby="lr-resp-ayuda" />
                    <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                      <span id="lr-resp-ayuda" style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Se envía a {sel.email}. Al responder, la hoja se cierra.</span>
                      <button type="submit" className="ax-btn ax-btn--primary ax-btn--sm" disabled={guardando || respuesta.trim().length < 10}><span className="ax-btn__label">{guardando ? 'Enviando…' : 'Responder'}</span></button>
                    </div>
                  </form>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LibroReclamaciones;
