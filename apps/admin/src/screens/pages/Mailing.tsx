'use client';
/*
 * FPTecnologi-HUB — Mailing (versión visual). Se arma un correo con bloques a partir de una plantilla, se ve en
 * vivo (escritorio / móvil), se copia o descarga el HTML, se duplica y se simula el envío a una lista.
 * Los mailings se guardan solo en este navegador (localStorage); todavía NO se envía ningún correo: falta
 * conectar un servicio de envío masivo (ver docs/PENDIENTES.md).
 */
import { useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

type Bloque =
  | { id: string; tipo: 'hero'; titulo: string; texto: string; imagen: string }
  | { id: string; tipo: 'texto'; titulo: string; texto: string }
  | { id: string; tipo: 'imagen'; imagen: string; alt: string }
  | { id: string; tipo: 'boton'; texto: string; url: string }
  | { id: string; tipo: 'productos'; titulo: string; items: { nombre: string; precio: string; url: string; imagen: string }[] }
  | { id: string; tipo: 'separador' };

interface Mailing { id: string; nombre: string; asunto: string; preheader: string; bloques: Bloque[]; actualizado: string }

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';
const COLOR = '#008DC5';
const KEY = 'fpt:mailings';
const uid = () => Math.random().toString(36).slice(2, 9);
const ETIQUETA: Record<Bloque['tipo'], string> = { hero: 'Portada', texto: 'Texto', imagen: 'Imagen', boton: 'Botón', productos: 'Productos', separador: 'Separador' };

const nuevoBloque = (tipo: Bloque['tipo']): Bloque => {
  const id = uid();
  switch (tipo) {
    case 'hero': return { id, tipo, titulo: 'Título principal', texto: 'Una frase corta que explique la oferta.', imagen: `${WEB}/images/modelo9/hero-office.jpg` };
    case 'texto': return { id, tipo, titulo: 'Subtítulo', texto: 'Escribe aquí el contenido del correo.' };
    case 'imagen': return { id, tipo, imagen: `${WEB}/images/modelo9/hero-office.jpg`, alt: 'Imagen' };
    case 'boton': return { id, tipo, texto: 'Cotiza ahora', url: `${WEB}/cotizador` };
    case 'productos': return { id, tipo, titulo: 'Productos destacados', items: [1, 2, 3].map((n) => ({ nombre: `Producto ${n}`, precio: 'US$ 0.00', url: `${WEB}/tienda`, imagen: '' })) };
    default: return { id, tipo: 'separador' };
  }
};

const PLANTILLAS: { nombre: string; descripcion: string; asunto: string; bloques: () => Bloque[] }[] = [
  {
    nombre: 'Promoción de productos', descripcion: 'Portada + 3 productos + botón a la tienda', asunto: 'Ofertas de la semana en FPTecnologi',
    bloques: () => [nuevoBloque('hero'), nuevoBloque('productos'), { ...(nuevoBloque('boton') as Extract<Bloque, { tipo: 'boton' }>), texto: 'Ver la tienda', url: `${WEB}/tienda` }],
  },
  {
    nombre: 'Novedades del blog', descripcion: 'Portada + texto + botón al blog', asunto: 'Nuevo en nuestro blog',
    bloques: () => [nuevoBloque('hero'), nuevoBloque('texto'), { ...(nuevoBloque('boton') as Extract<Bloque, { tipo: 'boton' }>), texto: 'Leer el artículo', url: `${WEB}/blog` }],
  },
  {
    nombre: 'Servicio y cotización', descripcion: 'Texto del servicio + botón al cotizador', asunto: 'Cotiza tu proyecto de TI',
    bloques: () => [{ ...(nuevoBloque('hero') as Extract<Bloque, { tipo: 'hero' }>), titulo: 'Soluciones TI a medida' }, nuevoBloque('texto'), nuevoBloque('boton')],
  },
  { nombre: 'Bienvenida', descripcion: 'Mensaje breve para nuevos suscriptores', asunto: '¡Bienvenido a FPTecnologi!', bloques: () => [{ ...(nuevoBloque('texto') as Extract<Bloque, { tipo: 'texto' }>), titulo: '¡Gracias por suscribirte!', texto: 'Te contaremos primero de promociones, lanzamientos y consejos de tecnología para tu empresa.' }, nuevoBloque('boton')] },
  { nombre: 'En blanco', descripcion: 'Empieza desde cero', asunto: '', bloques: () => [nuevoBloque('texto')] },
];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const seguro = (u: string) => (/^(https?:\/\/|mailto:|tel:)/i.test(u.trim()) ? esc(u.trim()) : '#');
const parrafos = (t: string) => esc(t).split(/\n+/).map((p) => `<p style="margin:0 0 12px;">${p}</p>`).join('');

function bloqueHtml(b: Bloque): string {
  switch (b.tipo) {
    case 'hero':
      return `${b.imagen ? `<tr><td><img src="${seguro(b.imagen)}" alt="" width="600" style="display:block;width:100%;height:auto;border:0;"></td></tr>` : ''}<tr><td style="padding:28px 32px 8px;"><h1 style="margin:0 0 10px;font-size:26px;line-height:1.25;color:#0B2A3D;">${esc(b.titulo)}</h1><div style="color:#5B6B7A;font-size:16px;line-height:1.6;">${parrafos(b.texto)}</div></td></tr>`;
    case 'texto':
      return `<tr><td style="padding:20px 32px 4px;"><h2 style="margin:0 0 8px;font-size:19px;color:#0B2A3D;">${esc(b.titulo)}</h2><div style="color:#1F2733;font-size:15px;line-height:1.6;">${parrafos(b.texto)}</div></td></tr>`;
    case 'imagen':
      return `<tr><td style="padding:12px 32px;"><img src="${seguro(b.imagen)}" alt="${esc(b.alt)}" width="536" style="display:block;width:100%;height:auto;border:0;border-radius:8px;"></td></tr>`;
    case 'boton':
      return `<tr><td align="center" style="padding:20px 32px;"><a href="${seguro(b.url)}" style="display:inline-block;background:${COLOR};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:8px;">${esc(b.texto)}</a></td></tr>`;
    case 'productos':
      return `<tr><td style="padding:20px 32px 4px;"><h2 style="margin:0 0 12px;font-size:19px;color:#0B2A3D;">${esc(b.titulo)}</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${b.items.map((i) => `<td width="33%" valign="top" style="padding:0 6px;text-align:center;">${i.imagen ? `<img src="${seguro(i.imagen)}" alt="" width="150" style="display:block;width:100%;height:auto;border:0;border-radius:8px;margin-bottom:8px;">` : `<div style="height:110px;background:#EBF6FA;border-radius:8px;margin-bottom:8px;"></div>`}<a href="${seguro(i.url)}" style="color:#0B2A3D;font-size:13px;font-weight:700;text-decoration:none;">${esc(i.nombre)}</a><div style="color:${COLOR};font-size:13px;margin-top:4px;">${esc(i.precio)}</div></td>`).join('')}</tr></table></td></tr>`;
    default:
      return `<tr><td style="padding:12px 32px;"><div style="border-top:1px solid #E6EBEF;"></div></td></tr>`;
  }
}

function renderHtml(m: Mailing): string {
  return `<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#F0F3F6;font-family:Arial,Helvetica,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;">${esc(m.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0F3F6;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:${COLOR};padding:18px 32px;"><span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.02em;">FPTecnologi</span></td></tr>
${m.bloques.map(bloqueHtml).join('\n')}
<tr><td style="padding:20px 32px;background:#F8FAFB;border-top:1px solid #E6EBEF;"><p style="margin:0;font-size:12px;color:#5B6B7A;">FPTecnologi &amp; System · Jr. Huaraz 1841, Breña — Lima, Perú.<br>Recibes este correo porque te suscribiste en nuestra web. <a href="#" style="color:#5B6B7A;">Cancelar suscripción</a></p></td></tr>
</table></td></tr></table></body></html>`;
}

const cargar = (): Mailing[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; } };
const guardar = (l: Mailing[]) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* sin almacenamiento */ } };

