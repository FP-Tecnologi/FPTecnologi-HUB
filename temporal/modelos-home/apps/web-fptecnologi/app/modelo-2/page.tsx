import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { PartnerSteps } from '@/components/site/PartnerSteps';
import { FeaturedProducts } from '@/components/site2/FeaturedProducts';
import { Header2 } from '@/components/site2/Header2';
import { Hero2 } from '@/components/site2/Hero2';
import { Services2 } from '@/components/site2/Services2';
import { SplitPaths } from '@/components/site2/SplitPaths';
import { StatsBar } from '@/components/site2/StatsBar';
import { WhyChooseUs } from '@/components/site2/WhyChooseUs';

export const metadata = { title: 'Modelo 2' };

export default function Modelo2Page() {
  return (
    <>
      <Header2 />
      <main>
        <Hero2 />
        <SplitPaths />
        <StatsBar />
        <Services2 />
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
