import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { CrmReportes } from '../../../../src/screens/pages/crm/CrmReportes';

export const metadata = metadataForSlug('crm/reportes');

export default function Page() {
  return <CrmReportes />;
}
