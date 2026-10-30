import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { ReportesArea } from '../../../../src/screens/pages/ReportesArea';

export const metadata = metadataForSlug('reportes/finanzas');

export default function Page() {
  return <ReportesArea area="finanzas" />;
}
