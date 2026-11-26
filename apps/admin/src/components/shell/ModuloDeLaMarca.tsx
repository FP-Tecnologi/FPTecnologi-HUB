'use client';
/*
 * FPTecnologi-HUB — Candado de módulos por marca: el menú ya oculta lo que una marca no usa, pero la ruta se puede
 * escribir a mano (o quedar abierta al cambiar de marca). Aquí no se dibuja la pantalla si la marca activa no la usa,
 * para que no se edite contenido de otra web con la marca equivocada.
 */
import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { rutaPermitidaEnMarca, slugFromPath } from '../../lib/manifest';
import { PageHead } from './PageHead';

export function ModuloDeLaMarca({ children }: { children: ReactNode }) {
  const slug = slugFromPath(usePathname() || '/');
  const { marcas, activeMarcaId, adminMode, comercialMode } = useAuth();
  const marca = adminMode ? undefined : marcas.find((m) => m.marcaId === activeMarcaId)?.marca.nombre;

  if (marca && !rutaPermitidaEnMarca(slug, marca)) {
    return (
      <>
        <PageHead title="Este módulo no es de esta marca" subtitle={`La web de ${marca} no usa este módulo. Cambia de marca en el menú lateral o vuelve al inicio.`} />
        <div><Link className="ax-btn ax-btn--primary" href={comercialMode ? '/comercial/inicio' : '/'}>Ir al inicio</Link></div>
      </>
    );
  }
  // En Comercial se cambia de marca sin salir de la página: se vuelve a montar para no arrastrar datos de la anterior.
  // El CRM no: recarga solo y su formulario de alta cambia de marca por dentro.
  return <Fragment key={comercialMode && !slug.startsWith('crm/') ? (activeMarcaId ?? '') : ''}>{children}</Fragment>;
}
