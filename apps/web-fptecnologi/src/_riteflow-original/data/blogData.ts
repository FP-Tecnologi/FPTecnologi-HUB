/**
 * Blog Post Data
 * 
 * Contains all blog post information including title, description, category, image, etc.
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image: {
    src: string;
    alt: string;
  };
  href: string;
}

/**
 * Blog Posts Data
 * Array of all blog posts
 */
export const blogData: BlogPost[] = [
  {
    id: '1',
    slug: 'how-ai-is-transforming',
    title: 'How AI Is Transforming the Future of Work',
    description:
      'The future of work is here. Learn how humans and AI can collaborate to unlock creativity, productivity, and smarter.',
    category: 'Automation',
    image: {
      src: '/images/blog/blog-01.png',
      alt: 'blog thumb',
    },
    href: '/blog/how-ai-is-transforming',
  },
  {
    id: '2',
    slug: 'from-data-to-decisions',
    title: 'From Data to Decisions: Smarter Automation',
    description:
      'These AI tools are changing how teams work, communication, and innovate. Find out which one can elevate business.',
    category: 'Productivity',
    image: {
      src: '/images/blog/blog-02.png',
      alt: 'blog thumb',
    },
    href: '/blog/from-data-to-decisions',
  },
  {
    id: '3',
    slug: 'creative-thinking-meets-ai',
    title: 'Creative Thinking Meets Artificial Intelligence',
    description:
      'AI must be built with ethics and transparency. Explore why responsible development ensures fair, safe.',
    category: 'AI in Business',
    image: {
      src: '/images/blog/blog-03.png',
      alt: 'blog thumb',
    },
    href: '/blog/creative-thinking-meets-ai',
  },
  {
    id: '4',
    slug: 'rise-of-no-code-ai-platforms',
    title: 'The Rise of No-Code AI Platforms in 2025',
    description:
      "Data alone isn't enough - it's the intelligence behind it that drives action. Here's how AI turns raw data.",
    category: 'Innovation',
    image: {
      src: '/images/blog/blog-04.png',
      alt: 'blog thumb',
    },
    href: '/blog/rise-of-no-code-ai-platforms',
  },
  {
    id: '5',
    slug: 'ai-personalization-boosts-customer-experience',
    title: 'How AI Personalization Boosts Customer Experience',
    description:
      'Creativity and AI can coexist beautifully. See how intelligent tools are inspiring new art, design, and content across.',
    category: 'AI Tools & Apps',
    image: {
      src: '/images/blog/blog-05.png',
      alt: 'blog thumb',
    },
    href: '/blog/ai-personalization-boosts-customer-experience',
  },
  {
    id: '6',
    slug: 'building-future-ai-works-for-everyone',
    title: 'Building a Future Where AI Works for Everyone',
    description:
      'No-code AI is making complex technology accessible to everyone. Learn how startups and creators.',
    category: 'Future of Work',
    image: {
      src: '/images/blog/blog-06.png',
      alt: 'blog thumb',
    },
    href: '/blog/building-future-ai-works-for-everyone',
  },
  {
    id: '7',
    slug: 'streamline-workflows-with-intelligent-automation',
    title: 'Streamline Workflows with Intelligent Automation',
    description:
      'Discover how AI-powered automation can eliminate repetitive tasks and free up your team to focus on strategic initiatives.',
    category: 'Automation',
    image: {
      src: '/images/blog/blog-06.png',
      alt: 'blog thumb',
    },
    href: '/blog/streamline-workflows-with-intelligent-automation',
  },
  {
    id: '8',
    slug: 'ai-driven-insights-transform-business-strategy',
    title: 'AI-Driven Insights That Transform Business Strategy',
    description:
      'Unlock the power of machine learning to analyze patterns, predict trends, and make data-driven decisions faster than ever.',
    category: 'AI in Business',
    image: {
      src: '/images/blog/blog-06.png',
      alt: 'blog thumb',
    },
    href: '/blog/ai-driven-insights-transform-business-strategy',
  },
  {
    id: '9',
    slug: 'collaborative-ai-enhances-team-productivity',
    title: 'How Collaborative AI Enhances Team Productivity',
    description:
      'Explore real-world examples of teams using AI assistants to improve communication, streamline projects, and boost efficiency.',
    category: 'Productivity',
    image: {
      src: '/images/blog/blog-06.png',
      alt: 'blog thumb',
    },
    href: '/blog/collaborative-ai-enhances-team-productivity',
  },
  {
    id: '10',
    slug: 'next-generation-ai-tools-for-creators',
    title: 'Next-Generation AI Tools for Modern Creators',
    description:
      'From content generation to design assistance, see how cutting-edge AI tools are revolutionizing creative workflows.',
    category: 'AI Tools & Apps',
    image: {
      src: '/images/blog/blog-06.png',
      alt: 'blog thumb',
    },
    href: '/blog/next-generation-ai-tools-for-creators',
  },
  {
    id: '11',
    slug: 'ethical-ai-practices-for-responsible-innovation',
    title: 'Ethical AI Practices for Responsible Innovation',
    description:
      'Learn about the importance of building AI systems with fairness, transparency, and accountability at their core.',
    category: 'Innovation',
    image: {
      src: '/images/blog/blog-06.png',
      alt: 'blog thumb',
    },
    href: '/blog/ethical-ai-practices-for-responsible-innovation',
  },
  {
    id: '12',
    slug: 'scaling-business-with-smart-automation-solutions',
    title: 'Scaling Your Business with Smart Automation Solutions',
    description:
      'Find out how growing companies leverage AI automation to handle increased workload without proportional cost increases.',
    category: 'Future of Work',
    image: {
      src: '/images/blog/blog-06.png',
      alt: 'blog thumb',
    },
    href: '/blog/scaling-business-with-smart-automation-solutions',
  },
];
