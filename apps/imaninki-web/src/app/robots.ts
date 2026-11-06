import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/seo';

// Se permite el rastreo de buscadores y de asistentes de IA (GPTBot, ClaudeBot, PerplexityBot…) para que Imaninki pueda aparecer en sus respuestas.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }], sitemap: `${SITIO}/sitemap.xml`, host: SITIO };
}
