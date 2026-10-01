import React from 'react';
import HomeV2Banner from '@riteflow/components/home-v2/HomeV2Banner';
import ClientLogos from '@riteflow/components/home-v2/ClientLogos';
import AboutSection from '@riteflow/components/home-v2/AboutSection';
import IntegrationSection from '@riteflow/components/integration/IntegrationSection';
import TestimonialSection from '@riteflow/components/home-v2/TestimonialSection';
import ComparisonTable from '@riteflow/components/home-v2/ComparisonTable';
import PricingSection from '@riteflow/components/pricing/PricingSection';
import Newsletter from '@riteflow/components/shortCode/Newsletter';
import FeaturesSection from '@riteflow/components/features/FeaturesSection';
import UseCaseSection from '@riteflow/components/useCase/UseCaseSection';

export const metadata = { title: 'Preview: Riteflow Home V2 (original)' };

/* Vista previa temporal — plantilla original de Riteflow (home-v2) tal cual
   vino, con su copy/contenido/assets en inglés. Solo para comparar antes de
   decidir qué adaptar. Ver app/preview/layout.tsx. */
function BannerPreview() {
  return (
    <div style={{ background: '#7a1f1f', color: '#fff', padding: '10px 16px', fontSize: 13, textAlign: 'center', position: 'relative', zIndex: 60 }}>
      Vista previa temporal — plantilla original de Riteflow (Home V2), contenido de ejemplo en inglés, no real. Solo para comparar antes de adaptar. Ver la versión adaptada en <a href="/modelo-riteflow" style={{ color: '#fff', textDecoration: 'underline' }}>/modelo-riteflow</a>.
    </div>
  );
}

export default function HomeV2PreviewPage() {
  return (
    <>
      <BannerPreview />
      <HomeV2Banner />
      <ClientLogos />
      <AboutSection variant="two" />
      <FeaturesSection variant="two" />
      <IntegrationSection showFilters={false} variant="two" />
      <TestimonialSection />
      <ComparisonTable />
      <UseCaseSection variant="two" />
      <PricingSection variant="two" />
      <Newsletter />
    </>
  );
}
