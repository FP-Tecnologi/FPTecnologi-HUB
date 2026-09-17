/**
 * Demo page data – slider, inner pages, why choose, homepages
 */

export interface DemoSliderItem {
  href: string;
  image: string;
  alt: string;
}

export interface DemoStatCard {
  value: string;
  label: string;
  isCounter?: boolean;
  target?: number;
}

export interface WhyChooseCard {
  image: string;
  alt: string;
  count: string;
  countSuffix?: string;
  title: string;
  description: string;
  isFigma?: boolean;
  figmaIcon?: string;
  fullWidth?: boolean;
  isCounter?: boolean;
  target?: number;
}

export interface DemoPageCard {
  href: string;
  title: string;
  image: string;
  alt: string;
  isBgImage?: boolean;
}

export const demoBannerStats: DemoStatCard[] = [
  { value: '02', label: 'Homepages' },
  { value: '20', label: 'Total Pages', isCounter: true, target: 20 },
  { value: '50', label: 'Sections', isCounter: true, target: 50 },
];

export const demoSliderItems: DemoSliderItem[] = [
  { href: '/home-v1', image: '/images/demo/slider/slide-01.png', alt: 'Home v1' },
  { href: '/home-v2', image: '/images/demo/slider/slide-02.png', alt: 'Home v2' },
  { href: '/about', image: '/images/demo/slider/slide-03.png', alt: 'About' },
  { href: '/ai-policy', image: '/images/demo/slider/slide-04.png', alt: 'AI Policy' },
  { href: '/blog', image: '/images/demo/slider/slide-05.png', alt: 'Blog' },
  { href: '/join-wishlist', image: '/images/demo/slider/slide-06.png', alt: 'Join Wishlist' },
  { href: '/contact', image: '/images/demo/slider/slide-07.png', alt: 'Contact' },
  { href: '/pricing', image: '/images/demo/slider/slide-08.png', alt: 'Pricing' },
  { href: '/integration-category', image: '/images/demo/slider/slide-09.png', alt: 'Integration Category' },
  { href: '/use-cases', image: '/images/demo/slider/slide-10.png', alt: 'Use Case Details' },
  { href: '/integration', image: '/images/demo/slider/slide-11.png', alt: 'Integration' },
  { href: '/use-cases', image: '/images/demo/slider/slide-12.png', alt: 'Use Cases' },
  { href: '/integration', image: '/images/demo/slider/slide-13.png', alt: 'Integration Details' },
  { href: '/blog', image: '/images/demo/slider/slide-14.png', alt: 'Blog Details' },
  { href: '/security-and-privacy', image: '/images/demo/slider/slide-15.png', alt: 'Security & Privacy' },
  { href: '/password-protected', image: '/images/demo/slider/slide-16.png', alt: 'Password Protected' },
  { href: '/error', image: '/images/demo/slider/slide-17.png', alt: 'Error' },
];

export const whyChooseData = {
  badge: 'Why Choose RiteFlow Template',
  title: 'A Modern AI SaaS Template Built for Speed',
  excerpt:
    'RiteFlow is a premium Template crafted for AI startups, SaaS products, and tech companies. It\'s fast, scalable, and designed for high conversions.',
  cards: [
    {
      image: '/images/demo/why-chose-01.png',
      alt: 'Styles & Icons',
      count: '40',
      countSuffix: '+',
      title: 'Styles & Icons',
      description: 'Comes with a flexible style guide, reusable utility classes, and custom icon sets to match AI-tech vibes.',
      isCounter: true,
      target: 40,
    },
    {
      image: '/images/demo/why-chose-02.png',
      alt: 'Inner Pages',
      count: '20',
      countSuffix: '+',
      title: 'Inner Pages',
      description:
        'Includes all the essentials — Blog, Careers, Docs, Pricing, Changelog, Contact, Login, Dashboard, and more — ready to launch fast.',
      isCounter: true,
      target: 20,
    },
    {
      image: '/images/demo/why-chose-03.png',
      alt: 'Figma Design',
      count: '',
      title: 'Figma Design File Included',
      description:
        'The full Figma file is included with your purchase. Customize layouts, typography, and UI components before publishing to Webflow.',
      isFigma: true,
      figmaIcon: '/images/demo/figma.svg',
      fullWidth: true,
    },
  ] as WhyChooseCard[],
};

export const homepagesData: DemoPageCard[] = [
  { href: '/home-v1', title: 'Home 1', image: '/images/demo/home-01.jpg', alt: 'Home 1', isBgImage: true },
  { href: '/home-v2', title: 'Home 2', image: '/images/demo/home-02.jpg', alt: 'Home 2', isBgImage: true },
];

export const innerPagesData: DemoPageCard[] = [
  { href: '/about', title: 'About', image: '/images/demo/about.png', alt: 'About' },
  { href: '/ai-policy', title: 'AI Policy', image: '/images/demo/ai-policy.png', alt: 'AI Policy' },
  { href: '/blog', title: 'Blog', image: '/images/demo/blog.png', alt: 'Blog' },
  { href: '/blog', title: 'Blog Details', image: '/images/demo/blog-details.png', alt: 'Blog Details' },
  { href: '/contact', title: 'Contact', image: '/images/demo/contact.png', alt: 'Contact' },
  { href: '/features', title: 'Features', image: '/images/demo/features.png', alt: 'Features' },
  { href: '/get-demo', title: 'Get a Demo', image: '/images/demo/get-a-demo.png', alt: 'Get a Demo' },
  { href: '/integration', title: 'Integration', image: '/images/demo/integration.png', alt: 'Integration' },
  { href: '/integration-category', title: 'Integration Category', image: '/images/demo/integration-category.png', alt: 'Integration Category' },
  { href: '/integration', title: 'Integration Details', image: '/images/demo/integration-detail.png', alt: 'Integration Details' },
  { href: '/join-wishlist', title: 'Join Wishlist', image: '/images/demo/join-wishlist.png', alt: 'Join Wishlist' },
  { href: '/pricing', title: 'Pricing', image: '/images/demo/pricing.png', alt: 'Pricing' },
  { href: '/security-and-privacy', title: 'Security & Privacy', image: '/images/demo/security.png', alt: 'Security & Privacy' },
  { href: '/use-cases', title: 'Use Cases', image: '/images/demo/use-case.png', alt: 'Use Cases' },
  { href: '/use-cases', title: 'Use Cases Details', image: '/images/demo/use-case-details.png', alt: 'Use Case Details' },
  { href: '/error', title: 'Error', image: '/images/demo/error.png', alt: 'Error' },
  { href: '/password-protected', title: 'Password Protected', image: '/images/demo/password.png', alt: 'Password Protected' },
];
