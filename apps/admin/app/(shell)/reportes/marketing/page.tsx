import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { ReportesArea } from '../../../../src/screens/pages/ReportesArea';

export const metadata = metadataForSlug('reportes/marketing');

export default function Page() {
  return <ReportesArea area="marketing" />;
}
