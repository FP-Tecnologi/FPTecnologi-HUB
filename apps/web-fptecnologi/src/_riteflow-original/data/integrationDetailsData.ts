export interface IntegrationDetails {
  id: number;
  slug: string;
  name: string;
  icon: string;
  description: string;
  content: {
    title: string;
    paragraphs: string[];
    image?: {
      src: string;
      alt: string;
      caption?: string;
    };
    codeBlock?: {
      language: string;
      code: string;
    };
    features?: Array<{
      title: string;
      description: string;
    }>;
  };
}

export const integrationDetailsData: IntegrationDetails[] = [
  {
    id: 1,
    slug: 'taskpilot',
    name: 'TaskPilot',
    icon: '/images/integration/taskpilot.svg',
    description:
      'AI-driven project manager that syncs tasks, deadlines, and team chat so RiteFlow automations can update status, assign owners, and surface next steps in real time.',
    content: {
      title: 'Seamless Productivity: TaskPilot Now Integrates with RiteFlow',
      paragraphs: [
        "In today's fast-moving digital landscape, tools that work together win. That's why we're thrilled to announce our latest integration — TaskPilot + RiteFlow — a powerful combination that brings intelligent automation directly into your task management system.",
        "Whether you're managing a solo project or leading a global team, this integration helps you save time, reduce manual effort, and keep everything flowing with AI precision.",
        'TaskPilot is loved for its intuitive task boards, flexible workflows, and real-time collaboration. RiteFlow, on the other hand, brings smart AI that can automate, suggest, and analyze.',
        'Together, they create a connected workspace where tasks get done faster, decisions get smarter, and teams stay focused on what really matters.',
      ],
      image: {
        src: '/images/blog/blog-details.jpg',
        alt: 'thumbnial',
        caption: 'Full Width Image',
      },
      codeBlock: {
        language: 'javascript',
        code: `// Lenis smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 1,
  infinite: false,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);`,
      },
      features: [
        {
          title: 'AI-Powered Task Recommendations',
          description:
            'RiteFlow analyzes your task history and project goals to suggest next steps, flag bottlenecks, and even auto-generate subtasks.',
        },
        {
          title: 'Intelligent Summaries & Reports',
          description:
            'Need to update your team or stakeholders? Automatically generate clean summaries of progress, blockers, and deadlines — ready to send or present.',
        },
        {
          title: 'Context-Aware Suggestions',
          description:
            'Get smart tips based on task descriptions, assignee history, and past outcomes. From re-prioritization to deadline adjustments, our AI adapts in real time.',
        },
        {
          title: 'Automated Workflows',
          description:
            'Set up triggers that connect your tools — like auto-assigning tasks after content approval, or creating follow-ups when deadlines shift.',
        },
      ],
    },
  },
  {
    id: 2,
    slug: 'databridge',
    name: 'DataBridge',
    icon: '/images/integration/databridge.svg',
    description:
      'Low-code data pipeline tool that funnels spreadsheets, databases, and APIs into RiteFlow, letting your models learn from fresh, unified data without manual uploads.',
    content: {
      title: 'Unified Data Integration: DataBridge + RiteFlow',
      paragraphs: [
        'DataBridge simplifies data integration by connecting your spreadsheets, databases, and APIs seamlessly with RiteFlow. This powerful integration eliminates manual data transfers and ensures your AI models always have access to the most current information.',
        'Whether you\'re pulling data from multiple sources or streaming real-time updates, DataBridge + RiteFlow creates a unified data pipeline that powers intelligent automation and decision-making.',
        'With DataBridge\'s low-code interface and RiteFlow\'s AI capabilities, you can transform raw data into actionable insights faster than ever before.',
      ],
      image: {
        src: '/images/blog/blog-details.jpg',
        alt: 'DataBridge integration',
        caption: 'Data Pipeline Architecture',
      },
      features: [
        {
          title: 'Automated Data Synchronization',
          description:
            'Keep your data sources in sync automatically. DataBridge feeds fresh data into RiteFlow in real-time, ensuring your AI models work with the latest information.',
        },
        {
          title: 'Multi-Source Data Aggregation',
          description:
            'Combine data from spreadsheets, databases, and APIs into a single unified stream. RiteFlow processes this aggregated data to generate comprehensive insights.',
        },
        {
          title: 'Real-Time Data Processing',
          description:
            'Process incoming data streams in real-time. RiteFlow analyzes data patterns and triggers automated workflows based on data changes and anomalies.',
        },
        {
          title: 'Smart Data Transformation',
          description:
            'Automatically clean, transform, and structure your data before it reaches RiteFlow. Our AI handles data normalization and formatting intelligently.',
        },
      ],
    },
  },
  {
    id: 3,
    slug: 'chatsapot',
    name: 'ChatSapot',
    icon: '/images/integration/chatsapot.svg',
    description:
      'Omnichannel help-desk platform where RiteFlow bots draft replies, tag sentiment, and escalate issues—all while logging every interaction for analytics.',
    content: {
      title: 'Intelligent Support: ChatSapot + RiteFlow',
      paragraphs: [
        'ChatSapot\'s omnichannel help-desk platform combines seamlessly with RiteFlow to deliver intelligent, AI-powered customer support. This integration enables automated ticket management, sentiment analysis, and intelligent issue escalation.',
        'Transform your customer support operations with RiteFlow\'s AI capabilities. Our bots draft contextually-aware replies, analyze customer sentiment, and route complex issues to the right team members automatically.',
        'Every customer interaction is logged and analyzed, providing valuable insights into support patterns and customer satisfaction trends.',
      ],
      image: {
        src: '/images/blog/blog-details.jpg',
        alt: 'ChatSapot integration',
        caption: 'Customer Support Dashboard',
      },
      features: [
        {
          title: 'AI-Powered Reply Generation',
          description:
            'RiteFlow analyzes customer inquiries and automatically drafts intelligent, contextually-appropriate responses. Support agents can review and send with minimal editing.',
        },
        {
          title: 'Sentiment Analysis & Tagging',
          description:
            'Automatically detect customer sentiment from conversations and tag tickets accordingly. Prioritize urgent issues and identify customers who need immediate attention.',
        },
        {
          title: 'Smart Issue Escalation',
          description:
            'Intelligently route complex issues to the right specialists based on problem type, customer history, and team expertise. Reduce resolution times significantly.',
        },
        {
          title: 'Comprehensive Analytics',
          description:
            'Track every customer interaction with detailed analytics. Understand support patterns, identify common issues, and optimize your support processes continuously.',
        },
      ],
    },
  },
  {
    id: 4,
    slug: 'leadboost',
    name: 'LeadBoost CRM',
    icon: '/images/integration/leadboost.svg',
    description:
      'Sales pipeline tracker that pairs with RiteFlow to score leads, predict close probability, and auto-generate personalized outreach sequences.',
    content: {
      title: 'Smart Sales Automation: LeadBoost CRM + RiteFlow',
      paragraphs: [
        'LeadBoost CRM integrates with RiteFlow to create an intelligent sales pipeline that scores leads, predicts close probability, and automates personalized outreach. This powerful combination transforms how sales teams manage and convert opportunities.',
        'By combining LeadBoost\'s comprehensive CRM capabilities with RiteFlow\'s AI intelligence, you can automate repetitive sales tasks and focus on building relationships with high-value prospects.',
        'Predict which leads are most likely to convert, personalize your outreach at scale, and close deals faster with data-driven insights.',
      ],
      image: {
        src: '/images/blog/blog-details.jpg',
        alt: 'LeadBoost CRM integration',
        caption: 'Sales Pipeline Overview',
      },
      features: [
        {
          title: 'Intelligent Lead Scoring',
          description:
            'RiteFlow analyzes lead behavior, engagement history, and company data to automatically score leads. Focus your efforts on high-probability opportunities that are ready to buy.',
        },
        {
          title: 'Close Probability Prediction',
          description:
            'Predict which deals are likely to close based on historical data, deal patterns, and buyer behavior. Make informed decisions about resource allocation and pipeline management.',
        },
        {
          title: 'Automated Outreach Sequences',
          description:
            'Generate personalized email sequences automatically. RiteFlow creates contextually-relevant messages based on lead interests, industry, and engagement history.',
        },
        {
          title: 'Pipeline Analytics & Insights',
          description:
            'Get deep insights into your sales pipeline performance. Identify bottlenecks, forecast revenue accurately, and optimize your sales process with AI-powered analytics.',
        },
      ],
    },
  },
  {
    id: 5,
    slug: 'visualmaker',
    name: 'VisualMaker',
    icon: '/images/integration/visualmaker.svg',
    description:
      'Cloud design suite that feeds creatives and assets into RiteFlow so marketing teams can instantly produce AI-enhanced ads, banners, and social posts.',
    content: {
      title: 'Creative Automation: VisualMaker + RiteFlow',
      paragraphs: [
        'VisualMaker\'s cloud design suite integrates seamlessly with RiteFlow to automate creative production and enhance marketing assets with AI. This integration empowers marketing teams to create professional designs faster than ever before.',
        'Combine VisualMaker\'s design capabilities with RiteFlow\'s AI to generate variations, optimize creatives for different platforms, and maintain brand consistency across all marketing materials.',
        'From social media posts to banner ads, RiteFlow helps you scale your creative output while maintaining quality and brand standards.',
      ],
      image: {
        src: '/images/blog/blog-details.jpg',
        alt: 'VisualMaker integration',
        caption: 'Creative Design Studio',
      },
      features: [
        {
          title: 'AI-Enhanced Creative Generation',
          description:
            'RiteFlow analyzes your brand guidelines and automatically enhances VisualMaker designs. Generate multiple variations optimized for different platforms and audiences.',
        },
        {
          title: 'Automated Asset Optimization',
          description:
            'Automatically resize and optimize creatives for various platforms. RiteFlow ensures your designs look perfect on social media, display ads, and email campaigns.',
        },
        {
          title: 'Brand Consistency Automation',
          description:
            'Maintain brand consistency across all designs. RiteFlow checks colors, fonts, and layouts against your brand guidelines automatically.',
        },
        {
          title: 'Performance-Based Optimization',
          description:
            'Analyze creative performance and automatically generate improved versions. RiteFlow uses engagement data to suggest design changes that increase conversion rates.',
        },
      ],
    },
  },
  {
    id: 6,
    slug: 'insightpulse',
    name: 'InsightPulse BI',
    icon: '/images/integration/insightplulse.svg',
    description:
      'Real-time business-intelligence dashboard that streams KPIs into RiteFlow, triggering automated forecasts, anomaly alerts, and executive summaries.',
    content: {
      title: 'Intelligent Analytics: InsightPulse BI + RiteFlow',
      paragraphs: [
        'InsightPulse BI\'s real-time business intelligence platform integrates with RiteFlow to deliver predictive analytics, automated reporting, and intelligent insights. This powerful combination transforms raw data into actionable business intelligence.',
        'Stream KPIs and metrics directly into RiteFlow, where AI analyzes trends, detects anomalies, and generates comprehensive executive summaries automatically.',
        'Make data-driven decisions faster with automated forecasts, anomaly detection, and intelligent reporting that highlights what matters most to your business.',
      ],
      image: {
        src: '/images/blog/blog-details.jpg',
        alt: 'InsightPulse BI integration',
        caption: 'Business Intelligence Dashboard',
      },
      features: [
        {
          title: 'Real-Time KPI Streaming',
          description:
            'Stream key performance indicators from InsightPulse BI directly into RiteFlow. Monitor business metrics in real-time and receive instant alerts on significant changes.',
        },
        {
          title: 'Automated Forecasting',
          description:
            'Generate accurate forecasts automatically. RiteFlow analyzes historical data and trends to predict future performance across multiple business metrics.',
        },
        {
          title: 'Anomaly Detection & Alerts',
          description:
            'Automatically detect unusual patterns and anomalies in your business data. Get instant alerts when metrics deviate from expected ranges, enabling proactive decision-making.',
        },
        {
          title: 'Executive Summary Generation',
          description:
            'Generate comprehensive executive summaries automatically. RiteFlow compiles key insights, trends, and recommendations into easy-to-understand reports for stakeholders.',
        },
      ],
    },
  },
];
