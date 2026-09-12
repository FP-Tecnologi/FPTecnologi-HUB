'use client';
/*
 * FPTecnologi-HUB — Centro de ayuda / Soporte (ruta "pages/support").
 *
 * Pantalla del dashboard: buscador local de artículos, categorías de ayuda,
 * artículos populares, formulario de solicitud (solo estado local, sin
 * backend todavía) y tarjetas de contacto directo.
 */
import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { PageHead } from '../../components/shell/PageHead';

interface Article { id: number; title: string; cat: string; }
const ARTICLES: Article[] = [
  { id: 1, title: 'Cómo consultar el estado de mi pedido', cat: 'Pedidos' },
  { id: 2, title: 'Mi pedido llegó incompleto o con una falla, ¿qué hago?', cat: 'Pedidos' },
  { id: 3, title: 'No puedo acceder a mi cuenta, ¿cómo recupero mi contraseña?', cat: 'Cuenta y acceso' },
  { id: 4, title: 'Cómo activar la verificación en dos pasos', cat: 'Cuenta y acceso' },
  { id: 5, title: 'Cómo solicitar una cotización para mi empresa', cat: 'Cotizaciones' },
  { id: 6, title: 'Qué incluye una cotización de servicios TI', cat: 'Cotizaciones' },
  { id: 7, title: 'Cómo solicitar garantía o soporte técnico', cat: 'Garantías y soporte' },
  { id: 8, title: 'Tiempos de atención y cobertura del soporte técnico', cat: 'Garantías y soporte' },
];

