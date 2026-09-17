export interface UseCase {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconId: string; // MarketingIcon, ChartIcon, TtIcon, SupportIcon, TalentIcon, InsightsIcon
}

export const useCaseData: UseCase[] = [
  {
    id: '1',
    slug: 'marketing-campaign-builder',
    title: 'Marketing Campaign Builder',
    description:
      'Generate on-brand copy, visuals, and audience targeting suggestions automatically, shrinking campaign planning from days to minutes.',
    iconId: 'MarketingIcon',
  },
  {
    id: '2',
    slug: 'financial-forecasting',
    title: 'Financial Forecasting',
    description:
      'Predict cash-flow, flag anomalies, and model scenarios in seconds, empowering finance teams.',
    iconId: 'ChartIcon',
  },
  {
    id: '3',
    slug: 'creative-content-generation',
    title: 'Creative Content Generation',
    description:
      'Produce blogs, social posts, ad copy, and more — instantly. RiteFloow helps creators and marketers brainstorm, draft, and polish content in minutes, not hours.',
    iconId: 'TtIcon',
  },
  {
    id: '4',
    slug: 'customer-support-automation',
    title: 'Customer Support Automation',
    description:
      'AI chatbots draft precise replies, triage tickets, and surface knowledge-base articles, and delivering in 24/7.',
    iconId: 'SupportIcon',
  },
  {
    id: '5',
    slug: 'hr-talent-acquisition',
    title: 'HR Talent Acquisition',
    description:
      'Screen résumés, match skills, and craft personalized outreach so recruiters spend less time sorting and more time.',
    iconId: 'TalentIcon',
  },
  {
    id: '6',
    slug: 'product-development-insights',
    title: 'Product Development Insights',
    description:
      'Mine feedback, usage data, and market trends to pinpoint winning features, predict demand, and guide roadmaps with data-driven clarity.',
    iconId: 'InsightsIcon',
  },
];
