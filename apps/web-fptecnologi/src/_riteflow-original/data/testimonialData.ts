export interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  image: string;
  text: string;
}

export const testimonialData: TestimonialItem[] = [
  {
    id: 1,
    name: 'Jenifer Lawrence',
    role: 'CEO & Engineer',
    image: '/images/home/testimonial/testimonial-01.jpg',
    text: 'Riteflow has completely transformed the way we manage projects. The automation features ',
  },
  {
    id: 2,
    name: 'David Thompson',
    role: 'Marketing Director',
    image: '/images/home/testimonial/testimonial-02.jpg',
    text: 'With real-time insights, we make faster, better decisions. Riteflow is now a core part of our daily workflow.',
  },
  {
    id: 3,
    name: 'Sophia Martinez',
    role: 'Product Manager',
    image: '/images/home/testimonial/testimonial-03.jpg',
    text: 'Real-time analytics help us spot issues before they become problems. Riteflow keeps us proactive.',
  },
  {
    id: 4,
    name: 'Jenifer Lawrence',
    role: 'CEO & Engineer',
    image: '/images/home/testimonial/testimonial-04.jpg',
    text: 'Riteflow has completely transformed the way we manage projects. The automation features ',
  },
];

export const testimonialStats = {
  rating: '4.7/5',
  totalReviews: '2300+',
  reviewLink: '#',
  reviewerImages: [
    '/images/home/testimonial/testimonial-01.jpg',
    '/images/home/testimonial/testimonial-02.jpg',
    '/images/home/testimonial/testimonial-03.jpg',
    '/images/home/testimonial/testimonial-04.jpg',
  ],
};