interface Cat { label: string; desc: string; tint: string; count: number; icon: ReactNode; }
const CATS: Cat[] = [
  { label: 'Pedidos', desc: 'Consulta el estado, la entrega, cambios y devoluciones de tu compra.', tint: 'var(--ax-viz-cyan)', count: 14, icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 7h15l-1.5 9h-12z" /><path d="M6 7l-1 -3h-2" /><path d="M9 20a1 1 0 1 0 0 -2a1 1 0 1 0 0 2" /><path d="M17 20a1 1 0 1 0 0 -2a1 1 0 1 0 0 2" /></svg> },
  { label: 'Cuenta y acceso', desc: 'Recupera tu contraseña, protege tu cuenta y gestiona tus datos.', tint: 'var(--ax-viz-violet)', count: 10, icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" /></svg> },
  { label: 'Cotizaciones', desc: 'Solicita cotizaciones de equipos y servicios TI para tu empresa.', tint: 'var(--ax-viz-emerald)', count: 12, icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /><path d="M9 9l1 0" /><path d="M9 13l6 0" /><path d="M9 17l6 0" /></svg> },
  { label: 'Garantías y soporte', desc: 'Reporta fallas, solicita garantía y agenda soporte técnico.', tint: 'var(--ax-viz-amber)', count: 16, icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" /><path d="M12 8v4" /><path d="M12 15v.01" /></svg> },
  { label: 'Facturación y pagos', desc: 'Comprobantes, métodos de pago y facturación para empresas.', tint: 'var(--ax-viz-pink)', count: 9, icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -8" /><path d="M3 10l18 0" /><path d="M7 15l.01 0" /><path d="M11 15l2 0" /></svg> },
  { label: 'Servicios para empresas', desc: 'Instalación, mantenimiento, redes y soporte por contrato.', tint: 'var(--ax-accent)', count: 11, icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054" /><path d="M4 20l3.5 -3.5" /><path d="M15 4l-3.5 3.5" /><path d="M20 9l-3.5 3.5" /></svg> },
];

const POPULAR = [
  { q: '¿Cómo consulto el estado de mi pedido?', a: 'Ingresa a tu cuenta y abre la sección de pedidos para ver el estado actual y la información de entrega. Si compraste como empresa con cotización aprobada, tu asesor te confirma el avance por correo.' },
  { q: '¿Cómo pido una cotización para mi empresa?', a: 'Escríbenos a soporte@fptecnologi.com indicando RUC, cantidades y los equipos o servicios que necesitas. Preparamos tu cotización y te la enviamos a tu correo.' },
  { q: '¿Qué hago si un equipo llegó con una falla?', a: 'No lo manipules más de lo necesario y repórtalo a soporte@fptecnologi.com con tu número de pedido, fotos o video de la falla y tu comprobante de compra. Te indicaremos los pasos de la garantía.' },
  { q: 'Olvidé mi contraseña, ¿cómo recupero mi acceso?', a: 'En la pantalla de acceso selecciona "Olvidé mi contraseña" e ingresa tu correo. Recibirás un enlace para crear una nueva clave. Si no lo ves, revisa tu carpeta de spam.' },
];

const CHANNELS: { label: string; sub: string; tint: string; href?: string; icon: ReactNode }[] = [
  { label: 'Correo de soporte', sub: 'soporte@fptecnologi.com', tint: 'var(--ax-viz-cyan)', href: 'mailto:soporte@fptecnologi.com', icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" /><path d="M3 7l9 6l9 -6" /></svg> },
  { label: 'Horario de atención', sub: 'Lun–Vie, 9:00–18:00 (Lima)', tint: 'var(--ax-viz-emerald)', icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 7v5l3 2" /></svg> },
  { label: 'Cotizaciones B2B', sub: 'Indica RUC y cantidades', tint: 'var(--ax-viz-violet)', icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12" /><path d="M19 16h-12a2 2 0 0 0 -2 2" /><path d="M9 8h6" /></svg> },
  { label: 'Garantías en taller', sub: 'Trae tu equipo y comprobante', tint: 'var(--ax-viz-amber)', icon: <svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a4.5 4.5 0 1 0 -6 6l-3 3l3 3l3 -3a4.5 4.5 0 0 0 6 -6l-3 3l-3 -3l3 -3" /></svg> },
];

export function Support() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [] as Article[];
    return ARTICLES.filter((a) => a.title.toLowerCase().includes(t) || a.cat.toLowerCase().includes(t));
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHead
        title="Centro de ayuda"
        subtitle="Busca respuestas sobre pedidos, cuenta, cotizaciones o garantías, o escríbenos directamente."
        actions={
          <Link className="ax-btn ax-btn--secondary" href="/pages/faq">
            <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 16v.01" /><path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483" /></svg>
            <span className="ax-btn__label">Ver preguntas frecuentes</span>
          </Link>
        }
      />

      {/* BUSCADOR */}
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" role="search" aria-label="Buscar artículos de ayuda">
          <div className="ax-card__body" style={{ textAlign: 'center', paddingBlock: 'var(--ax-space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ax-space-5)' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-2xl)', fontWeight: 600, color: 'var(--ax-text-strong)', margin: 0 }}>¿Cómo podemos ayudarte?</h2>
              <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-md)', marginTop: 'var(--ax-space-2)' }}>Busca ayuda sobre pedidos, cuenta, cotizaciones y soporte técnico.</p>
            </div>
            <div style={{ position: 'relative', maxWidth: 600, width: '100%' }}>
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="var(--ax-text-subtle)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: 'var(--ax-space-4)', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
              <input type="search" className="ax-input ax-input--lg" placeholder="Busca artículos, p. ej. «estado de mi pedido»" aria-label="Buscar artículos de ayuda" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setQ(''); }} style={{ paddingInlineStart: 'var(--ax-space-10)', textAlign: 'start' }} />
            </div>
            {q.trim() !== '' && (
              <div style={{ maxWidth: 600, width: '100%', textAlign: 'start' }}>
                <p className="ax-num" style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', fontFamily: 'var(--ax-font-mono)', marginBottom: 'var(--ax-space-2)' }} aria-live="polite">{`${results.length} resultado${results.length === 1 ? '' : 's'} para '${q.trim()}'`}</p>
                {results.length > 0 ? (
                  <ul className="ax-list ax-list--compact" style={{ border: '1px solid var(--ax-border)', borderRadius: 'var(--ax-radius-md)', overflow: 'hidden' }}>
                    {results.map((a) => (
                      <li key={a.id} className="ax-list__row" style={{ cursor: 'pointer' }}>
                        <span className="ax-list__leading"><svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ax-text-subtle)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" /><path d="M9 9l1 0" /><path d="M9 13l6 0" /><path d="M9 17l6 0" /></svg></span>
                        <span className="ax-list__content"><span className="ax-list__title">{a.title}</span></span>
                        <span className="ax-list__trailing"><span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--sm">{a.cat}</span></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ border: '1px solid var(--ax-border)', borderRadius: 'var(--ax-radius-md)', padding: 'var(--ax-space-5)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--ax-text-strong)', fontWeight: 'var(--ax-weight-medium)' }}>Sin resultados para <span>{`'${q.trim()}'`}</span></p>
                    <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)', marginTop: 4 }}>Prueba con un término más general o envíanos tu solicitud abajo.</p>
                    <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" style={{ marginTop: 'var(--ax-space-3)' }} onClick={() => setQ('')}>Limpiar búsqueda</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* CATEGORÍAS */}
      <div className="ax-dash-grid" style={{ marginBlockStart: 'var(--ax-space-6)' }}>
        {CATS.map((c) => (
          <section key={c.label} className="ax-card ax-col--4 ax-card--interactive" role="region" aria-label={c.label}>
            <div className="ax-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <span className="ax-avatar ax-avatar--lg ax-avatar--squircle" style={c.tint === 'var(--ax-accent)' ? { background: 'var(--ax-accent-wash)', color: 'var(--ax-accent)' } : { background: `color-mix(in oklab,${c.tint} 18%,transparent)`, color: c.tint }}>{c.icon}</span>
              <div>
                <h3 style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', fontSize: 'var(--ax-text-md)' }}>{c.label}</h3>
                <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)', marginTop: 4 }}>{c.desc}</p>
              </div>
              <span className="ax-num" style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', fontFamily: 'var(--ax-font-mono)', marginTop: 'auto' }}>{c.count} artículos</span>
            </div>
          </section>
        ))}
      </div>

      {/* POPULARES + FORMULARIO */}
      <div className="ax-dash-grid" style={{ marginBlockStart: 'var(--ax-space-6)' }}>
        <section className="ax-card ax-col--7" role="region" aria-label="Artículos populares">
          <div className="ax-card__header">
            <div className="ax-card__titles"><span className="ax-card__eyebrow">Lo más consultado</span><h2 className="ax-card__title">Artículos populares</h2></div>
          </div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            <div className="ax-accordion">
              {POPULAR.map((p, i) => (
                <div key={i} className="ax-accordion__item">
                  <button type="button" className="ax-accordion__header" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                    <span className="ax-accordion__title">{p.q}</span>
                    <svg className="ax-accordion__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6l6 -6" /></svg>
                  </button>
                  {open === i && <div className="ax-accordion__panel">{p.a}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="ax-card__footer"><Link className="ax-link" href="/pages/faq">Ver todos los artículos →</Link></div>
        </section>

        {/* formulario de solicitud */}
        <section className="ax-card ax-col--5" role="region" aria-label="Enviar una solicitud">
          <div className="ax-card__header">
            <div className="ax-card__titles"><span className="ax-card__eyebrow">¿Sigues atascado?</span><h2 className="ax-card__title">Envíanos tu solicitud</h2><p className="ax-card__subtitle">Completa el formulario o escríbenos a <a className="ax-link" href="mailto:soporte@fptecnologi.com">soporte@fptecnologi.com</a>.</p></div>
          </div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {sent ? (
              <div className="ax-flex" role="status" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--ax-space-3)', padding: 'var(--ax-space-6) 0' }}>
                <span className="ax-avatar ax-avatar--lg ax-avatar--squircle" style={{ background: 'var(--ax-success-50)', color: 'var(--ax-success-500)' }}><svg className="ax-avatar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5l10 -10" /></svg></span>
                <div>
                  <p style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)', fontSize: 'var(--ax-text-md)' }}>Hemos recibido tu solicitud</p>
                  <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)', marginTop: 4 }}>Gracias por escribirnos. Te contactaremos a tu correo a la brevedad. Si es urgente, escríbenos directo a <a className="ax-link" href="mailto:soporte@fptecnologi.com">soporte@fptecnologi.com</a>.</p>
                </div>
                <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => setSent(false)}>Enviar otra solicitud</button>
              </div>
            ) : (
              <form className="ax-flex" onSubmit={submit} style={{ flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
                <div className="ax-field">
                  <label className="ax-label" htmlFor="t-subject">Asunto</label>
                  <input id="t-subject" type="text" className="ax-input" placeholder="Resumen breve de tu consulta" required />
                </div>
                <div className="ax-field">
                  <label className="ax-label" htmlFor="t-email">Correo</label>
                  <input id="t-email" type="email" className="ax-input" placeholder="tucorreo@empresa.com" required autoComplete="email" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ax-space-3)' }}>
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="t-cat">Categoría</label>
                    <select id="t-cat" className="ax-select" required defaultValue="">
                      <option value="">Elige…</option>
                      <option>Pedidos</option>
                      <option>Cuenta y acceso</option>
                      <option>Cotizaciones</option>
                      <option>Garantías y soporte técnico</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="t-pri">Prioridad</label>
                    <select id="t-pri" className="ax-select" defaultValue="Normal">
                      <option>Baja</option>
                      <option>Normal</option>
                      <option>Alta</option>
                      <option>Urgente</option>
                    </select>
                  </div>
                </div>
                <div className="ax-field">
                  <label className="ax-label" htmlFor="t-desc">Descripción</label>
                  <textarea id="t-desc" className="ax-textarea" rows={4} placeholder="Cuéntanos qué ocurre e incluye tu número de pedido si aplica…" required />
                </div>
                <div className="ax-field">
                  <span className="ax-label">Adjunto</span>
                  <label htmlFor="t-file" className="ax-btn ax-btn--secondary ax-btn--block" style={{ cursor: 'pointer' }}>
                    <svg className="ax-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5" /></svg>
                    <span className="ax-btn__label">Adjuntar captura o foto</span>
                  </label>
                  <input id="t-file" type="file" className="ax-visually-hidden" aria-label="Adjuntar un archivo" />
                </div>
                <button type="submit" className="ax-btn ax-btn--primary ax-btn--block">
                  <span className="ax-btn__label">Enviar solicitud</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* CANALES DE CONTACTO */}
      <div className="ax-dash-grid" style={{ marginBlockStart: 'var(--ax-space-6)' }}>
        {CHANNELS.map((c) => (
          <section key={c.label} className="ax-card ax-col--3 ax-card--interactive" role="region" aria-label={c.label}>
            <div className="ax-card__body" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ax-space-2)' }}>
              <span className="ax-avatar ax-avatar--md ax-avatar--squircle" style={{ background: `color-mix(in oklab,${c.tint} 18%,transparent)`, color: c.tint }}>{c.icon}</span>
              <p style={{ fontWeight: 'var(--ax-weight-semibold)', color: 'var(--ax-text-strong)' }}>{c.label}</p>
              {c.href ? (
                <a className="ax-link" style={{ fontSize: 'var(--ax-text-sm)' }} href={c.href}>{c.sub}</a>
              ) : (
                <p style={{ color: 'var(--ax-text-muted)', fontSize: 'var(--ax-text-sm)' }}>{c.sub}</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default Support;
