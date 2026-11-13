import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { ActividadAdmin } from '../../../../src/screens/pages/ActividadAdmin';

export const metadata = metadataForSlug('admin/actividad');

export default function Page() {
  return <ActividadAdmin />;
}
