# Documentación técnica — FPTecnologi

Sistema de Dashboard/CRM y Rediseño de Webs
`fptecnologi` · `fimavperu` · `kelqa` · `imaninki` · `quamtu`

> Convertido desde `Documentacion_Tecnica_FPTecnologi.docx` para que quede
> versionado y accesible a cualquier agente/IA que trabaje en el repo.

## 1. Resumen del proyecto

La empresa administra 5 marcas/dominios, cada una con web propia en
WordPress y hostings distintos. El proyecto rediseña las 5 webs con
tecnología moderna, unifica el hosting, y suma un dashboard/CRM central para
administrar contenido, inventario y pedidos de todas las marcas, con acceso
por rol.

- fptecnologi.com — prioridad de la primera fase
- fimavperu.com
- kelqa.com
- imaninki.com
- quamtu.com

Rubro: soluciones y dispositivos TI — ecommerce a cliente final (con
stock/inventario) y servicios TI para empresas (B2B).

## 2. Alcance y objetivos

### 2.1 Objetivos

- Migrar las 5 webs de WordPress a código propio, moderno y optimizado.
- Unificar el hosting de las 5 marcas en una sola cuenta (Hostinger).
- Dashboard central escalable, con menú dinámico según la marca
  seleccionada.
- Control de acceso por roles (ej. Marketing solo ve fptecnologi).
- Arquitectura lista para integrar, a futuro, CRM con seguimiento de
  campañas.

### 2.2 Fuera de alcance en esta fase

- Pasarela de pago del ecommerce.
- Facturación electrónica ante SUNAT.
- Logística de envíos interna.

Datos y flujos quedan preparados para integrarlos después sin rediseño.

## 3. Arquitectura general

Los 5 sitios públicos, el dashboard y el futuro portal de cliente consumen
una API central única (NestJS), que centraliza el acceso a una sola base de
datos PostgreSQL (Supabase) con separación lógica por marca.

Toda la autenticación pasa por esta API central (JWT + Refresh Token +
2FA) — no se usa NextAuth ni ningún sistema de login independiente por
sitio. Una misma identidad y los mismos roles sirven para las 5 webs, el
dashboard y el portal de cliente.

**Principio clave**: una sola base de datos y una sola API, con un campo
`marca_id` que identifica la marca dueña de cada registro — inventario
independiente por marca sin infraestructura duplicada, y base lista para
que el futuro CRM cruce información entre marcas.

## 4. Stack tecnológico

- **API central**: NestJS + Prisma + PostgreSQL (Supabase).
- **Dashboard**: Next.js (plantilla Vireo) — autenticación reemplazada por
  la de la API central.
- **Webs públicas**: Next.js + shadcn/ui, sin login para el catálogo (datos
  públicos).
- **Correo transaccional**: Resend.
- **Hosting**: Hostinger (Node.js + VPS reservado a futuro).
- **CDN/DNS/WAF**: Cloudflare.
- **Monitoreo de errores**: Sentry.

(Ver `AGENTS.md` en la raíz del repo para el detalle exacto de versiones
y del stack tal como está implementado hoy.)

## 5. Modelo de datos multi-marca

El permiso y la propiedad de los datos se organizan por **marca**, no por
sitio/dominio — son conceptos distintos:

- **Marca** = la entidad de negocio (dueña de productos, equipo,
  inventario, contenido).
- **Sitio** = el dominio donde se publica (fptecnologi.com, etc.),
  vinculado a una marca.

Estructura: una tabla `marcas` (entidad de negocio) y una tabla `sitios`
(dominio → `marca_id`). Hoy es 1 marca = 1 sitio, pero si una marca
necesitara más de un sitio (ej. una landing de campaña aparte), los
permisos y los datos la siguen automáticamente, porque están atados a
`marca_id` y no al dominio.

Todo lo propio de cada marca lleva `marca_id` — no solo inventario:

- Productos, stock, pedidos y categorías.
- Equipo asignado — cada usuario se vincula a una o varias marcas; ve y
  administra solo las suyas.
- Configuración/branding — logo, colores, datos de contacto, redes
  sociales.
- Contenido propio — páginas, banners, blog/noticias.
- Clientes/leads — pertenecen a la marca que los originó.

El futuro CRM puede cruzar información entre marcas sin depender de bases
de datos distintas.

## 6. Roles y permisos

| Rol | Acceso |
| --- | --- |
| Admin | Acceso completo al sistema y configuración |
| Dirección/Gerencia | Solo lectura, reportes cruzados de las 5 marcas |
| Comercial | Cuentas y ventas B2B (servicios TI para empresas) |
| Ventas | Ventas del ecommerce (cliente final) |
| Marketing | Contenido y campañas, limitado a marca(s) asignada(s) |
| Asesores | Soporte en asesoría/venta de soluciones TI |
| Soporte técnico/Postventa | Incidencias y solicitudes posteriores a la venta |
| Logística/Almacén | Stock e inventario |
| Finanzas/Facturación | Estado de cobros y comprobantes (fase futura) |
| Cliente (portal) | Acceso externo a su propia información (fase futura) |

## 7. Consideraciones de rendimiento

- Índices y paginación por cursor en productos/stock.
- Caché (Redis) para catálogo y consultas frecuentes.
- CDN y optimización de imágenes vía Cloudflare + Next.js Image.
- Búsqueda full-text nativa de PostgreSQL antes de un motor dedicado.

## 8. Fases futuras

No se desarrollan en esta etapa; el modelo de datos y la API quedan listos
para integrarlas sin rediseño:

| Módulo | Detalle |
| --- | --- |
| CRM y campañas | Seguimiento de campañas conectadas a cada marca |
| Pasarela de pago | Culqi, Niubiz, Mercado Pago u otra |
| Facturación electrónica | Proveedor homologado SUNAT (ej. Nubefact) |
| Logística de envíos | Seguimiento de pedidos con couriers |
| Motor de IA propio | Qwen vía Ollama en VPS, como API para CRM/chatbot |

## 9. Costos y planes de servicios

Prioridad: planes gratuitos/económicos en desarrollo, con el punto de
escalado ya identificado.

| Servicio | Plan |
| --- | --- |
| Supabase | Gratis en desarrollo → Pro (USD 25/mes) en producción, por el límite de 500 MB y pausa a los 7 días de inactividad |
| Resend | Gratis (~3,000 correos/mes), suficiente para arrancar |
| Cloudflare | Gratis, sin límite de ancho de banda |
| Sentry | Gratis para el volumen inicial |
| NextAdmin | Gratis para iniciar; Pro desde USD 49 (pago único) si se necesita más |
| Hostinger | Hosting Node.js contratado + VPS reservado a futuro |

## 10. Próximos pasos (del documento original)

1. Iniciar el rediseño de fptecnologi.com como marca prioritaria.
2. Configurar el proyecto base: monorepo, Supabase, API NestJS, Cloudflare,
   GitHub Actions.
3. Desarrollar el dashboard en paralelo, empezando por contenido e
   inventario de fptecnologi.
4. Definir el detalle de migración de contenido desde WordPress, marca por
   marca.

> Estado real de estos pasos: ver la sección "Estado actual / próximos
> pasos" en `AGENTS.md` — no asumir que este documento refleja el avance
> actual, es la foto original del plan.
