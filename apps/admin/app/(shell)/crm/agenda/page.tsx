import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { CrmAgenda } from '../../../../src/screens/pages/crm/CrmAgenda';

export const metadata = metadataForSlug('crm/agenda');

export default function Page() {
  return <CrmAgenda />;
}
