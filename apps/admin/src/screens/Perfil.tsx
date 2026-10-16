'use client';
/*
 * FPTecnologi-HUB — "Mi perfil": vista de solo lectura con todo lo de la cuenta (datos personales, seguridad,
 * empresas asignadas y qué puede hacer con cada rol). Editar datos, contraseña, 2FA y avisos vive en Configuración.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHead } from '../components/shell/PageHead';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

/** Qué ve y hace cada rol en una empresa (resumen de los módulos del menú). */
const ROLES: Record<string, string> = {
  admin: 'Control total de la empresa: equipo, contenido web, tienda, chat, cotizador y reportes.',
  marketing: 'Contenido de la web, blogs, campañas, boletín, mailing y formulario del cotizador.',
  ventas: 'Tienda (productos, pedidos, clientes), presupuestos, cotizaciones y reporte de ventas.',
  comercial: 'Contactos y tickets de la web, leads del cotizador, presupuestos y campañas.',
  asesores: 'Conversaciones del chat, asesores de WhatsApp y conocimiento del asistente.',
  cliente: 'Acceso de cliente a la web (sin panel de gestión).',
};

function Dato({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <div style={{ minInlineSize: 0 }}>
      <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', marginBlockEnd: 2 }}>{label}</div>
      <div style={{ color: valor ? 'var(--ax-text-strong)' : 'var(--ax-text-subtle)', overflowWrap: 'anywhere' }}>{valor || 'Sin registrar'}</div>
    </div>
  );
}

export function Perfil() {
  const { user, marcas, activeMarcaId, setActiveMarcaId, esSuperAdmin } = useAuth();
  const [totp, setTotp] = useState<boolean | null>(null);
  useEffect(() => {
    api.get<{ totpEnabled: boolean }>('/usuarios/me/seguridad').then((r) => setTotp(r.totpEnabled)).catch(() => setTotp(null));
  }, []);

  const rolesUnicos = [...new Set(marcas.map((m) => m.rol.nombre))];
  const rolPrincipal = esSuperAdmin ? 'Super administrador' : (rolesUnicos[0] ?? 'Sin rol');

  return (
    <>
      <PageHead
        title="Mi perfil"
        subtitle="Tu identidad, tus empresas y lo que puedes hacer en cada una."
        actions={<Link className="ax-btn ax-btn--primary" href="/configuracion"><span className="ax-btn__label">Editar en Configuración</span></Link>}
      />
      <div className="ax-dash-grid">
        <section className="ax-card ax-col--12" role="region" aria-label="Identidad" style={{ overflow: 'hidden' }}>
          <div style={{ height: 88, background: 'linear-gradient(120deg, var(--ax-accent) 0%, var(--ax-accent-wash) 100%)' }} aria-hidden="true" />
          <div className="ax-card__body" style={{ marginBlockStart: -44 }}>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-4)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <span style={{ borderRadius: '50%', border: '4px solid var(--ax-surface)', display: 'inline-flex' }}>
                <Avatar nombre={user?.nombre} email={user?.email} avatarUrl={user?.avatarUrl} size={88} />
              </span>
              <div style={{ minInlineSize: 0, flex: '1 1 240px', paddingBlockEnd: 'var(--ax-space-1)' }}>
                <h2 className="ax-card__title" style={{ margin: 0, fontSize: 'var(--ax-text-xl)' }}>{user?.nombre || user?.email || 'Cuenta'}</h2>
                <p style={{ margin: 0, color: 'var(--ax-text-muted)' }}>{user?.cargo || 'Sin cargo registrado'}</p>
              </div>
              <span className="ax-badge ax-badge--soft ax-badge--accent ax-badge--pill" style={{ textTransform: 'capitalize' }}>{rolPrincipal}</span>
            </div>
          </div>
        </section>

        <section className="ax-card ax-col--7" role="region" aria-label="Datos personales">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Datos personales</h2></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--ax-space-4)' }}>
              <Dato label="Nombre" valor={user?.nombre} />
              <Dato label="Correo" valor={user?.email} />
              <Dato label="DNI" valor={user?.dni} />
              <Dato label="Teléfono" valor={user?.telefono} />
              <Dato label="Cargo" valor={user?.cargo} />
            </div>
          </div>
        </section>

        <section className="ax-card ax-col--5" role="region" aria-label="Seguridad de la cuenta">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Seguridad</h2></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
              <span>Verificación en dos pasos</span>
              <span className={`ax-badge ax-badge--soft ax-badge--pill ${totp ? 'ax-badge--success' : 'ax-badge--neutral'}`}>{totp === null ? '—' : totp ? 'App autenticadora' : 'Código al correo'}</span>
            </div>
            <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
              <span>Contraseña</span>
              <span style={{ color: 'var(--ax-text-subtle)' }}>••••••••</span>
            </div>
            <Link className="ax-btn ax-btn--ghost ax-btn--sm" href="/configuracion" style={{ alignSelf: 'flex-start' }}>Cambiar en Configuración</Link>
          </div>
        </section>

        <section className="ax-card ax-col--12" role="region" aria-label="Empresas y roles">
          <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">Empresas y roles</h2><p className="ax-card__subtitle">{marcas.length} {marcas.length === 1 ? 'empresa asignada' : 'empresas asignadas'}{esSuperAdmin ? ' · eres administrador de todas' : ''}.</p></div></div>
          <div className="ax-card__body" style={{ paddingTop: 0 }}>
            {marcas.length === 0 && <p style={{ color: 'var(--ax-text-muted)', margin: 0 }}>No tienes ninguna empresa asignada todavía.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--ax-space-3)' }}>
              {marcas.map((m) => {
                const activa = m.marcaId === activeMarcaId;
                return (
                  <div key={m.marcaId} style={{ padding: 'var(--ax-space-4)', borderRadius: 'var(--ax-radius-md)', background: activa ? 'var(--ax-accent-wash)' : 'var(--ax-surface-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
                    <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                      <b style={{ textTransform: 'capitalize' }}>{m.marca.nombre}</b>
                      <span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill" style={{ textTransform: 'capitalize' }}>{m.rol.nombre}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)', flexGrow: 1 }}>{ROLES[m.rol.nombre.toLowerCase()] ?? 'Acceso según los módulos de tu rol.'}</p>
                    {activa
                      ? <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-accent)', fontWeight: 600 }}>Empresa activa</span>
                      : <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setActiveMarcaId(m.marcaId)}>Usar esta empresa</button>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Perfil;
