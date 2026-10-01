'use client';
/*
 * FPTecnologi-HUB — Conocimiento del asistente (/conocimiento/*).
 * Tercera fuente del chat además de la web y la base de datos: documentos (Word, Excel, PDF, texto) que se leen
 * UNA vez al subirlos y quedan troceados e indexados, respuestas oficiales escritas a mano, preguntas que el
 * asistente no supo responder, un probador y las instrucciones de tono/políticas.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Documento { id: string; nombre: string; tipo: string; tamano: number; fragmentos: number; activo: boolean; createdAt: string }
interface Respuesta { id: string; titulo: string; texto: string; activo: boolean }
interface Pendiente { id: string; pregunta: string; veces: number; ultimaVez: string }
interface Hallazgo { id: string; titulo: string; texto: string; origen: 'DOCUMENTO' | 'MANUAL' }

type Pestana = 'documentos' | 'respuestas' | 'pendientes' | 'probador' | 'instrucciones';
const PESTANAS: { id: Pestana; texto: string }[] = [
  { id: 'documentos', texto: 'Documentos' },
  { id: 'respuestas', texto: 'Respuestas oficiales' },
  { id: 'pendientes', texto: 'Sin respuesta' },
  { id: 'probador', texto: 'Probador' },
  { id: 'instrucciones', texto: 'Instrucciones' },
];

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const msg = (e: unknown, def: string) => (e instanceof ApiError ? e.message : def);

function Alerta({ texto }: { texto: string }) {
  if (!texto) return null;
  return (
    <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
      <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{texto}</p></div>
    </div>
  );
}

export function ChatConocimiento() {
  const { activeMarcaId } = useAuth();
  const [pestana, setPestana] = useState<Pestana>('documentos');
  const [error, setError] = useState('');
  const [docs, setDocs] = useState<Documento[]>([]);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [verDoc, setVerDoc] = useState<{ id: string; frags: Respuesta[] } | null>(null);
  const [form, setForm] = useState<{ id?: string; pregunta: string; respuesta: string; pendienteId?: string } | null>(null);
  const [prueba, setPrueba] = useState('');
  const [hallazgos, setHallazgos] = useState<Hallazgo[] | null>(null);
  const [instr, setInstr] = useState('');
  const [instrOk, setInstrOk] = useState(false);
  const archivoRef = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      const [d, r, p, i] = await Promise.all([
        api.get<Documento[]>('/conocimiento/documentos'),
        api.get<Respuesta[]>('/conocimiento/respuestas'),
        api.get<Pendiente[]>('/conocimiento/pendientes'),
        api.get<{ texto: string }>('/conocimiento/instrucciones'),
      ]);
      setDocs(d); setRespuestas(r); setPendientes(p); setInstr(i.texto);
      setError('');
    } catch (e) {
      setError(msg(e, 'No se pudo cargar el conocimiento.'));
    }
  }, [activeMarcaId]);

  useEffect(() => { cargar(); }, [cargar]);

  async function accion(fn: () => Promise<unknown>, def: string) {
    try { await fn(); setError(''); await cargar(); } catch (e) { setError(msg(e, def)); }
  }

  async function subir(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    ev.target.value = '';
    if (!f) return;
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('archivo', f);
      await api.post('/conocimiento/documentos', fd);
      setError('');
      await cargar();
    } catch (e) {
      setError(msg(e, 'No se pudo procesar el archivo.'));
    } finally {
      setSubiendo(false);
    }
  }

  async function abrirDoc(d: Documento) {
    if (verDoc?.id === d.id) return setVerDoc(null);
    try { setVerDoc({ id: d.id, frags: await api.get<Respuesta[]>(`/conocimiento/documentos/${d.id}/fragmentos`) }); }
    catch (e) { setError(msg(e, 'No se pudo abrir el documento.')); }
  }

  async function guardarRespuesta(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form) return;
    const body = { pregunta: form.pregunta, respuesta: form.respuesta };
    await accion(async () => {
      if (form.id) await api.patch(`/conocimiento/respuestas/${form.id}`, body);
      else await api.post('/conocimiento/respuestas', { ...body, pendienteId: form.pendienteId });
      setForm(null);
    }, 'No se pudo guardar la respuesta.');
  }

  async function probar(ev: React.FormEvent) {
    ev.preventDefault();
    try { setHallazgos((await api.post<{ fragmentos: Hallazgo[] }>('/conocimiento/probar', { pregunta: prueba })).fragmentos); setError(''); }
    catch (e) { setError(msg(e, 'No se pudo probar.')); }
  }

  const tarjeta = { padding: 'var(--ax-space-4)' } as const;

  return (
    <>
      <PageHead title="Conocimiento del asistente" subtitle="Información extra para que el chat responda cuando la web y la tienda no la tienen." />
      <Alerta texto={error} />

      <div className="ax-tabs" style={{ marginBlockEnd: 'var(--ax-space-4)' }}>
        <div className="ax-tabs__list" role="tablist" aria-label="Secciones">
          {PESTANAS.map((p) => (
            <button key={p.id} type="button" className="ax-tabs__tab" role="tab" aria-selected={pestana === p.id} onClick={() => setPestana(p.id)}>
              {p.texto}{p.id === 'pendientes' && pendientes.length > 0 ? ` (${pendientes.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {pestana === 'documentos' && (
        <section className="ax-card" style={tarjeta}>
          <div className="ax-cluster" style={{ justifyContent: 'space-between', marginBlockEnd: 'var(--ax-space-3)' }}>
            <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)', maxWidth: 560 }}>
              Sube Word (.docx), Excel (.xlsx), PDF, texto (.txt/.md) o .csv de hasta 10 MB. Se lee una sola vez y se guarda dividido en fragmentos con índice; el chat busca ahí, no vuelve a abrir el archivo.
            </p>
            <input ref={archivoRef} type="file" hidden accept=".docx,.xlsx,.pdf,.txt,.md,.csv" onChange={subir} />
            <button type="button" className={`ax-btn ax-btn--primary${subiendo ? ' is-loading' : ''}`} disabled={subiendo} onClick={() => archivoRef.current?.click()}>
              <span className="ax-btn__label">{subiendo ? 'Procesando…' : 'Subir documento'}</span>
            </button>
          </div>
          <div className="ax-table-wrap">
            <table className="ax-table ax-table--hover">
              <thead className="ax-table__head"><tr>
                <th className="ax-table__th" scope="col">Documento</th><th className="ax-table__th" scope="col">Fragmentos</th>
                <th className="ax-table__th" scope="col">Usar en el chat</th><th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
              </tr></thead>
              <tbody>
                {docs.length === 0 && <tr><td className="ax-table__td" colSpan={4} style={{ color: 'var(--ax-text-muted)' }}>Aún no hay documentos.</td></tr>}
                {docs.map((d) => (
                  <FilaDoc key={d.id} d={d} abierto={verDoc?.id === d.id} frags={verDoc?.id === d.id ? verDoc.frags : []}
                    onVer={() => abrirDoc(d)}
                    onActivo={() => accion(() => api.patch(`/conocimiento/documentos/${d.id}`, { activo: !d.activo }), 'No se pudo actualizar.')}
                    onBorrar={() => window.confirm(`¿Borrar «${d.nombre}»? El asistente dejará de usarlo.`) && accion(() => api.delete(`/conocimiento/documentos/${d.id}`), 'No se pudo borrar.')} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {pestana === 'respuestas' && (
        <section className="ax-card" style={tarjeta}>
          <div className="ax-cluster" style={{ justifyContent: 'space-between', marginBlockEnd: 'var(--ax-space-3)' }}>
            <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)' }}>Preguntas y respuestas tuyas: tienen prioridad sobre los documentos.</p>
            <button type="button" className="ax-btn ax-btn--primary" onClick={() => setForm({ pregunta: '', respuesta: '' })}><span className="ax-btn__label">Agregar respuesta</span></button>
          </div>
          {respuestas.length === 0 && <p style={{ color: 'var(--ax-text-muted)' }}>Aún no hay respuestas oficiales.</p>}
          {respuestas.map((r) => (
            <div key={r.id} className="ax-card" style={{ ...tarjeta, marginBlockEnd: 'var(--ax-space-3)', opacity: r.activo ? 1 : 0.55 }}>
              <strong style={{ color: 'var(--ax-text-strong)' }}>{r.titulo}</strong>
              <p style={{ whiteSpace: 'pre-wrap', margin: 'var(--ax-space-2) 0' }}>{r.texto}</p>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)' }}>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setForm({ id: r.id, pregunta: r.titulo, respuesta: r.texto })}>Editar</button>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => accion(() => api.patch(`/conocimiento/respuestas/${r.id}`, { activo: !r.activo }), 'No se pudo actualizar.')}>{r.activo ? 'Desactivar' : 'Activar'}</button>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => window.confirm('¿Borrar esta respuesta?') && accion(() => api.delete(`/conocimiento/respuestas/${r.id}`), 'No se pudo borrar.')}>Borrar</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {pestana === 'pendientes' && (
        <section className="ax-card" style={tarjeta}>
          <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)', marginBlockEnd: 'var(--ax-space-3)' }}>
            Preguntas de clientes que el asistente no encontró en tus documentos ni respuestas, de la más repetida a la menos. Respóndelas para que la próxima vez sepa.
          </p>
          {pendientes.length === 0 && <p style={{ color: 'var(--ax-text-muted)' }}>No hay preguntas pendientes.</p>}
          {pendientes.map((p) => (
            <div key={p.id} className="ax-cluster" style={{ justifyContent: 'space-between', padding: 'var(--ax-space-2) 0', borderBlockEnd: '1px solid var(--ax-border-subtle, #0001)' }}>
              <div><span>{p.pregunta}</span> <span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">{p.veces}×</span></div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)' }}>
                <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={() => { setForm({ pregunta: p.pregunta, respuesta: '', pendienteId: p.id }); setPestana('respuestas'); }}>Responder</button>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => accion(() => api.patch(`/conocimiento/pendientes/${p.id}/resolver`, {}), 'No se pudo actualizar.')}>Descartar</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {pestana === 'probador' && (
        <section className="ax-card" style={tarjeta}>
          <form className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockEnd: 'var(--ax-space-3)' }} onSubmit={probar}>
            <input className="ax-input" style={{ flex: 1, minWidth: 220 }} placeholder="Escribe una pregunta como la haría un cliente" value={prueba} onChange={(e) => setPrueba(e.target.value)} maxLength={300} required aria-label="Pregunta de prueba" />
            <button type="submit" className="ax-btn ax-btn--primary"><span className="ax-btn__label">Probar</span></button>
          </form>
          {hallazgos && hallazgos.length === 0 && <p style={{ color: 'var(--ax-text-muted)' }}>Sin coincidencias: el asistente no tendría información extra para esa pregunta.</p>}
          {hallazgos?.map((h) => (
            <div key={h.id} className="ax-card" style={{ ...tarjeta, marginBlockEnd: 'var(--ax-space-3)' }}>
              <span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">{h.origen === 'MANUAL' ? 'Respuesta oficial' : 'Documento'}</span>
              <strong style={{ marginInlineStart: 8 }}>{h.titulo}</strong>
              <p style={{ whiteSpace: 'pre-wrap', margin: 'var(--ax-space-2) 0 0' }}>{h.texto}</p>
            </div>
          ))}
        </section>
      )}

      {pestana === 'instrucciones' && (
        <section className="ax-card" style={tarjeta}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} onSubmit={(e) => { e.preventDefault(); accion(async () => { await api.put('/conocimiento/instrucciones', { texto: instr }); setInstrOk(true); }, 'No se pudo guardar.'); }}>
            <label className="ax-label" htmlFor="cn-instr">Instrucciones para el asistente (tono, políticas, qué no prometer)</label>
            <textarea id="cn-instr" className="ax-textarea" rows={8} maxLength={3000} value={instr} onChange={(e) => { setInstr(e.target.value); setInstrOk(false); }} placeholder="Ej.: Nunca prometas fechas de entrega exactas. Para descuentos por volumen, deriva a un asesor." />
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
              <button type="submit" className="ax-btn ax-btn--primary"><span className="ax-btn__label">Guardar</span></button>
              {instrOk && <span role="status" style={{ color: 'var(--ax-text-muted)' }}>Guardado</span>}
            </div>
          </form>
        </section>
      )}

      {form && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setForm(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
          <form role="dialog" aria-modal="true" aria-label="Respuesta oficial" className="ax-card" style={{ position: 'relative', maxWidth: 520, width: '100%', ...tarjeta, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }} onSubmit={guardarRespuesta}>
            <h2 className="ax-card__title">{form.id ? 'Editar respuesta' : 'Nueva respuesta oficial'}</h2>
            <div className="ax-field"><label className="ax-label" htmlFor="cn-p">Pregunta</label><input id="cn-p" className="ax-input" value={form.pregunta} onChange={(e) => setForm({ ...form, pregunta: e.target.value })} required minLength={3} maxLength={300} /></div>
            <div className="ax-field"><label className="ax-label" htmlFor="cn-r">Respuesta</label><textarea id="cn-r" className="ax-textarea" rows={6} value={form.respuesta} onChange={(e) => setForm({ ...form, respuesta: e.target.value })} required minLength={3} maxLength={3000} /></div>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setForm(null)}>Cancelar</button>
              <button type="submit" className="ax-btn ax-btn--primary"><span className="ax-btn__label">Guardar</span></button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function FilaDoc({ d, abierto, frags, onVer, onActivo, onBorrar }: { d: Documento; abierto: boolean; frags: Respuesta[]; onVer: () => void; onActivo: () => void; onBorrar: () => void }) {
  return (
    <>
      <tr className="ax-table__row">
        <td className="ax-table__td">
          <div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{d.nombre}</div>
          <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{d.tipo.toUpperCase()} · {kb(d.tamano)} · {new Date(d.createdAt).toLocaleDateString('es-PE')}</div>
        </td>
        <td className="ax-table__td">{d.fragmentos}</td>
        <td className="ax-table__td"><input type="checkbox" className="ax-switch" checked={d.activo} onChange={onActivo} aria-label={`Usar ${d.nombre} en el chat`} /></td>
        <td className="ax-table__td" style={{ textAlign: 'right' }}>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', justifyContent: 'flex-end' }}>
            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={onVer}>{abierto ? 'Ocultar' : 'Ver contenido'}</button>
            <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={onBorrar}>Borrar</button>
          </div>
        </td>
      </tr>
      {abierto && (
        <tr><td className="ax-table__td" colSpan={4}>
          {frags.map((f) => <p key={f.id} style={{ fontSize: 'var(--ax-text-sm)', marginBlockEnd: 'var(--ax-space-2)', whiteSpace: 'pre-wrap' }}><strong>{f.titulo}</strong>{'\n'}{f.texto}</p>)}
        </td></tr>
      )}
    </>
  );
}

export default ChatConocimiento;
