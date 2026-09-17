import { UseCase } from './useCaseData';

/**
 * Statistics Card Data
 */
export interface UseCaseStat {
  value: string | number;
  suffix?: string; // e.g., "%", "M", "+"
  prefix?: string; // e.g., "$"
  label: string;
  description: string;
}

/**
 * Article Content Section
 */
export interface UseCaseContent {
  heading: string;
  paragraphs: string[];
  listItems?: string[];
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
}

/**
 * Extended Use Case with Details
 */
export interface UseCaseDetails extends UseCase {
  stats: UseCaseStat[];
  content: UseCaseContent[];
}

/**
 * Use Case Details Data
 * Each use case has its own unique content, stats, and article sections
 */
export const useCaseDetailsData: Record<string, UseCaseDetails> = {
  'marketing-campaign-builder': {
    id: '1',
    slug: 'marketing-campaign-builder',
    title: 'Marketing Campaign Builder',
    description:
      'Generate on-brand copy, visuals, and audience targeting suggestions automatically, shrinking campaign planning from days to minutes.',
    iconId: 'MarketingIcon',
    stats: [
      {
        value: 45,
        suffix: '%',
        label: 'Time Saved',
        description: 'Average reduction in campaign planning time using AI-powered tools.',
      },
      {
        prefix: '$',
        value: 5,
        suffix: 'M+',
        label: 'ROI Increase',
        description: 'Average revenue boost from optimized marketing campaigns.',
      },
      {
        value: 300,
        suffix: '+',
        label: 'Campaigns Created',
        description: 'Marketing campaigns generated and launched successfully.',
      },
    ],
    content: [
      {
        heading: 'Transform Campaign Planning with AI',
        paragraphs: [
          'Marketing teams spend countless hours brainstorming, writing copy, and planning campaigns. Traditional methods are slow, inconsistent, and often miss the mark with target audiences. RiteFlow revolutionizes this process by automating campaign creation from concept to launch.',
          'Our AI analyzes your brand voice, target demographics, and campaign goals to generate on-brand copy, visual suggestions, and audience targeting recommendations in minutes — not days.',
        ],
        listItems: [
          'Automated copy generation that matches your brand voice',
          'Visual content suggestions based on campaign goals',
          'Audience targeting recommendations powered by AI insights',
        ],
      },
      {
        heading: 'From Concept to Launch in Minutes',
        paragraphs: [
          'Gone are the days of endless meetings and revision cycles. RiteFlow streamlines your entire campaign workflow, allowing your team to focus on strategy and creativity rather than manual content creation.',
          'Whether you\'re launching a product, running a seasonal promotion, or building brand awareness, RiteFlow adapts to your needs and delivers campaign-ready content instantly.',
        ],
      },
      {
        heading: 'Scale Your Marketing Efforts',
        paragraphs: [
          'With RiteFlow, marketing teams can scale their efforts without scaling their headcount. Generate multiple campaign variations, A/B test different messaging, and launch campaigns faster than ever before.',
          'The future of marketing is here — intelligent, automated, and results-driven.',
        ],
        image: {
          src: '/images/blog/blog-details.jpg',
          alt: 'Marketing campaign builder illustration',
          caption: 'AI-powered campaign creation',
        },
      },
    ],
  },
  'financial-forecasting': {
    id: '2',
    slug: 'financial-forecasting',
    title: 'Financial Forecasting',
    description:
      'Predict cash-flow, flag anomalies, and model scenarios in seconds, empowering finance teams.',
    iconId: 'ChartIcon',
    stats: [
      {
        value: 18,
        suffix: '%',
        label: 'Cost Reduction',
        description: 'Average decrease in operational expenses using AI-optimized financial planning.',
      },
      {
        prefix: '$',
        value: 2,
        suffix: 'M+',
        label: 'Projected Revenue',
        description: 'AI-analyzed forecast for your next quarter based on trends and historical performance.',
      },
      {
        prefix: '$',
        value: 122,
        suffix: '+',
        label: 'Scenarios Modeled',
        description: 'Multiple custom forecasts generated instantly to support better, faster decisions.',
      },
    ],
    content: [
      {
        heading: 'Plan Smarter with AI-Driven Foresight',
        paragraphs: [
          'Staying financially prepared is more than a monthly ritual — it\'s a daily necessity. In a business world where market conditions shift overnight, relying on manual spreadsheets and fixed assumptions can leave your team blindsided. RiteFlow brings intelligent financial forecasting into your workflow, offering a smarter, faster, and more dynamic way to plan ahead.',
        ],
        listItems: [
          'Combining Craftsmanship with Innovation for Exceptional Results',
          'Building Landmarks and Strengthening Communities Your Trusted Partner for Construction Excellence',
          'Delivering Projects That Surpass Expectations Committed to Excellence from Blueprint to Reality',
        ],
        image: {
          src: '/images/blog/blog-details.jpg',
          alt: 'Financial forecasting dashboard',
          caption: 'Full Width Image',
        },
      },
      {
        heading: 'Say Goodbye to Static Spreadsheets',
        paragraphs: [
          'Traditional forecasting is slow, labor-intensive, and often out of sync with reality. Finance teams spend hours building models, updating assumptions, and cross-checking data, only to end up with a projection that\'s outdated by the time it\'s shared.',
          'RiteFlow automates the heavy lifting. By connecting directly to your financial systems — like accounting platforms, CRMs, or eCommerce dashboards — it analyzes current and historical trends instantly. It replaces reactive planning with forward-thinking clarity, helping you stay ahead of revenue shifts, expense spikes, or funding gaps.',
        ],
      },
      {
        heading: 'Intelligence That Learns With You',
        paragraphs: [
          'Our AI models don\'t just crunch numbers — they learn from them. Over time, RiteFlow becomes more accurate by understanding your business\'s seasonal trends, customer behavior, and cash flow rhythm. As new data flows in, your forecasts update automatically, keeping your decisions rooted in real-time performance instead of static reports.',
          'This means you\'re always forecasting based on what\'s happening now — not what happened last quarter. No more guesswork. Just smart, adaptive planning.',
        ],
      },
      {
        heading: 'Make Better Decisions, Faster',
        paragraphs: [
          'With RiteFlow, financial leaders gain more than a dashboard. They gain clarity. Whether you\'re modeling different growth scenarios or preparing for an investor pitch, our platform makes it easy to explore outcomes, compare risks, and align on direction.',
          'AI shows you how a sudden drop in revenue might impact runway, or how an increase in ad spend could change your Q3 margin. These insights help teams respond with agility — not panic. Your forecasting becomes a strategic advantage, not a monthly burden.',
        ],
      },
      {
        heading: 'Built for Founders, CFOs, and Teams Alike',
        paragraphs: [
          'Whether you\'re a founder managing every dollar or a CFO guiding a large finance team, RiteFlow meets you where you are. Startups use it to plan funding rounds and stretch burn rates. Enterprises use it to align departments, monitor budgets, and drive profitability. Whatever your size or structure, financial clarity is now accessible and scalable — powered by AI.',
        ],
      },
      {
        heading: 'The Future of Forecasting Starts Here',
        paragraphs: [
          'AI is changing the way businesses operate, and financial planning is no exception. With RiteFlow, you don\'t just get smarter predictions — you get peace of mind. You get the confidence to lead your business forward, knowing you have a tool that sees further, learns faster, and plans better.',
          'Let forecasting feel less like guesswork — and more like foresight.',
        ],
        image: {
          src: '/images/about/banner-thumb.jpg',
          alt: 'Financial planning illustration',
          caption: 'Full Width Image',
        },
      },
    ],
  },
  'creative-content-generation': {
    id: '3',
    slug: 'creative-content-generation',
    title: 'Creative Content Generation',
    description:
      'Produce blogs, social posts, ad copy, and more — instantly. RiteFloow helps creators and marketers brainstorm, draft, and polish content in minutes, not hours.',
    iconId: 'TtIcon',
    stats: [
      {
        value: 60,
        suffix: '%',
        label: 'Faster Creation',
        description: 'Reduce content creation time from hours to minutes.',
      },
      {
        value: 500,
        suffix: '+',
        label: 'Content Pieces',
        description: 'Blog posts, social media content, and ad copy generated daily.',
      },
      {
        value: 4,
        suffix: 'x',
        label: 'Output Increase',
        description: 'Teams produce 4x more content with the same resources.',
      },
    ],
    content: [
      {
        heading: 'Unleash Your Creative Potential',
        paragraphs: [
          'Content creation shouldn\'t be a bottleneck. Whether you\'re a solo creator, a marketing team, or a content agency, RiteFlow helps you produce high-quality content at scale without sacrificing creativity or brand voice.',
          'From blog posts to social media captions, ad copy to email campaigns — RiteFlow generates content that sounds like you wrote it, but in a fraction of the time.',
        ],
      },
      {
        heading: 'Brainstorm, Draft, and Polish in Minutes',
        paragraphs: [
          'The creative process is now faster and more efficient. RiteFlow helps you brainstorm ideas, create first drafts, and refine content until it\'s perfect — all in one seamless workflow.',
          'No more staring at blank pages. No more writer\'s block. Just endless creative possibilities at your fingertips.',
        ],
      },
    ],
  },
  'customer-support-automation': {
    id: '4',
    slug: 'customer-support-automation',
    title: 'Customer Support Automation',
    description:
      'AI chatbots draft precise replies, triage tickets, and surface knowledge-base articles, and delivering in 24/7.',
    iconId: 'SupportIcon',
    stats: [
      {
        value: 24,
        suffix: '/7',
        label: 'Availability',
        description: 'Round-the-clock customer support without increasing headcount.',
      },
      {
        value: 70,
        suffix: '%',
        label: 'Response Time',
        description: 'Faster average response time compared to manual support.',
      },
      {
        value: 1000,
        suffix: '+',
        label: 'Tickets Resolved',
        description: 'Customer issues resolved automatically per day.',
      },
    ],
    content: [
      {
        heading: '24/7 Support That Never Sleeps',
        paragraphs: [
          'Customer expectations are higher than ever. They want instant answers, personalized service, and round-the-clock availability. RiteFlow makes this possible by automating customer support without losing the human touch.',
          'Our AI chatbots understand context, draft precise replies, and escalate complex issues to human agents when needed — ensuring every customer gets the help they need, when they need it.',
        ],
      },
      {
        heading: 'Intelligent Ticket Triage',
        paragraphs: [
          'Support teams are often overwhelmed by ticket volume. RiteFlow automatically categorizes, prioritizes, and routes tickets to the right team or knowledge base article, reducing response times and improving customer satisfaction.',
        ],
      },
    ],
  },
  'hr-talent-acquisition': {
    id: '5',
    slug: 'hr-talent-acquisition',
    title: 'HR Talent Acquisition',
    description:
      'Screen résumés, match skills, and craft personalized outreach so recruiters spend less time sorting and more time.',
    iconId: 'TalentIcon',
    stats: [
      {
        value: 50,
        suffix: '%',
        label: 'Time Saved',
        description: 'Reduction in time spent on resume screening and candidate matching.',
      },
      {
        value: 3,
        suffix: 'x',
        label: 'Better Matches',
        description: 'Improved candidate-job fit through AI-powered matching.',
      },
      {
        value: 200,
        suffix: '+',
        label: 'Candidates Screened',
        description: 'Resumes analyzed and candidates shortlisted per day.',
      },
    ],
    content: [
      {
        heading: 'Find the Right Talent Faster',
        paragraphs: [
          'Recruiting is time-consuming. Sorting through hundreds of resumes, matching skills to job requirements, and crafting personalized outreach messages takes hours that could be spent building relationships with top candidates.',
          'RiteFlow automates the tedious parts of recruitment — resume screening, skill matching, and initial outreach — so recruiters can focus on what they do best: connecting with people.',
        ],
      },
      {
        heading: 'Personalized Outreach at Scale',
        paragraphs: [
          'Every great hire starts with a great first impression. RiteFlow helps you craft personalized outreach messages that resonate with candidates, increasing response rates and building stronger relationships from day one.',
        ],
      },
    ],
  },
  'product-development-insights': {
    id: '6',
    slug: 'product-development-insights',
    title: 'Product Development Insights',
    description:
      'Mine feedback, usage data, and market trends to pinpoint winning features, predict demand, and guide roadmaps with data-driven clarity.',
    iconId: 'InsightsIcon',
    stats: [
      {
        value: 35,
        suffix: '%',
        label: 'Faster Decisions',
        description: 'Reduced time from insight to product decision.',
      },
      {
        value: 2,
        suffix: 'x',
        label: 'Feature Success',
        description: 'Improved success rate of new feature launches.',
      },
      {
        value: 5000,
        suffix: '+',
        label: 'Data Points Analyzed',
        description: 'Customer feedback and usage data processed daily.',
      },
    ],
    content: [
      {
        heading: 'Data-Driven Product Decisions',
        paragraphs: [
          'Product development shouldn\'t be guesswork. RiteFlow analyzes customer feedback, usage patterns, and market trends to help you make informed decisions about what to build next.',
          'Understand which features drive engagement, predict demand for new capabilities, and guide your product roadmap with confidence — all backed by real data and AI-powered insights.',
        ],
      },
      {
        heading: 'From Feedback to Features',
        paragraphs: [
          'Customer feedback is gold, but it\'s often buried in support tickets, reviews, and surveys. RiteFlow mines this data to surface actionable insights, helping you prioritize features that truly matter to your users.',
        ],
      },
    ],
  },
};

/**
 * Get use case details by slug
 */
export function getUseCaseDetails(slug: string): UseCaseDetails | undefined {
  return useCaseDetailsData[slug];
}
