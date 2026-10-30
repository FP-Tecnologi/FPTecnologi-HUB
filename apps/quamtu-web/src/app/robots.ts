import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/seo';

// Se permite el rastreo de buscadores y de asistentes de IA (GPTBot, ClaudeBot, PerplexityBot…); solo se excluye lo privado o interno.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/carrito', '/tickets/seguimiento', '/propuestas/'] }], sitemap: `${SITIO}/sitemap.xml`, host: SITIO };
}
