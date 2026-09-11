import { metadataForSlug } from '../../src/lib/pageMetadata';

export const metadata = metadataForSlug('dashboards/sales');

/*
 * FPTecnologi-HUB — ruta "/" (panel de inicio real, ya no el dashboard de
 * muestra "Sales" de Vireo). El componente vive en src/screens/Home.tsx.
 */
export { Home as default } from '../../src/screens/Home';
