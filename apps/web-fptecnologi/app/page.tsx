import { BrandMarquee } from '@/components/site/BrandMarquee';
import { Contact } from '@/components/site/Contact';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { PartnerSteps } from '@/components/site/PartnerSteps';
import { Solutions } from '@/components/site/Solutions';
import { TopBar } from '@/components/site/TopBar';
import { FeaturedProducts } from '@/components/site2/FeaturedProducts';
import { StatsBar } from '@/components/site2/StatsBar';
import { WhyChooseUs } from '@/components/site2/WhyChooseUs';

export default function HomePage() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Hero />
        <BrandMarquee />
        <Solutions />
        <FeaturedProducts />
        <WhyChooseUs />
        <StatsBar />
        <PartnerSteps />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
