import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { CrmOportunidades } from '../../../../src/screens/pages/crm/CrmOportunidades';

export const metadata = metadataForSlug('crm/oportunidades');

export default function Page() {
  return <CrmOportunidades />;
}
