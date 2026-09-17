export type TickType = 'purple' | 'red';

export interface ComparisonFeature {
  id: number;
  name: string;
  tooltip?: string;
  columns: TickType[];
}

export interface ComparisonTableData {
  logos: Array<{ src: string; alt: string }>;
  features: ComparisonFeature[];
}

export const comparisonTableData: ComparisonTableData = {
  logos: [
    { src: '/images/home-v2/table-logo-01.svg', alt: 'logo 1' },
    { src: '/images/home-v2/table-logo-02.svg', alt: 'logo 2' },
    { src: '/images/home-v2/table-logo-03.svg', alt: 'logo 3' },
  ],
  features: [
    {
      id: 1,
      name: 'Natural Language Processing (NLP)',
      tooltip: 'AI that understands human language.',
      columns: ['purple', 'red', 'purple'],
    },
    {
      id: 2,
      name: 'Machine Learning Models',
      tooltip: 'Systems that make predictions based on learned data.',
      columns: ['purple', 'purple', 'red'],
    },
    {
      id: 3,
      name: 'Real-time Data Insights',
      tooltip: 'Up-to-the-moment analysis from real-time data streams.',
      columns: ['purple', 'red', 'purple'],
    },
    {
      id: 4,
      name: 'AI-powered Automation',
      tooltip: 'Automation driven by intelligent AI systems.',
      columns: ['purple', 'purple', 'purple'],
    },
    {
      id: 5,
      name: 'Predictive Analytics',
      tooltip: 'Data-driven forecasts and predictions.',
      columns: ['purple', 'purple', 'red'],
    },
    {
      id: 6,
      name: 'Integration with Third-party Apps',
      tooltip: 'Enables smooth connection with third-party applications.',
      columns: ['purple', 'red', 'purple'],
    },
    {
      id: 7,
      name: 'Custom AI Training',
      tooltip: 'Build AI models tailored to your specific data and needs.',
      columns: ['purple', 'purple', 'red'],
    },
    {
      id: 8,
      name: 'Data Security & Compliance',
      tooltip: 'Secure, compliant data handling.',
      columns: ['purple', 'red', 'purple'],
    },
    {
      id: 9,
      name: 'Multi-language Support',
      tooltip: 'AI and UI work across many languages.',
      columns: ['purple', 'purple', 'red'],
    },
    {
      id: 10,
      name: 'AI-powered Collaboration Tools',
      tooltip: 'Smarter collaboration using AI.',
      columns: ['purple', 'red', 'purple'],
    },
  ],
};
