import React from 'react';
import AboutSection from '@riteflow/components/home-v2/AboutSection';
import PricingSection from '@riteflow/components/pricing/PricingSection';
import Newsletter from '@riteflow/components/shortCode/Newsletter';
import HomeBannerOne from '@riteflow/components/home-v1/HomeBannerOne';
import ClientLogosOne from '@riteflow/components/home-v1/ClientLogosOne';
import ProcessSection from '@riteflow/components/home-v1/ProcessSection';
import WorkflowSection from '@riteflow/components/home-v1/WorkflowSection';
import TestimonialOne from '@riteflow/components/home-v1/TestimonialOne';
import UseCaseSection from '@riteflow/components/useCase/UseCaseSection';

export const metadata = { title: 'Preview: Riteflow Home V1 (original)' };

/* Vista previa temporal — plantilla original de Riteflow (home-v1) tal cual
   vino, con su copy/contenido/assets en inglés. Solo para comparar antes de
   decidir qué adaptar. Ver app/preview/layout.tsx. */
function BannerPreview() {
  return (
    <div style={{ background: '#7a1f1f', color: '#fff', padding: '10px 16px', fontSize: 13, textAlign: 'center', position: 'relative', zIndex: 60 }}>
      Vista previa temporal — plantilla original de Riteflow (Home V1), contenido de ejemplo en inglés, no real. Solo para comparar antes de adaptar.
    </div>
  );
}

export default function HomeV1PreviewPage() {
  return (
    <>
      <BannerPreview />
      <HomeBannerOne />
      <ClientLogosOne />
      <AboutSection variant="one" />
      <ProcessSection />
      <UseCaseSection variant="two" />
      <WorkflowSection />
      <TestimonialOne />
      <PricingSection variant="two" />
      <Newsletter />
    </>
  );
}
