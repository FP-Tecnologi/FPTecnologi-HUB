import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { PartnerSteps } from '@/components/site/PartnerSteps';
import { FeaturedProducts } from '@/components/site2/FeaturedProducts';
import { SplitPaths } from '@/components/site2/SplitPaths';
import { StatsBar } from '@/components/site2/StatsBar';
import { WhyChooseUs } from '@/components/site2/WhyChooseUs';
import { Header6 } from '@/components/site6/Header6';
import { Hero6 } from '@/components/site6/Hero6';
import { Services6 } from '@/components/site6/Services6';

export const metadata = { title: 'Modelo 6' };

export default function Modelo6Page() {
  return (
    <>
      <Header6 />
      <main>
        <Hero6 />
        <SplitPaths />
        <StatsBar />
        <Services6 />
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
