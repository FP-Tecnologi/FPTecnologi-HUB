import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { PartnerSteps } from '@/components/site/PartnerSteps';
import { FeaturedProducts } from '@/components/site2/FeaturedProducts';
import { SplitPaths } from '@/components/site2/SplitPaths';
import { StatsBar } from '@/components/site2/StatsBar';
import { WhyChooseUs } from '@/components/site2/WhyChooseUs';
import { Header5 } from '@/components/site5/Header5';
import { Hero5 } from '@/components/site5/Hero5';
import { Services5 } from '@/components/site5/Services5';

export const metadata = { title: 'Modelo 5' };

export default function Modelo5Page() {
  return (
    <>
      <Header5 />
      <main>
        <Hero5 />
        <Services5 />
        <div className="pt-20">
          <SplitPaths />
        </div>
        <StatsBar />
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
