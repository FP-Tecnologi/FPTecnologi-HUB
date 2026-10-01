import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { PartnerSteps } from '@/components/site/PartnerSteps';
import { FeaturedProducts } from '@/components/site2/FeaturedProducts';
import { SplitPaths } from '@/components/site2/SplitPaths';
import { StatsBar } from '@/components/site2/StatsBar';
import { WhyChooseUs } from '@/components/site2/WhyChooseUs';
import { Header4 } from '@/components/site4/Header4';
import { Hero4 } from '@/components/site4/Hero4';
import { Services4 } from '@/components/site4/Services4';

export const metadata = { title: 'Modelo 4' };

export default function Modelo4Page() {
  return (
    <>
      <Header4 />
      <main>
        <Hero4 />
        <SplitPaths />
        <StatsBar />
        <Services4 />
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
