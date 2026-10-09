# Mejoras y pendientes

Lista viva de lo que falta o se puede mejorar. Se marca `[x]` cuando se hace (con fecha). El historial de avance está
en [`ESTADO-ACTUAL.md`](ESTADO-ACTUAL.md); los pendientes de negocio más antiguos en [`PENDIENTES.md`](PENDIENTES.md).

Última revisión completa: **2026-10-05**.

## Hecho

### Seguridad
- [x] Rate limiting de la API (estaba desactivado: login/OTP/reset se podían forzar). Guard propio
      `LimitePeticionesGuard` + `@Limite(n)`: 600 lecturas / 90 escrituras por minuto por IP, 5 en login/OTP/código de
      cuenta, 10 en formularios públicos (2026-10-04)
- [x] `trust proxy` configurable (`TRUST_PROXY`, por defecto 1) para leer la IP real tras el proxy del hosting (2026-10-04)
- [x] `next` de la web 16.3.4 → 16.3.8 (RCE crítico en `next/og`); `npm audit` en 0 en las tres apps (2026-10-04)
- [x] Revisión de secretos versionados: no hay claves reales en git (2026-10-04)
- [x] Recursos de socios y evidencias de tickets en almacén **privado** (`UPLOADS_PRIVADO_DIR`): sin URL pública, se
      entregan solo con sesión (2026-10-05)
- [x] Antivirus: filtro propio siempre activo (ejecutables, EICAR, PDF con JavaScript, macros, ZIP con .exe) y ClamAV
      opcional con `CLAMAV_HOST`; si está configurado y no responde, rechaza (2026-10-05)

### Módulos
- [x] **Tickets** completos: estados (Nuevo, En revisión, Esperando cliente, Resuelto, Cerrado), prioridad,
      responsable, conversación con el cliente, notas internas, historial; seguimiento público
      (`/tickets/seguimiento`, número + correo) donde el cliente responde; correos de confirmación, respuesta y
      resuelto (salen cuando haya SMTP) (2026-10-05)
- [x] **Intranet de socios** (`/socios`): registro público (`/socios/registro`, queda Pendiente), aprobación en el
      dashboard (aprobar, rechazar, suspender, notas, último acceso), portal con Inicio, Recursos, Soporte y Mi empresa;
      entra con código por correo (2026-10-05)
- [x] **Recursos**: subida por lotes (varios archivos, ZIP como pack), contador de descargas, ícono SVG con fondo por
      tipo, filtros por marca del fabricante y tipo (2026-10-05)
- [x] Envíos: tarifas en soles (S/) convertidas a USD con el tipo de cambio del sitio (2026-10-05)

### Base de datos
- [x] Índices: 7 redundantes fuera; (marcaId, estado, createdAt) en pedidos, cotizaciones y presupuestos;
      (usuarioId, leida) en notificaciones; trigram (`pg_trgm`) en nombre/SKU/marca de producto (2026-10-04)

### Datos desde la base (no hardcodeados)
- [x] Menú Tienda con las categorías de la base de datos (2026-10-04)

### Rendimiento y limpieza
- [x] `about.mp4` 4.6 MB → 1.2 MB (720p, sin audio, faststart) (2026-10-04)
- [x] Imágenes grandes a WebP (3.4 MB → 1.5 MB) y recompresión de las referenciadas por la base (2026-10-05)
- [x] Borrado de código muerto (`_riteflow-original`, 9 componentes/hooks), ~26 MB de imágenes sin uso,
      `soluciones-ti.mp4`, `temporal/` y el zip de la raíz (2026-10-05)

- [x] Páginas Alquiler de equipos, FP Education, Compliance y Catálogos editables desde el dashboard; PDF de catálogos
      y documentos reemplazable (2026-10-09)
- [x] Mi cuenta: pestaña de presupuestos y descarga en PDF de cotizaciones (2026-10-09)
- [x] PDF de presupuesto y cotización generado en el servidor y adjunto en los correos; redirecciones 301 de la web anterior;
      WhatsApp en el pie y QUAMTU en el menú; novedades y descuentos para socios (2026-10-09)

## Pendiente

### Correos (bloquea producción)
- [ ] Configurar SMTP (`MAIL_DRIVER=smtp`, `SMTP_HOST/PORT/SECURE/USER/PASS`, `MAIL_FROM_EMAIL`) con un buzón de cPanel,
      o `MAIL_DRIVER=resend` con `RESEND_API_KEY`. Sin esto no salen los códigos de «Mi cuenta» (los socios no pueden
      entrar) ni los avisos de tickets y socios. Definir también `WEB_PUBLICA_URL` (enlaces de los correos)

### Seguridad
- [ ] Instalar ClamAV en el servidor y definir `CLAMAV_HOST` (hoy solo corre el filtro básico)
- [ ] Rate limit en memoria: si la API pasa a varias instancias, moverlo a Redis
- [ ] Cabeceras de seguridad de la web pública (CSP, HSTS) en `next.config` / Cloudflare
- [ ] Las sesiones de «Mi cuenta» se firman con `JWT_ACCESS_SECRET`: separarlas en un secreto propio
- [ ] Rotar las claves antiguas antes de hacer público el repo del HUB
- [ ] `/uploads` (productos, blog, landings) sigue siendo público a propósito: es contenido de la web

### Módulos y funcionalidad
- [ ] Recursos: miniaturas reales de PDF y video generadas en el servidor, logo por marca de fabricante, carpetas
- [ ] Intranet: novedades para socios, precios o descuentos de socios, pedidos y presupuestos del socio
- [ ] Tickets: adjuntos en las respuestas del equipo, SLA (tiempos de respuesta) y reporte de tickets
- [ ] Dashboard: pantalla de **Invitaciones** y gestión de **roles/permisos** (hoy solo desde Team)
- [ ] Envíos Shalom: cargar las tarifas en soles por departamento con la calculadora de shalom.com.pe/tarifas
      (depende del peso/tamaño del paquete tipo: hay que definirlo); corregir tildes rotas de la API viva
      (ver `PENDIENTES.md` §1)
- [ ] Registro de errores (Sentry) y métricas

### Datos hardcodeados → base de datos
- [ ] `PARTNER_BRANDS` (logos de marcas) y `PARTNER_STEPS`: llevarlos al CMS
- [ ] `WHATSAPP_AREAS` (fallback del chat con teléfonos provisionales 999 999 999): cargar asesores reales
- [ ] `SOLUTIONS` y `FEATURED_PRODUCTS` de `content.ts` solo sirven de respaldo; quitarlos cuando la API sea
      obligatoria en producción
- [ ] Textos legales (`lib/legal.ts`) ya tienen CMS (Web → Textos legales): confirmar que producción lo usa

### Rendimiento
- [ ] JavaScript de la web: la home carga ~276 KB gzip (tienda 247, socios 213, tickets 245). Bajar a <200 KB:
      cargar `motion`/`gsap`/`swiper` solo donde se usan y unificar los dos `ParticlesBackground` duplicados
      (`components/home/` y `components/site/`)
- [ ] Compresión automática de videos subidos desde el dashboard (ffmpeg en el servidor)

### Infraestructura
- [ ] Cloudflare (5 dominios), Hostinger (entornos), Sentry
- [ ] GitHub Actions (delegado a Copilot)
