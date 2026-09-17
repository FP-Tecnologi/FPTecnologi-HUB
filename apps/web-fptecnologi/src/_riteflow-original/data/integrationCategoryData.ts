export interface IntegrationCategory {
  id: number;
  title: string;
  description: string;
  toolsCount: number;
  link: string;
}

export const integrationCategoryData: IntegrationCategory[] = [
  {
    id: 1,
    title: 'Project Management',
    description:
      'Connect with tools like Asana, ClickUp, and Trello to automate task creation, progress tracking, and smart deadline forecasting with AI.',
    toolsCount: 8,
    link: '#',
  },
  {
    id: 2,
    title: 'CRM & Sales',
    description:
      'Enhance platforms like HubSpot, Zoho, or Salesforce with AI-driven lead scoring, customer insights, and predictive sales forecasting.',
    toolsCount: 5,
    link: '#',
  },
  {
    id: 3,
    title: 'Marketing Automation',
    description:
      'Integrate with Mailchimp, ActiveCampaign, or Meta Ads to auto-generate campaign copy, segment audiences, and analyze performance faster.',
    toolsCount: 17,
    link: '#',
  },
  {
    id: 4,
    title: 'Finance & Accounting',
    description:
      'Plug into tools like QuickBooks, Xero, or Stripe to forecast revenue, track expenses, and uncover financial trends using real-time AI analysis.',
    toolsCount: 31,
    link: '#',
  },
  {
    id: 5,
    title: 'Support & Helpdesk',
    description:
      'Link platforms like Zendesk or Intercom to enable automated ticket replies, AI-generated summaries, and smarter customer response flows.',
    toolsCount: 9,
    link: '#',
  },
  {
    id: 6,
    title: 'Data & Analytics',
    description:
      'Sync with platforms like Google Sheets, Notion, or Looker to enrich dashboards, generate instant reports, and surface hidden trends with AI.',
    toolsCount: 18,
    link: '#',
  },
];
