/*
 * FPTecnologi-HUB · Dashboard — catch-all route for every NON-home manifest slug.
 *
 * Phase A ships ONE real page (Sales at "/"). Every other slug in the nav
 * manifest (dashboards/*, apps/*, ecommerce/*, …) resolves here and renders the
 * <Placeholder> starter, so the whole sidebar / breadcrumb / command palette
 * navigates correctly. `dashboards/sales` is an alias of "/", so it redirects.
 *
 * Page-porting agents replace this generic catch-all per slug by adding an
 * explicit route file (see CONVENTIONS.md → "Add one page"): a folder
 * app/(shell)/dashboards/analytics/page.tsx wins over this catch-all for that
 * exact path, while every not-yet-ported slug keeps falling through to here.
 */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Placeholder } from '../../../src/screens/Placeholder';
import { metadataForSlug } from '../../../src/lib/pageMetadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metadataForSlug((slug || []).join('/'));
}

export default async function CatchAll({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = (slug || []).join('/');
  if (path === 'dashboards/sales' || path === 'index') redirect('/');
  return <Placeholder />;
}
