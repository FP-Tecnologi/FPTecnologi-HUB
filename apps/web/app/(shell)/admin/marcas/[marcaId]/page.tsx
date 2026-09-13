/* Dashboard de una marca visto desde Administración, sin activarla (ver
   src/screens/AdminMarcaDashboard.tsx). Fuera del nav-manifest a propósito:
   solo se llega acá por los links del sidebar/Home en modo Administración. */
import { AdminMarcaDashboard } from '../../../../../src/screens/AdminMarcaDashboard';

export default async function AdminMarcaDashboardPage({
  params,
}: {
  params: Promise<{ marcaId: string }>;
}) {
  const { marcaId } = await params;
  return <AdminMarcaDashboard marcaId={marcaId} />;
}
