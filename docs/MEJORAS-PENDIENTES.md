# Mejoras y pendientes

Lista viva de lo que falta o se puede mejorar. Se marca `[x]` cuando se hace (con fecha). El historial de avance está
en [`ESTADO-ACTUAL.md`](ESTADO-ACTUAL.md); los pendientes de negocio más antiguos en [`PENDIENTES.md`](PENDIENTES.md).

Última revisión completa: **2026-10-04**.

## Hecho

### Seguridad
- [x] Rate limiting de la API (estaba desactivado: login/OTP/reset se podían forzar). Guard propio
      `LimitePeticionesGuard` + `@Limite(n)`: 600 lecturas / 90 escrituras por minuto por IP, 5 en login/OTP/código de
      cuenta, 10 en formularios públicos (2026-10-04)
- [x] `trust proxy` configurable (`TRUST_PROXY`, por defecto 1) para que la IP del cliente sea la real tras el proxy
      del hosting (2026-10-04)
- [x] `next` de la web 16.3.4 → 16.3.8 (RCE crítico en `next/og`); `npm audit` en 0 en las tres apps (2026-10-04)
- [x] Revisión de secretos versionados: no hay claves reales en git (2026-10-04)

### Módulos nuevos
- [x] **Tickets** (API `tickets`, web `/tickets` conectado, dashboard Web → Tickets): reclamo, verificación y soporte
      con datos de la compra, evidencia, estados y notas; correlativo `TCK-AAAA-XXXXXX` (2026-10-04)
- [x] **Recursos para socios** (API `recursos`, dashboard Web → Recursos con pestañas Recursos y Socios, web
      `/recursos`): el equipo sube imágenes, PDF, video, Office y ZIP (hasta 100 MB, tipo validado por bytes);
      los socios (correos autorizados) entran con el código por correo de «Mi cuenta» (2026-10-04)

### Base de datos
- [x] Índices: se quitaron 7 redundantes y se agregaron (marcaId, estado, createdAt) en pedidos, cotizaciones y
      presupuestos, (usuarioId, leida) en notificaciones y trigram (`pg_trgm`) en nombre/SKU/marca de producto
      para la búsqueda de la tienda (2026-10-04)

### Datos desde la base (no hardcodeados)
- [x] Menú Tienda con las categorías de la base de datos (antes lista fija en `content.ts`) (2026-10-04)

### Rendimiento
- [x] `about.mp4` (hero y Nosotros) 4.6 MB → 1.2 MB (720p, sin audio, faststart) (2026-10-04)

## Pendiente

### Limpieza (requiere tu visto bueno: borra archivos)
- [ ] `apps/web-fptecnologi/src/_riteflow-original` (plantilla muerta, 110 archivos; nada la importa) y el alias
      `@riteflow` de `tsconfig.json`
- [ ] Componentes/hooks sin importadores: `home/HeaderDark`, `home/TopBar`, `site/HeaderDark`, `site/HeroTabs`,
      `site/PartnerSteps`, `site/PlaceholderPage`, `site/TopBar`, `hooks/useRiteflowReveal`, `hooks/useRiteflowStagger`
- [ ] ~26 MB de imágenes sin referencias: `public/Home-new - FP Tecnologi System` (178 archivos), `images/modelo12`,
      `images/demo`, `images/features`, `images/home-v2`, `public/graph.html`, `images/pricing.jpg`,
      `images/home/banner-bg.jpg`, `images/home/home-v1-banner.webp`, `images/home/banner-circles-shape.png`
- [ ] `public/videos/soluciones-ti.mp4` (6.6 MB, ya nadie lo usa; el hero usa `about.mp4`)
- [ ] `temporal/` (modelos de home archivados), `api-fptecnologi.zip` de la raíz (se regenera con `git archive`)

### Seguridad
- [ ] Rate limit en memoria: si la API pasa a varias instancias, moverlo a Redis
- [ ] Los archivos de `/uploads` son públicos por URL (UUID impredecible). Si algún recurso de socios es sensible,
      servirlo con URL firmada o tras el guard de socio
- [ ] Antivirus/escaneo de los archivos que sube el equipo (hoy solo se valida el tipo por bytes)
- [ ] Rotar las claves antiguas antes de hacer público el repo del HUB

### Módulos y funcionalidad
- [ ] Recursos: contador de descargas, miniaturas de PDF/video generadas en el servidor, carpetas por marca de
      fabricante con logo, subida por lotes
- [ ] Socios: decidir alta automática (RUC) o por aprobación; hoy los agrega el equipo a mano
- [ ] Tickets: correo de confirmación al cliente con su número y consulta de estado en «Mi cuenta»; respuestas del
      equipo con historial
- [ ] Dashboard: pantalla de **Invitaciones** y gestión de **roles/permisos** (hoy solo desde Team)
- [ ] Envíos Shalom: cargar tarifas reales; corregir tildes rotas de la API viva (ver `PENDIENTES.md` §1)
- [ ] Registro de errores (Sentry) y métricas

### Datos hardcodeados → base de datos
- [ ] `PARTNER_BRANDS` (logos de marcas) y `PARTNER_STEPS`: llevarlos al CMS/Recursos
- [ ] `WHATSAPP_AREAS` (fallback del chat con teléfonos provisionales 999 999 999): cargar asesores reales
- [ ] `SOLUTIONS` y `FEATURED_PRODUCTS` de `content.ts` solo sirven de respaldo; quitarlos cuando la API sea
      obligatoria en producción
- [ ] Textos legales (`lib/legal.ts`) ya tienen CMS (Web → Textos legales): confirmar que producción lo usa

### Rendimiento
- [ ] Imágenes: pasar JPG/PNG grandes de `public/herobanner` (2.4 MB en total) a WebP/AVIF
- [ ] Compresión automática de videos subidos desde el dashboard (ffmpeg en el servidor)
- [ ] `apps/web-fptecnologi`: revisar el peso de JS de la home (`next build` + analyzer)

### Infraestructura
- [ ] Cloudflare (5 dominios), Hostinger (entornos), Sentry, `RESEND_API_KEY` real
- [ ] GitHub Actions (delegado a Copilot)
