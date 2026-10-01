'use client';
/*
 * FPTecnologi-HUB — Boletín → Suscriptores (GET /boletin/suscriptores). Correos
 * registrados desde el formulario del pie de página de la web. Búsqueda,
 * eliminar y exportar a CSV.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth, ApiError } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Suscriptor {
  id: string;
  email: string;
  origen: string | null;
  createdAt: string;
}

const fecha = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function csv(lista: Suscriptor[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
  const filas = [['Correo', 'Página de origen', 'Fecha'], ...lista.map((s) => [s.email, s.origen ?? '', fecha(s.createdAt)])];
  const blob = new Blob(['﻿' + filas.map((f) => f.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `suscriptores-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function BoletinSuscriptores() {
  const { activeMarcaId } = useAuth();
  const [lista, setLista] = useState<Suscriptor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const cargar = useCallback(async () => {
    if (!activeMarcaId) return;
    try {
      setLista(await api.get<Suscriptor[]>('/boletin/suscriptores'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los suscriptores.');
    } finally {
      setCargando(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => lista.filter((s) => !q || s.email.toLowerCase().includes(q.trim().toLowerCase())), [lista, q]);

  async function eliminar(s: Suscriptor) {
    if (!window.confirm(`¿Eliminar a ${s.email} del boletín?`)) return;
    try {
      await api.delete(`/boletin/suscriptores/${s.id}`);
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  return (
    <>
      <PageHead
        title="Suscriptores del boletín"
        subtitle="Correos registrados desde el pie de página de la web para recibir ofertas y novedades."
        actions={
          <button type="button" className="ax-btn ax-btn--secondary" disabled={visibles.length === 0} onClick={() => csv(visibles)}>
            <span className="ax-btn__label">Exportar CSV</span>
          </button>
        }
      />

      {error && (
        <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}>
          <div className="ax-alert__content"><p className="ax-alert__message" style={{ color: 'var(--ax-danger-500)' }}>{error}</p></div>
        </div>
      )}

      <section className="ax-card" role="region" aria-label="Suscriptores">
        <div className="ax-card__body">
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <strong>{lista.length} suscriptor{lista.length === 1 ? '' : 'es'}</strong>
            <input type="search" className="ax-input" placeholder="Buscar correo…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar suscriptores" style={{ maxWidth: 280 }} />
          </div>
        </div>
        <div className="ax-table-wrap">
          <table className="ax-table ax-table--hover">
            <thead className="ax-table__head">
              <tr>
                <th className="ax-table__th" scope="col">Correo</th>
                <th className="ax-table__th" scope="col">Página de origen</th>
                <th className="ax-table__th" scope="col">Fecha</th>
                <th className="ax-table__th" scope="col" style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td className="ax-table__td" colSpan={4}>Cargando…</td></tr>
              ) : visibles.length === 0 ? (
                <tr><td className="ax-table__td" colSpan={4} style={{ color: 'var(--ax-text-muted)' }}>{lista.length === 0 ? 'Todavía no hay suscriptores.' : 'Ningún correo coincide.'}</td></tr>
              ) : (
                visibles.map((s) => (
                  <tr key={s.id} className="ax-table__row">
                    <td className="ax-table__td"><a href={`mailto:${s.email}`}>{s.email}</a></td>
                    <td className="ax-table__td" style={{ color: 'var(--ax-text-muted)' }}>{s.origen ?? '—'}</td>
                    <td className="ax-table__td" style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{fecha(s.createdAt)}</td>
                    <td className="ax-table__td" style={{ textAlign: 'right' }}>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => eliminar(s)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default BoletinSuscriptores;
