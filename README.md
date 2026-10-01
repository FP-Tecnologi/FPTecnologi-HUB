# FPTecnologi HUB

Sistema web de **FPTecnologi & System**: sitio público con tienda, blog y landing pages, dashboard de administración y una
API central multi-marca.

| Carpeta | Qué es |
| --- | --- |
| [`apps/api`](apps/api) | API NestJS + Prisma (PostgreSQL / Supabase): usuarios, pedidos, cotizaciones, landings, envíos, subida de imágenes |
| [`apps/web`](apps/web) | Dashboard de administración (Next.js) |
| [`apps/web-fptecnologi`](apps/web-fptecnologi) | Sitio público (Next.js): web, tienda, blog, cotizador y landings `/l/<url>` |
| [`docs/DESPLIEGUE-CPANEL.md`](docs/DESPLIEGUE-CPANEL.md) | **Guía para publicarlo en cPanel como aplicaciones Node.js** |

Cada app es un proyecto npm independiente (`cd apps/<app> && npm ci`). Copia el `.env.example` de cada una a `.env` / `.env.local`
y completa los valores; las credenciales reales **no** van en el repositorio.

```bash
# desarrollo
cd apps/api && npm ci && npx prisma generate && npm run start:dev          # http://localhost:3001
cd apps/web && npm ci && npm run dev                                       # http://localhost:3000
cd apps/web-fptecnologi && npm ci && npm run dev -- --port 3002            # http://localhost:3002
```
