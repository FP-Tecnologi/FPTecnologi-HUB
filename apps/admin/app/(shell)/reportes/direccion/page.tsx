import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { ReportesArea } from '../../../../src/screens/pages/ReportesArea';

export const metadata = metadataForSlug('reportes/direccion');

export default function Page() {
  return <ReportesArea area="direccion" />;
}
