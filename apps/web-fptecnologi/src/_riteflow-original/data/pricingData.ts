/**
 * Pricing Data
 * 
 * Contains pricing plan information including monthly and yearly pricing,
 * features, and plan details.
 */

export interface PricingFeature {
  text: string;
}

export interface PricingPlan {
  id: number;
  name: string;
  iconId?: string; // SVG icon ID (if using sprite)
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PricingFeature[];
  isPopular?: boolean; // For highlighting popular plan
  buttonText?: string;
  buttonLink?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: 'Starter',
    iconId: 'starter',
    description: 'Perfect for small homes, extensions, or early-phase developments.',
    monthlyPrice: 19,
    yearlyPrice: 190, // 20% discount
    features: [
      { text: 'Up to 3 active projects' },
      { text: 'Basic automation tools' },
      { text: 'Email support' },
      { text: 'Standard analytics dashboard' },
    ],
    buttonText: 'Start for free',
    buttonLink: '#',
  },
  {
    id: 2,
    name: 'Professional',
    iconId: 'professional',
    description: 'Best for growing teams who need advanced tools and integrations.',
    monthlyPrice: 49,
    yearlyPrice: 390, // 20% discount
    features: [
      { text: 'Everything in Starter' },
      { text: 'Advanced AI automation' },
      { text: 'Integrations with Slack, Google Drive' },
      { text: 'Priority email + chat support' },
      { text: 'Advanced analytics & reporting' },
    ],
    isPopular: true,
    buttonText: 'Start for free',
    buttonLink: '#',
  },
  {
    id: 3,
    name: 'Enterprise',
    iconId: 'enterprise',
    description: 'Perfect for freelancers, startups, or small teams getting started with AI workflows.',
    monthlyPrice: 99,
    yearlyPrice: 790, // 20% discount
    features: [
      { text: 'Everything in Professional' },
      { text: 'Custom AI model training' },
      { text: 'Dedicated account manager' },
      { text: 'On-premise or private cloud deployment' },
      { text: '24/7 support with SLA' },
    ],
    buttonText: 'Start for free',
    buttonLink: '#',
  },
];
