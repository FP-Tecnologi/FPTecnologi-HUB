import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { CrmOportunidades } from '../../../../src/screens/pages/crm/CrmOportunidades';

export const metadata = metadataForSlug('crm/mis-oportunidades');

export default function Page() {
  return <CrmOportunidades propio />;
}
