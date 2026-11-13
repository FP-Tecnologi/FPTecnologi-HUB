import { metadataForSlug } from '../../../../src/lib/pageMetadata';
import { CrmEmbudo } from '../../../../src/screens/pages/crm/CrmEmbudo';

export const metadata = metadataForSlug('crm/embudo');

export default function Page() {
  return <CrmEmbudo />;
}
