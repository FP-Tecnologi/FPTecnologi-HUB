import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { PartnerSteps } from '@/components/site/PartnerSteps';
import { FeaturedProducts } from '@/components/site2/FeaturedProducts';
import { SplitPaths } from '@/components/site2/SplitPaths';
import { StatsBar } from '@/components/site2/StatsBar';
import { WhyChooseUs } from '@/components/site2/WhyChooseUs';
import { Header3 } from '@/components/site3/Header3';
import { Hero3 } from '@/components/site3/Hero3';
import { Services3 } from '@/components/site3/Services3';

export const metadata = { title: 'Modelo 3' };

export default function Modelo3Page() {
  return (
    <>
      <Header3 />
      <main>
        <Hero3 />
        <SplitPaths />
        <StatsBar />
        <Services3 />
        <FeaturedProducts />
        <BrandMarquee />
        <WhyChooseUs />
        <PartnerSteps />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
