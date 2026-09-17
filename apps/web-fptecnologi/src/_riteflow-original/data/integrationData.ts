export interface IntegrationItem {
  id: number;
  name: string;
  icon: string;
  description: string;
  category: 'productivity' | 'social' | 'content' | 'community';
  link: string;
}

export const integrationCategories = [
  { id: 'all', label: 'All Integrations', value: '*' },
  { id: 'productivity', label: 'Productivity', value: 'productivity' },
  { id: 'social', label: 'Social', value: 'social' },
  { id: 'content', label: 'Content', value: 'content' },
  { id: 'community', label: 'Community', value: 'community' },
];

export const integrationsData: IntegrationItem[] = [
  {
    id: 1,
    name: 'TaskPilot',
    icon: '/images/integration/taskpilot.svg',
    description:
      'AI-driven project manager that syncs tasks, deadlines, and team chat so RiteFlow automations can update status, assign owners, and surface next steps in real time.',
    category: 'productivity',
    link: '/integration/taskpilot',
  },
  {
    id: 2,
    name: 'DataBridge',
    icon: '/images/integration/databridge.svg',
    description:
      'Low-code data pipeline tool that funnels spreadsheets, databases, and APIs into RiteFlow, letting your models learn from fresh, unified data without manual uploads.',
    category: 'social',
    link: '/integration/databridge',
  },
  {
    id: 3,
    name: 'ChatSapot',
    icon: '/images/integration/chatsapot.svg',
    description:
      'Omnichannel help-desk platform where RiteFlow bots draft replies, tag sentiment, and escalate issues—all while logging every interaction for analytics.',
    category: 'community',
    link: '/integration/chatsapot',
  },
  {
    id: 4,
    name: 'LeadBoost CRM',
    icon: '/images/integration/leadboost.svg',
    description:
      'Sales pipeline tracker that pairs with RiteFlow to score leads, predict close probability, and auto-generate personalized outreach sequences.',
    category: 'content',
    link: '/integration/leadboost',
  },
  {
    id: 5,
    name: 'VisualMaker',
    icon: '/images/integration/visualmaker.svg',
    description:
      'Cloud design suite that feeds creatives and assets into RiteFlow so marketing teams can instantly produce AI-enhanced ads, banners, and social posts.',
    category: 'community',
    link: '/integration/visualmaker',
  },
  {
    id: 6,
    name: 'InsightPulse BI',
    icon: '/images/integration/insightplulse.svg',
    description:
      'Real-time business-intelligence dashboard that streams KPIs into RiteFlow, triggering automated forecasts, anomaly alerts, and executive summaries.',
    category: 'social',
    link: '/integration/insightpulse',
  },
];
