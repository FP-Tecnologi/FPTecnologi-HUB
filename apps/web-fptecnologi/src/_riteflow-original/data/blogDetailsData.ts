/**
 * Blog Details Data
 * 
 * Contains detailed content for each blog post including article content,
 * author information, and related posts.
 */

import { BlogPost, blogData as allBlogData } from './blogData';

/**
 * Author Information
 */
export interface BlogAuthor {
  name: string;
  role: string;
  image: string;
}

/**
 * Article Content Block
 * 
 * Supported content types:
 * - 'heading': Headings (h1-h6) with level property
 * - 'paragraph': Text paragraphs
 * - 'list': Ordered or unordered lists (use ordered: true/false)
 * - 'image': Images with optional caption
 * - 'blockquote': Quote blocks
 * - 'video': Local video files (MP4, WebM, etc.)
 * - 'youtube': YouTube video embeds (use videoId from YouTube URL)
 * - 'vimeo': Vimeo video embeds (use videoId from Vimeo URL)
 * - 'audio': Audio files (MP3, WAV, etc.)
 * - 'code': Code blocks with optional language
 * - 'link': Clickable links with URL, text, and optional target
 * 
 * Examples:
 * 
 * YouTube: { type: 'youtube', youtube: { videoId: 'dQw4w9WgXcQ', autoplay: false } }
 * Vimeo: { type: 'vimeo', vimeo: { videoId: '123456789', autoplay: false } }
 * Audio: { type: 'audio', audio: { src: '/audio/sample.mp3', title: 'Sample Audio' } }
 * Ordered List: { type: 'list', ordered: true, items: ['Item 1', 'Item 2'] }
 * Link: { type: 'link', link: { href: 'https://example.com', text: 'Click here', target: '_blank' } }
 */
export interface BlogContent {
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'blockquote' | 'video' | 'code' | 'audio' | 'youtube' | 'vimeo' | 'link';
  content?: string; // For heading, paragraph, blockquote
  level?: 1 | 2 | 3 | 4 | 5 | 6; // For headings
  items?: string[]; // For lists
  ordered?: boolean; // For lists - true for ordered list (ol), false/default for unordered (ul)
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
  video?: {
    src: string; // Local video file path
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean; // Show video controls
    poster?: string; // Preview image
  };
  youtube?: {
    videoId: string; // YouTube video ID (from URL: https://www.youtube.com/watch?v=VIDEO_ID)
    title?: string; // Optional title for iframe
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
  };
  vimeo?: {
    videoId: string; // Vimeo video ID (from URL: https://vimeo.com/VIDEO_ID)
    title?: string; // Optional title for iframe
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
  };
  audio?: {
    src: string; // Audio file path or URL
    title?: string; // Optional title
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean; // Show audio controls (default: true)
  };
  code?: string; // For code blocks
  language?: string; // For code blocks - programming language (optional)
  link?: {
    href: string; // Link URL
    text: string; // Link text
    target?: '_blank' | '_self'; // Link target (default: '_self')
    rel?: string; // Link rel attribute (e.g., 'noopener noreferrer')
  };
}

/**
 * Blog Details with Full Content
 */
export interface BlogDetails extends BlogPost {
  author: BlogAuthor;
  bannerImage: {
    src: string;
    alt: string;
  };
  content: BlogContent[];
  relatedPosts?: string[]; // Array of blog slugs
}

/**
 * Blog Details Data
 * Each blog has its own unique detailed content
 */
