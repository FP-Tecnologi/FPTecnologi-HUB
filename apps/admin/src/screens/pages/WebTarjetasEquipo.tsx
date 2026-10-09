'use client';
/*
 * FPTecnologi-HUB — Tarjetas del equipo (Web informativa). Para quien administra: ve las tarjetas digitales de todo el
 * equipo, qué le falta a cada una (foto, cargo…), copia o abre su enlace único y puede ocultarla o mostrarla. Cada
 * persona edita la suya en Mi cuenta → Mi tarjeta digital.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { urlImagen } from '../../components/ui/SubirImagen';
import { ApiError, useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Fila { id: string; slug: string; nombre: string; cargo: string | null; area: string | null; estilo: string; vista: string; activo: boolean; vistas: number; fotoUrl: string | null; faltantes: { campo: string; aviso: string }[]; url: string }
interface SinTarjeta { usuarioId: string; nombre: string; email: string; rol: string }

const ESTILO: Record<string, string> = { clasico: 'Clásico', moderno: 'Moderno', oscuro: 'Oscuro', minimal: 'Minimal' };

export function WebTarjetasEquipo() {
  const { activeMarcaId } = useAuth();
  const [datos, setDatos] = useState<{ tarjetas: Fila[]; sinTarjeta: SinTarjeta[] } | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const cargar = useCallback(async () => {
    try {
      setDatos(await api.get('/tarjetas'));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las tarjetas.');
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar, activeMarcaId]);

  async function alternar(f: Fila) {
    try {
      await api.patch(`/tarjetas/${f.id}/activo`, { activo: !f.activo });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cambiar.');
    }
  }
  async function copiar(url: string) {
    try { await navigator.clipboard.writeText(url); setAviso('Enlace copiado.'); } catch { setError('No se pudo copiar el enlace.'); }
  }

  return (
    <>
      <PageHead title="Tarjetas del equipo" subtitle="Las tarjetas digitales de todo el equipo, de cualquier área. Cada persona crea y edita la suya en Mi cuenta → Mi tarjeta digital; aquí las supervisas y compartes sus enlaces." />
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
      {aviso && <p role="status" style={{ color: 'var(--ax-text-muted)' }}>{aviso}</p>}

      {datos && datos.tarjetas.length === 0 && <p style={{ color: 'var(--ax-text-muted)' }}>Aún nadie del equipo creó su tarjeta.</p>}
      <div style={{ display: 'grid', gap: 'var(--ax-space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(21rem, 1fr))' }}>
        {datos?.tarjetas.map((f) => (
          <article key={f.id} className="ax-card" style={{ padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)', opacity: f.activo ? 1 : 0.6 }}>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', flexWrap: 'nowrap' }}>
              {f.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlImagen(f.fotoUrl)} alt="" width={52} height={52} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--ax-surface-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{f.nombre.charAt(0).toUpperCase()}</span>
              )}
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block' }}>{f.nombre}</strong>
                <span style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>{[f.cargo, f.area].filter(Boolean).join(' · ') || 'Sin cargo'}</span>
              </div>
            </div>
            <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{f.vista === 'linktree' ? 'Linktree' : 'Perfil'} · estilo {ESTILO[f.estilo] ?? f.estilo} · {f.vistas} visitas · {f.activo ? 'visible' : 'oculta'}</span>
            {f.faltantes.length > 0 ? (
              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-warning-600, #b45309)' }}>Le falta: {f.faltantes.map((x) => x.campo).join(', ')}</span>
            ) : (
              <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-success-600, #15803d)' }}>Tarjeta completa</span>
            )}
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
              <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => copiar(f.url)}>Copiar enlace</button>
              <a className="ax-btn ax-btn--ghost ax-btn--sm" href={f.url} target="_blank" rel="noreferrer">Abrir</a>
              <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => alternar(f)}>{f.activo ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </article>
        ))}
      </div>

      {datos && datos.sinTarjeta.length > 0 && (
        <section className="ax-card" style={{ padding: 'var(--ax-space-4)', marginBlockStart: 'var(--ax-space-4)' }}>
          <strong>Aún sin tarjeta ({datos.sinTarjeta.length})</strong>
          <p style={{ margin: '4px 0 8px', fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Pídeles que entren a Mi cuenta → Mi tarjeta digital: se arma en minutos (foto, cargo y contacto).</p>
          <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 'var(--ax-text-sm)' }}>
            {datos.sinTarjeta.map((s) => <li key={s.usuarioId}>{s.nombre} <span style={{ color: 'var(--ax-text-subtle)' }}>· {s.rol}</span></li>)}
          </ul>
        </section>
      )}
    </>
  );
}

export default WebTarjetasEquipo;
