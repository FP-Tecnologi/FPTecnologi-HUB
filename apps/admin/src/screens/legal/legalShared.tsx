'use client';
/*
 * FPTecnologi-HUB — cabecera compartida de las páginas legales (Términos,
 * Privacidad). Viven en (bare), sin sidebar/dashboard, porque un visitante
 * sin cuenta debe poder leerlas desde el formulario de registro.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';

export const SEC: React.CSSProperties = { scrollMarginTop: 'var(--ax-space-8)' };
export const H2: React.CSSProperties = { fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-xl)', fontWeight: 600, color: 'var(--ax-text-strong)', margin: '0 0 var(--ax-space-3)' };
export const H3: React.CSSProperties = { fontSize: 'var(--ax-text-md)', fontWeight: 600, color: 'var(--ax-text-strong)', margin: 'var(--ax-space-4) 0 var(--ax-space-2)' };
export const P: React.CSSProperties = { color: 'var(--ax-text)', lineHeight: 1.7, margin: '0 0 var(--ax-space-3)' };
export const P_LAST: React.CSSProperties = { color: 'var(--ax-text)', lineHeight: 1.7, margin: 0 };
export const UL: React.CSSProperties = { color: 'var(--ax-text)', lineHeight: 1.7, margin: 0, paddingInlineStart: 'var(--ax-space-5)', display: 'flex', flexDirection: 'column', gap: 6 };

export function LegalHeader({ title, updated }: { title: string; updated: string }) {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-5)', marginBottom: 'var(--ax-space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ax-space-3)' }}>
        <Link href="/" aria-label="FPTecnologi home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-fptecnologi.svg" alt="FPTecnologi" width={150} style={{ height: 'auto' }} />
        </Link>
        <Link className="ax-link" href="/auth/sign-in">← Volver</Link>
      </div>
      <div>
        <h1 style={{ margin: '0 0 var(--ax-space-1)', fontFamily: 'var(--ax-font-display)', fontSize: 'var(--ax-text-2xl)', fontWeight: 700, color: 'var(--ax-text-strong)' }}>{title}</h1>
        <p style={{ margin: 0, fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
          Última actualización: <span className="ax-num" style={{ fontFamily: 'var(--ax-font-mono)' }}>{updated}</span>
        </p>
      </div>
    </header>
  );
}

export function TocLayout({ toc, children }: { toc: ReactNode; children: ReactNode }) {
  return (
    <div className="ax-doc" style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: 'var(--ax-space-6)', alignItems: 'start' }}>
      {toc}
      <article className="ax-card ax-doc__body">
        <div className="ax-card__body" style={{ maxWidth: '72ch', padding: 'var(--ax-space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-7)' }}>
          {children}
        </div>
      </article>
    </div>
  );
}
