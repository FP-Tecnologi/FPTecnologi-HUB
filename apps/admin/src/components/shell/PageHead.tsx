'use client';
/*
 * FPTecnologi-HUB · Dashboard — page head (breadcrumb + title + subtitle + actions).
 * Mirrors the .ax-page-head block at the top of every reference page. The
 * breadcrumb resolves from the current route via next/navigation usePathname().
 */
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { slugFromPath } from '../../lib/manifest';
import { useAuth } from '../../context/AuthContext';

export function PageHead({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const slug = slugFromPath(usePathname() || '/');
  const { comercialMode, marcas, activeMarcaId } = useAuth();
  // En la vista Comercial cada pantalla dice con qué marca se está trabajando (el CRM y los demás módulos se filtran por ella).
  const marcaTrabajo = comercialMode ? marcas.find((m) => m.marcaId === activeMarcaId)?.marca.nombre : null;
  const etiqueta = marcaTrabajo ? (
    <span className="ax-badge ax-badge--accent" title="Marca con la que estás trabajando" style={{ gap: 6 }}>
      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
      Marca: {marcaTrabajo}
    </span>
  ) : null;
  return (
    <div className="ax-page-head">
      <div className="ax-page-head__row">
        <div>
          <Breadcrumb slug={slug} />
          <h1 className="ax-page-head__title">{title}</h1>
          {subtitle && <p className="ax-page-head__subtitle">{subtitle}</p>}
        </div>
        {(actions || etiqueta) && <div className="ax-page-head__actions">{etiqueta}{actions}</div>}
      </div>
    </div>
  );
}

export default PageHead;
