export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  image: string;
  size: 'lg' | 'md' | 'sm';
}

export const featuresData: FeatureItem[] = [
  {
    id: 1,
    title: 'Automated Customer Interactions',
    description:
      "Enhance your customer support with AI-driven chatbots and virtual assistants. RiteFlow helps you automate interactions, provide instant replies, and improve response time.",
    image: '/images/home-v2/why-chose-01.png',
    size: 'lg',
  },
  {
    id: 2,
    title: 'Notifications Engine',
    description:
      "Deliver tailored experiences to your users with RiteFlow's recommendation engine. By analyzing user preferences and past behavior, the AI generates personalized product.",
    image: '/images/home-v2/why-chose-02.png',
    size: 'md',
  },
  {
    id: 3,
    title: 'Integrated Solutions',
    description:
      'RiteFlow integrates effortlessly with your existing tools, adapting AI-driven automation to enhance your processes.',
    image: '/images/home-v2/why-chose-03.png',
    size: 'sm',
  },
  {
    id: 4,
    title: 'Collaboration with AI',
    description:
      "Our AI doesn't replace your creativity — it amplifies it. Collaborate with ease, automate routine tasks, and keep full.",
    image: '/images/home-v2/why-chose-04.png',
    size: 'sm',
  },
  {
    id: 5,
    title: 'Smart Workflow Schedule',
    description:
      "Optimize your business operations by automating repetitive tasks and workflows. RiteFlow's AI-driven tools streamline everything from task management to email.",
    image: '/images/home-v2/why-chose-05.png',
    size: 'md',
  },
];
