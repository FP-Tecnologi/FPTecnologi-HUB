import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { ActividadAdmin } from '../../../../src/screens/pages/ActividadAdmin';

export const metadata = metadataForSlug('admin/actividad');

// Next 16 tipa las props de una página (params/searchParams): ActividadAdmin recibe `modo`, así que no se exporta directo.
export default function Page() {
  return <ActividadAdmin modo="global" />;
}
