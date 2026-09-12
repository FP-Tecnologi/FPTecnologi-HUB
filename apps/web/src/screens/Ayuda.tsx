'use client';
/*
 * FPTecnologi-HUB — "Centro de ayuda": tickets del usuario a la plataforma
 * (reportar problemas, pedir ayuda). Lista + nuevo ticket, todo local por
 * ahora (sin backend todavía): se guardan solo en este navegador hasta que
 * exista el módulo de tickets en la API.
 */
import { useState } from 'react';
import { PageHead } from '../components/shell/PageHead';

interface Ticket {
  id: string;
  asunto: string;
  categoria: string;
  mensaje: string;
  estado: 'Abierto' | 'En revisión' | 'Cerrado';
  fecha: string;
}

const CATEGORIAS = ['Problema técnico', 'Acceso y cuenta', 'Pedidos', 'Sugerencia', 'Otro'];

const TICKETS_EJEMPLO: Ticket[] = [
  {
    id: 't1',
    asunto: 'No me llega el código al correo',
    categoria: 'Acceso y cuenta',
    mensaje: 'Al iniciar sesión no recibo el código de verificación.',
    estado: 'En revisión',
    fecha: '10/09/2026',
  },
  {
    id: 't2',
    asunto: 'Duda sobre cotizaciones B2B',
    categoria: 'Sugerencia',
    mensaje: '¿Se puede cotizar el mismo servicio para dos marcas distintas?',
    estado: 'Abierto',
    fecha: '08/09/2026',
  },
];

const estadoColor: Record<Ticket['estado'], string> = {
  Abierto: 'var(--ax-accent)',
  'En revisión': 'var(--ax-warning-500)',
  Cerrado: 'var(--ax-text-subtle)',
};

export function Ayuda() {
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS_EJEMPLO);
  const [asunto, setAsunto] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [mensaje, setMensaje] = useState('');
  const [okMsg, setOkMsg] = useState('');

  function crearTicket(ev: React.FormEvent) {
    ev.preventDefault();
    if (!asunto.trim() || !mensaje.trim()) return;
    const nuevo: Ticket = {
      id: `t${Date.now()}`,
      asunto: asunto.trim(),
      categoria,
      mensaje: mensaje.trim(),
      estado: 'Abierto',
      fecha: new Date().toLocaleDateString(),
    };
    setTickets((prev) => [nuevo, ...prev]);
    setAsunto('');
    setMensaje('');
    setCategoria(CATEGORIAS[0]);
    setOkMsg('Ticket creado. Te avisaremos por correo cuando tenga respuesta.');
  }

  return (
    <>
      <PageHead title="Centro de ayuda" subtitle="Reporta problemas de la plataforma o pide ayuda con un ticket." />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--5" role="region" aria-label="Nuevo ticket">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Nuevo ticket</h2></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {okMsg && (
              <div role="status" className="ax-alert ax-alert--success" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
                <div className="ax-alert__content"><p className="ax-alert__message">{okMsg}</p></div>
              </div>
            )}
            <form onSubmit={crearTicket} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }}>
              <div className="ax-field">
                <label className="ax-label" htmlFor="ay-asunto">Asunto</label>
                <input id="ay-asunto" type="text" className="ax-input" placeholder="¿En qué te ayudamos?" value={asunto} onChange={(e) => setAsunto(e.target.value)} required />
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="ay-cat">Categoría</label>
                <select id="ay-cat" className="ax-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  {CATEGORIAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="ax-field">
                <label className="ax-label" htmlFor="ay-msg">Detalle</label>
                <textarea id="ay-msg" className="ax-input" rows={4} placeholder="Cuéntanos qué pasa…" value={mensaje} onChange={(e) => setMensaje(e.target.value)} required />
              </div>
              <div>
                <button type="submit" className="ax-btn ax-btn--primary">
                  <span className="ax-btn__label">Enviar ticket</span>
                </button>
              </div>
            </form>
            <p style={{ margin: 'var(--ax-space-4) 0 0', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
              Por ahora los tickets se guardan solo en este navegador.
            </p>
          </div>
        </section>

        <section className="ax-card ax-col--7" role="region" aria-label="Mis tickets">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Mis tickets</h2><p className="ax-card__subtitle">{tickets.length} en total.</p></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {tickets.length === 0 && (
              <p style={{ color: 'var(--ax-text-muted)', margin: 0 }}>Todavía no tienes tickets.</p>
            )}
            <ul className="ax-list">
              {tickets.map((t) => (
                <li key={t.id} className="ax-list__row" style={{ paddingInline: 0 }}>
                  <span className="ax-list__content">
                    <span className="ax-list__title">
                      {t.asunto}{' '}
                      <span className="ax-badge ax-badge--soft ax-badge--pill" style={{ color: estadoColor[t.estado] }}>
                        {t.estado}
                      </span>
                    </span>
                    <span className="ax-list__meta">{t.categoria} · {t.fecha}</span>
                    <span className="ax-list__meta">{t.mensaje}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

export default Ayuda;