export function MailingEditor() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Mailing[]>([]);
  const [actualId, setActualId] = useState<string | null>(null);
  const [movil, setMovil] = useState(false);
  const [aviso, setAviso] = useState('');
  const [envio, setEnvio] = useState(false);
  const [audiencia, setAudiencia] = useState('suscriptores');
  const [conteo, setConteo] = useState<number | null>(null);
  const [pegados, setPegados] = useState('');
  const [prueba, setPrueba] = useState('');

  useEffect(() => { const l = cargar(); setLista(l); setActualId(l[0]?.id ?? null); }, []);
  useEffect(() => {
    if (!activeMarcaId) return;
    api.get<unknown[]>('/boletin/suscriptores').then((r) => setConteo(r.length)).catch(() => setConteo(null));
  }, [activeMarcaId]);

  const m = lista.find((x) => x.id === actualId) ?? null;
  const html = useMemo(() => (m ? renderHtml(m) : ''), [m]);
  const emails = useMemo(() => [...new Set(pegados.split(/[\s,;]+/).filter((e) => /^\S+@\S+\.\S+$/.test(e)))], [pegados]);

  const nota = (t: string) => { setAviso(t); setTimeout(() => setAviso(''), 3500); };
  const guardarLista = (l: Mailing[]) => { setLista(l); guardar(l); };
  const cambiar = (patch: Partial<Mailing>) => m && guardarLista(lista.map((x) => (x.id === m.id ? { ...x, ...patch, actualizado: new Date().toISOString() } : x)));
  const cambiarBloque = (id: string, patch: Record<string, unknown>) => m && cambiar({ bloques: m.bloques.map((b) => (b.id === id ? ({ ...b, ...patch } as Bloque) : b)) });

  function crear(p: (typeof PLANTILLAS)[number]) {
    const n: Mailing = { id: uid(), nombre: p.nombre, asunto: p.asunto, preheader: '', bloques: p.bloques(), actualizado: new Date().toISOString() };
    guardarLista([n, ...lista]);
    setActualId(n.id);
  }
  const duplicar = () => { if (!m) return; const n = { ...m, id: uid(), nombre: `${m.nombre} (copia)`, bloques: m.bloques.map((b) => ({ ...b, id: uid() })) as Bloque[] }; guardarLista([n, ...lista]); setActualId(n.id); };
  const eliminar = () => { if (!m || !window.confirm(`¿Eliminar «${m.nombre}»?`)) return; const l = lista.filter((x) => x.id !== m.id); guardarLista(l); setActualId(l[0]?.id ?? null); };
  const mover = (i: number, d: number) => { if (!m) return; const b = [...m.bloques]; const j = i + d; if (j < 0 || j >= b.length) return; [b[i], b[j]] = [b[j], b[i]]; cambiar({ bloques: b }); };
  const copiarHtml = async () => { try { await navigator.clipboard.writeText(html); nota('HTML copiado'); } catch { nota('No se pudo copiar'); } };
  const descargar = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })); a.download = `${m?.nombre ?? 'mailing'}.html`; a.click(); URL.revokeObjectURL(a.href); };

  const destinatarios = audiencia === 'suscriptores' ? (conteo ?? 0) : emails.length;
  const campo = (id: string, label: string, valor: string, onChange: (v: string) => void, area = false) => (
    <div className="ax-field" key={id}>
      <label className="ax-label" htmlFor={id}>{label}</label>
      {area ? <textarea id={id} className="ax-textarea" rows={3} value={valor} onChange={(e) => onChange(e.target.value)} /> : <input id={id} className="ax-input" value={valor} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );

  return (
    <>
      <PageHead title="Mailing" subtitle="Arma correos a partir de plantillas, revísalos en vivo, copia el HTML o simula el envío a una lista." />
      <div role="note" className="ax-alert ax-alert--info" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
        <div className="ax-alert__content"><p className="ax-alert__message">Versión de demostración: los mailings se guardan solo en este navegador y el envío es simulado (no sale ningún correo).</p></div>
      </div>

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)', marginBlockEnd: 'var(--ax-space-4)' }}>
        <strong style={{ color: 'var(--ax-text-strong)' }}>Nuevo mailing desde plantilla</strong>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', marginBlockStart: 'var(--ax-space-3)', alignItems: 'stretch' }}>
          {PLANTILLAS.map((p) => (
            <button key={p.nombre} type="button" className="ax-card" onClick={() => crear(p)} style={{ padding: 'var(--ax-space-3)', textAlign: 'left', cursor: 'pointer', minWidth: 190, flex: '1 1 190px' }}>
              <div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{p.nombre}</div>
              <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{p.descripcion}</div>
            </button>
          ))}
        </div>
      </section>

      {lista.length === 0 && <p style={{ color: 'var(--ax-text-muted)' }}>Aún no tienes mailings. Elige una plantilla para empezar.</p>}

      {m && (
        <>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockEnd: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
            <select className="ax-select" aria-label="Mailing" value={m.id} onChange={(e) => setActualId(e.target.value)}>
              {lista.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
            </select>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={duplicar}>Duplicar</button>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={copiarHtml}>Copiar HTML</button>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={descargar}>Descargar HTML</button>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={eliminar}>Eliminar</button>
            <button type="button" className="ax-btn ax-btn--primary" onClick={() => setEnvio(true)}><span className="ax-btn__label">Enviar…</span></button>
            {aviso && <span role="status" style={{ color: 'var(--ax-text-muted)' }}>{aviso}</span>}
          </div>

          <div style={{ display: 'flex', gap: 'var(--ax-space-4)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <section className="ax-card" style={{ padding: 'var(--ax-space-4)', flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              {campo('ml-nombre', 'Nombre interno', m.nombre, (v) => cambiar({ nombre: v }))}
              {campo('ml-asunto', 'Asunto del correo', m.asunto, (v) => cambiar({ asunto: v }))}
              {campo('ml-pre', 'Texto de vista previa (preheader)', m.preheader, (v) => cambiar({ preheader: v }))}
              <strong style={{ color: 'var(--ax-text-strong)' }}>Contenido</strong>
              {m.bloques.map((b, i) => (
                <div key={b.id} className="ax-card" style={{ padding: 'var(--ax-space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
                  <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                    <span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">{ETIQUETA[b.tipo]}</span>
                    <span className="ax-cluster" style={{ gap: 2 }}>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Subir" onClick={() => mover(i, -1)}>↑</button>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Bajar" onClick={() => mover(i, 1)}>↓</button>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => cambiar({ bloques: m.bloques.filter((x) => x.id !== b.id) })}>Quitar</button>
                    </span>
                  </div>
                  {b.tipo === 'hero' && <>{campo(`${b.id}t`, 'Título', b.titulo, (v) => cambiarBloque(b.id, { titulo: v }))}{campo(`${b.id}x`, 'Texto', b.texto, (v) => cambiarBloque(b.id, { texto: v }), true)}{campo(`${b.id}i`, 'Imagen (URL)', b.imagen, (v) => cambiarBloque(b.id, { imagen: v }))}</>}
                  {b.tipo === 'texto' && <>{campo(`${b.id}t`, 'Título', b.titulo, (v) => cambiarBloque(b.id, { titulo: v }))}{campo(`${b.id}x`, 'Texto', b.texto, (v) => cambiarBloque(b.id, { texto: v }), true)}</>}
                  {b.tipo === 'imagen' && <>{campo(`${b.id}i`, 'Imagen (URL)', b.imagen, (v) => cambiarBloque(b.id, { imagen: v }))}{campo(`${b.id}a`, 'Texto alternativo', b.alt, (v) => cambiarBloque(b.id, { alt: v }))}</>}
                  {b.tipo === 'boton' && <>{campo(`${b.id}t`, 'Texto del botón', b.texto, (v) => cambiarBloque(b.id, { texto: v }))}{campo(`${b.id}u`, 'Enlace', b.url, (v) => cambiarBloque(b.id, { url: v }))}</>}
                  {b.tipo === 'productos' && (
                    <>
                      {campo(`${b.id}t`, 'Título de la sección', b.titulo, (v) => cambiarBloque(b.id, { titulo: v }))}
                      {b.items.map((it, k) => (
                        <div key={k} className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                          {(['nombre', 'precio', 'url', 'imagen'] as const).map((f) => (
                            <input key={f} className="ax-input ax-input--sm" style={{ flex: '1 1 110px' }} placeholder={f} aria-label={`${f} del producto ${k + 1}`} value={it[f]} onChange={(e) => cambiarBloque(b.id, { items: b.items.map((x, j) => (j === k ? { ...x, [f]: e.target.value } : x)) })} />
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Agregar:</span>
                {(Object.keys(ETIQUETA) as Bloque['tipo'][]).map((t) => (
                  <button key={t} type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => cambiar({ bloques: [...m.bloques, nuevoBloque(t)] })}>{ETIQUETA[t]}</button>
                ))}
              </div>
            </section>

            <section className="ax-card" style={{ padding: 'var(--ax-space-3)', flex: '1 1 420px', position: 'sticky', top: 'var(--ax-space-4)' }}>
              <div className="ax-cluster" style={{ justifyContent: 'space-between', marginBlockEnd: 'var(--ax-space-2)' }}>
                <strong style={{ color: 'var(--ax-text-strong)' }}>Vista previa</strong>
                <span className="ax-cluster" style={{ gap: 2 }}>
                  <button type="button" className={`ax-btn ax-btn--sm ${!movil ? 'ax-btn--primary' : 'ax-btn--ghost'}`} onClick={() => setMovil(false)}>Escritorio</button>
                  <button type="button" className={`ax-btn ax-btn--sm ${movil ? 'ax-btn--primary' : 'ax-btn--ghost'}`} onClick={() => setMovil(true)}>Móvil</button>
                </span>
              </div>
              <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', marginBlockEnd: 6 }}>Asunto: <strong>{m.asunto || '(sin asunto)'}</strong></div>
              {/* sandbox sin permisos: el HTML del correo no puede ejecutar nada en el dashboard */}
              <iframe title="Vista previa del correo" srcDoc={html} sandbox="" style={{ width: movil ? 375 : '100%', maxWidth: '100%', height: 640, border: '1px solid var(--ax-border)', borderRadius: 10, display: 'block', margin: '0 auto', background: '#fff' }} />
            </section>
          </div>
        </>
      )}

      {envio && m && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setEnvio(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
          <div role="dialog" aria-modal="true" aria-label="Enviar mailing" className="ax-card" style={{ position: 'relative', maxWidth: 520, width: '100%', padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <h2 className="ax-card__title">Enviar «{m.nombre}»</h2>
            <div className="ax-field">
              <label className="ax-label" htmlFor="ml-aud">Enviar a</label>
              <select id="ml-aud" className="ax-select" value={audiencia} onChange={(e) => setAudiencia(e.target.value)}>
                <option value="suscriptores">Suscriptores del boletín{conteo !== null ? ` (${conteo})` : ''}</option>
                <option value="pegados">Lista de correos que pego</option>
              </select>
            </div>
            {audiencia === 'pegados' && <div className="ax-field"><label className="ax-label" htmlFor="ml-lista">Correos (separados por coma, espacio o línea)</label><textarea id="ml-lista" className="ax-textarea" rows={4} value={pegados} onChange={(e) => setPegados(e.target.value)} /></div>}
            <div className="ax-field"><label className="ax-label" htmlFor="ml-test">Enviar prueba a</label><input id="ml-test" type="email" className="ax-input" placeholder="tu@correo.com" value={prueba} onChange={(e) => setPrueba(e.target.value)} /></div>
            <p style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Destinatarios: <strong>{destinatarios}</strong>. Modo demostración: no se envía ningún correo.</p>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEnvio(false)}>Cerrar</button>
              <button type="button" className="ax-btn ax-btn--ghost" disabled={!prueba} onClick={() => { setEnvio(false); nota(`Prueba simulada a ${prueba}`); }}>Enviar prueba</button>
              <button type="button" className="ax-btn ax-btn--primary" disabled={destinatarios === 0 || !m.asunto.trim()} onClick={() => { setEnvio(false); nota(`Envío simulado a ${destinatarios} destinatarios`); }}><span className="ax-btn__label">Enviar a la lista</span></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MailingEditor;
