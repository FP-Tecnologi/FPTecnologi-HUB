export interface TeamMember {
  id: number;
  name: string;
  position: string;
  image: string;
  socialMedia: {
    platform: 'twitter' | 'linkedIn' | 'insta';
    link: string;
  };
}

export interface ResearchItem {
  id: number;
  title: string;
  description: string;
  logo: string;
  link: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Alex Chen',
    position: 'Chief Executive Officer',
    image: '/images/about/team-01.jpg',
    socialMedia: {
      platform: 'twitter',
      link: '#',
    },
  },
  {
    id: 2,
    name: 'Michael Lee',
    position: 'Head of Product',
    image: '/images/about/team-02.jpg',
    socialMedia: {
      platform: 'linkedIn',
      link: '#',
    },
  },
  {
    id: 3,
    name: 'David Green',
    position: 'Senior Software Developer',
    image: '/images/about/team-03.jpg',
    socialMedia: {
      platform: 'insta',
      link: '#',
    },
  },
  {
    id: 4,
    name: 'Sophia Rodriguez',
    position: 'Chief Technology Officer',
    image: '/images/about/team-04.jpg',
    socialMedia: {
      platform: 'insta',
      link: '#',
    },
  },
  {
    id: 5,
    name: 'Priya Sharma',
    position: 'Lead AI Engineer',
    image: '/images/about/team-05.jpg',
    socialMedia: {
      platform: 'twitter',
      link: '#',
    },
  },
  {
    id: 6,
    name: 'Emily Carter',
    position: 'UX/UI Designer',
    image: '/images/about/team-06.jpg',
    socialMedia: {
      platform: 'linkedIn',
      link: '#',
    },
  },
];

export const researchItems: ResearchItem[] = [
  {
    id: 1,
    title: 'Flow-Predict',
    description: 'Predictive workflow analytics',
    logo: '/images/about/research-loog-01.svg',
    link: '#',
  },
  {
    id: 2,
    title: 'Semantic-Link',
    description: 'Unstructured data extraction',
    logo: '/images/about/research-loog-02.svg',
    link: '#',
  },
  {
    id: 3,
    title: 'Cognitive-Agent',
    description: 'Adaptive AI learning',
    logo: '/images/about/research-loog-03.svg',
    link: '#',
  },
  {
    id: 4,
    title: 'Ethical-AI-Audit',
    description: 'Bias detection & mitigation',
    logo: '/images/about/research-loog-04.svg',
    link: '#',
  },
];
