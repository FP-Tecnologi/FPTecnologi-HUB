'use client';
/*
 * FPTecnologi-HUB — la vista en la que está el usuario (Administración, Comercial o una marca) tal como la necesitan el
 * menú lateral, la barra del celular y el buscador, y el cambio de vista automático al abrir una página por enlace.
 */
import { useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { manifest, slugFromPath } from '../lib/manifest';

/** Contexto para `visibleEnDashboard`: rol, vista y marca con la que se filtran los módulos. */
export function useVistaMenu() {
  const { marcas, activeMarcaId, adminMode, comercialMode, esSuperAdmin } = useAuth();
  return useMemo(() => {
    const activa = adminMode ? undefined : marcas.find((m) => m.marcaId === activeMarcaId);
    const roleName = esSuperAdmin && (adminMode || comercialMode)
      ? 'admin'
      : adminMode ? (marcas[0]?.rol.nombre ?? null) : (activa?.rol.nombre ?? null);
    return { roleName, adminMode, comercialMode, marcaNombre: activa?.marca.nombre ?? null };
  }, [marcas, activeMarcaId, adminMode, comercialMode, esSuperAdmin]);
}

/** Antes de abrir un aviso: pasa a la marca a la que pertenece, para que el módulo muestre sus datos. */
export function useMarcaDelAviso() {
  const { marcas, activeMarcaId, setActiveMarcaId } = useAuth();
  return (marcaId: string | null | undefined) => {
    if (marcaId && marcaId !== activeMarcaId && marcas.some((m) => m.marcaId === marcaId)) setActiveMarcaId(marcaId, { mantenerVista: true });
  };
}

/** Páginas que se pueden ver sin salir de Comercial (las de su sección, incluidas las que llegan por alias). */
const SLUGS_COMERCIAL = new Set(
  manifest.nodes.filter((n) => manifest.trail(n)[0]?.section === 'COMERCIAL').map((n) => manifest.resolve(n)!.slug),
);

/**
 * Mantiene el menú de acuerdo con la página: abrir el CRM (por un enlace, una notificación o «Ver en CRM») entra en
 * Comercial, y abrir un módulo de una web que no es comercial sale de ella. Solo actúa cuando cambia la ruta, para no
 * pelearse con el selector del menú.
 */
export function useSincronizarVista() {
  const slug = slugFromPath(usePathname() || '/');
  const { marcas, comercialMode, esComercial, setComercialMode } = useAuth();
  const revisada = useRef<string | null>(null);
  useEffect(() => {
    if (!marcas.length || revisada.current === slug) return;
    revisada.current = slug;
    if (slug.startsWith('crm/') || slug.startsWith('comercial/')) {
      if (esComercial && !comercialMode) setComercialMode(true);
      return;
    }
    const raiz = manifest.trail(manifest.bySlug.get(slug))[0];
    if (comercialMode && raiz?.section === 'MARCA' && !SLUGS_COMERCIAL.has(slug)) setComercialMode(false);
  }, [slug, marcas, comercialMode, esComercial, setComercialMode]);
}