export const blogDetailsData: Record<string, BlogDetails> = {
  'how-ai-is-transforming': {
    id: '1',
    slug: 'how-ai-is-transforming',
    title: 'How AI Is Transforming the Future of Work',
    description:
      'Artificial Intelligence is no longer just a concept it\'s a revolution changing how we work, create, and connect. From automation to decision-making, AI is shaping a smarter, faster, and more efficient world.',
    category: 'Automation',
    image: {
      src: '/images/blog/blog-01.png',
      alt: 'blog thumb',
    },
    href: '/blog/how-ai-is-transforming',
    author: {
      name: 'Marvin McKinney',
      role: 'Content Writer',
      image: '/images/about/team-01.jpg',
    },
    bannerImage: {
      src: '/images/blog/blog-details.jpg',
      alt: 'blog details image',
    },

    content: [
      {
        type: 'heading',
        level: 1,
        content: 'Heading 1',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Heading 2',
      },
      {
        type: 'heading',
        level: 3,
        content: 'Heading 3',
      },
      {
        type: 'heading',
        level: 4,
        content: 'Heading 4',
      },
      {
        type: 'heading',
        level: 5,
        content: 'Heading 5',
      },
      {
        type: 'heading',
        level: 6,
        content: 'Heading 6',
      },
      {
        type: 'paragraph',
        content:
          'Quality Construction: The Backbone of Longevity High-quality construction ensures that buildings are not only visually appealing but also durable and safe for occupants. By prioritizing craftsmanship and using premium materials, construction companies can create structures that stand the test of time. This approach minimizes future maintenance costs and enhances property value.',
      },
      {
        type: 'paragraph',
        content: '<b>Unordered List</b>',
      },
      {
        type: 'list',
        ordered: false, // Unordered list (default)
        items: [
          'Time Efficiency: Automate repetitive processes and focus on strategy.',
          'Accuracy: Minimize human error through data-driven decisions.',
          'Scalability: Manage large workloads without sacrificing quality.',
          'Innovation: Free your team to think creatively and explore new ideas.',
          'Personalization: Deliver tailored solutions for every client or user.',
        ],
      },
      {
        type: 'paragraph',
        content: '<b>Ordered List</b>',
      },
      {
        type: 'list',
        ordered: true, // Ordered list
        items: [
          'Time Efficiency: Automate repetitive processes and focus on strategy.',
          'Accuracy: Minimize human error through data-driven decisions.',
          'Scalability: Manage large workloads without sacrificing quality.',
          'Innovation: Free your team to think creatively and explore new ideas.',
          'Personalization: Deliver tailored solutions for every client or user.',
        ],
      },
      {
        type: 'paragraph',
        content: 'H<sub>2</sub>O H<sub>2</sub>SO<sub>4</sub>',
      },
      {
        type: 'paragraph',
        content: 'A<sup>2</sup>B<sup>2</sup>',
      },
      {
        type: 'link',
        link: {
          href: 'https://example.com',
          text: 'Text Link',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      },
      {
        type: 'image',
        image: {
          src: '/images/blog/blog-details.jpg',
          alt: 'blog details',
          caption: 'Full Width Image',
        },
      },
      {
        type: 'blockquote',
        content:
          'Green building practices not only reduce environmental impact but also contribute to healthier living spaces. Green building practices not only reduce environmental impact but also contribute to healthier',
      },
      {
        type: 'video',
        video: {
          src: '/images/home/about.mp4',
          autoplay: true,
          loop: true,
          muted: true,
          controls: true, // Show video controls
          poster: '/images/blog/blog-details.jpg', // Optional preview image
        },
      },
      {
        type: 'paragraph',
        content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
      },
      {
        type: 'audio',
        audio: {
          src: '/images/water-fountain-healing.mp3', 
          title: 'Water Fountain Healing',
          autoplay: false,
          loop: false,
          controls: true, // Should be true to allow playback
        },
      },
      {
        type: 'code',
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
      {
        type: 'paragraph',
        content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
      },
    ],
    relatedPosts: ['from-data-to-decisions', 'creative-thinking-meets-ai', 'rise-of-no-code-ai-platforms'],
  },
  'from-data-to-decisions': {
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
    author: {
      name: 'Marvin McKinney',
      role: 'Content Writer',
      image: '/images/about/team-01.jpg',
    },
    bannerImage: {
      src: '/images/blog/blog-details.jpg',
      alt: 'blog details image',
    },
    content: [
      {
        type: 'paragraph',
        content:
          'In today\'s fast-paced business environment, the ability to transform raw data into actionable insights is crucial. Smart automation tools are revolutionizing how organizations make decisions, enabling teams to work more efficiently and effectively. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
      },
      {
        type: 'heading',
        level: 4,
        content: 'Where does it come from?',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
      },
      {
        type: 'heading',
        level: 5,
        content: 'Key Benefits of Smart Automation',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'blockquote',
        content:
          'Green building practices not only reduce environmental impact but also contribute to healthier living spaces. Green building practices not only reduce environmental impact but also contribute to healthier',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ]
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'image',
        image: {
          src: '/images/about/banner-thumb.jpg',
          alt: 'blog details',
          caption: 'Full Width Image',
        },
      },
      {
        type: 'heading',
        level: 5,
        content: 'Designing the Perfect User Interface',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
    ],
    relatedPosts: ['how-ai-is-transforming', 'rise-of-no-code-ai-platforms', 'creative-thinking-meets-ai'],
  },
  'creative-thinking-meets-ai': {
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
    author: {
      name: 'Marvin McKinney',
      role: 'Content Writer',
      image: '/images/about/team-01.jpg',
    },
    bannerImage: {
      src: '/images/blog/blog-details.jpg',
      alt: 'blog details image',
    },
    content: [
      {
        type: 'paragraph',
        content:
          'In today\'s fast-paced business environment, the ability to transform raw data into actionable insights is crucial. Smart automation tools are revolutionizing how organizations make decisions, enabling teams to work more efficiently and effectively. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
      },
      {
        type: 'heading',
        level: 4,
        content: 'Where does it come from?',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
      },
      {
        type: 'heading',
        level: 5,
        content: 'Key Benefits of Smart Automation',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'blockquote',
        content:
          'Green building practices not only reduce environmental impact but also contribute to healthier living spaces. Green building practices not only reduce environmental impact but also contribute to healthier',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ]
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'image',
        image: {
          src: '/images/about/banner-thumb.jpg',
          alt: 'blog details',
          caption: 'Full Width Image',
        },
      },
      {
        type: 'heading',
        level: 5,
        content: 'Designing the Perfect User Interface',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
    ],
    relatedPosts: ['how-ai-is-transforming', 'ai-personalization-boosts-customer-experience', 'building-future-ai-works-for-everyone'],
  },
  'rise-of-no-code-ai-platforms': {
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
    author: {
      name: 'Marvin McKinney',
      role: 'Content Writer',
      image: '/images/about/team-01.jpg',
    },
    bannerImage: {
      src: '/images/blog/blog-details.jpg',
      alt: 'blog details image',
    },
    content: [
      {
        type: 'paragraph',
        content:
          'In today\'s fast-paced business environment, the ability to transform raw data into actionable insights is crucial. Smart automation tools are revolutionizing how organizations make decisions, enabling teams to work more efficiently and effectively. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
      },
      {
        type: 'heading',
        level: 4,
        content: 'Where does it come from?',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
      },
      {
        type: 'heading',
        level: 5,
        content: 'Key Benefits of Smart Automation',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'blockquote',
        content:
          'Green building practices not only reduce environmental impact but also contribute to healthier living spaces. Green building practices not only reduce environmental impact but also contribute to healthier',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ]
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'image',
        image: {
          src: '/images/about/banner-thumb.jpg',
          alt: 'blog details',
          caption: 'Full Width Image',
        },
      },
      {
        type: 'heading',
        level: 5,
        content: 'Designing the Perfect User Interface',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
    ],
    relatedPosts: ['from-data-to-decisions', 'building-future-ai-works-for-everyone', 'ai-personalization-boosts-customer-experience'],
  },
  'ai-personalization-boosts-customer-experience': {
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
    author: {
      name: 'Marvin McKinney',
      role: 'Content Writer',
      image: '/images/about/team-01.jpg',
    },
    bannerImage: {
      src: '/images/blog/blog-details.jpg',
      alt: 'blog details image',
    },
    content: [
      {
        type: 'paragraph',
        content:
          'In today\'s fast-paced business environment, the ability to transform raw data into actionable insights is crucial. Smart automation tools are revolutionizing how organizations make decisions, enabling teams to work more efficiently and effectively. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
      },
      {
        type: 'heading',
        level: 4,
        content: 'Where does it come from?',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
      },
      {
        type: 'heading',
        level: 5,
        content: 'Key Benefits of Smart Automation',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'blockquote',
        content:
          'Green building practices not only reduce environmental impact but also contribute to healthier living spaces. Green building practices not only reduce environmental impact but also contribute to healthier',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ]
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'image',
        image: {
          src: '/images/about/banner-thumb.jpg',
          alt: 'blog details',
          caption: 'Full Width Image',
        },
      },
      {
        type: 'heading',
        level: 5,
        content: 'Designing the Perfect User Interface',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
    ],
    relatedPosts: ['creative-thinking-meets-ai', 'rise-of-no-code-ai-platforms', 'how-ai-is-transforming'],
  },
  'building-future-ai-works-for-everyone': {
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
    author: {
      name: 'Marvin McKinney',
      role: 'Content Writer',
      image: '/images/about/team-01.jpg',
    },
    bannerImage: {
      src: '/images/blog/blog-details.jpg',
      alt: 'blog details image',
    },
    content: [
      {
        type: 'paragraph',
        content:
          'In today\'s fast-paced business environment, the ability to transform raw data into actionable insights is crucial. Smart automation tools are revolutionizing how organizations make decisions, enabling teams to work more efficiently and effectively. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
      },
      {
        type: 'heading',
        level: 4,
        content: 'Where does it come from?',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
      },
      {
        type: 'heading',
        level: 5,
        content: 'Key Benefits of Smart Automation',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'blockquote',
        content:
          'Green building practices not only reduce environmental impact but also contribute to healthier living spaces. Green building practices not only reduce environmental impact but also contribute to healthier',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ]
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
      {
        type: 'image',
        image: {
          src: '/images/about/banner-thumb.jpg',
          alt: 'blog details',
          caption: 'Full Width Image',
        },
      },
      {
        type: 'heading',
        level: 5,
        content: 'Designing the Perfect User Interface',
      },
      {
        type: 'list',
        items: [
          'Real-time data processing and analysis',
          'Automated decision-making workflows',
          'Reduced manual errors and increased accuracy',
          'Scalable solutions that grow with your business',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled.',
      },
    ],
    relatedPosts: ['rise-of-no-code-ai-platforms', 'ai-personalization-boosts-customer-experience', 'from-data-to-decisions'],
  },
};

/**
 * Get blog details by slug
 */
export function getBlogDetails(slug: string): BlogDetails | undefined {
  return blogDetailsData[slug];
}

/**
 * Get related blog posts
 */
export function getRelatedBlogs(slugs: string[]): BlogPost[] {
  return allBlogData.filter((blog) => slugs.includes(blog.slug));
}
