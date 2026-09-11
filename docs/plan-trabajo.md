# Plan de trabajo — FPTecnologi

Cronograma de desarrollo por fases — Sistema de Dashboard/CRM y rediseño de
webs.

> Convertido desde `Plan_Trabajo_FPTecnologi.docx` para que quede
> versionado y accesible a cualquier agente/IA que trabaje en el repo.
> **Las fechas son estimadas** (plan original: 1 developer, dedicación
> completa, inicio 7 sep 2026) — no tratarlas como compromiso fijo; lo que
> importa para el trabajo día a día es el orden de las fases y qué incluye
> cada una. El estado real de avance vive en `AGENTS.md`, no en este
> documento.

Fases futuras (CRM, pagos, facturación SUNAT, logística) no están
incluidas en este cronograma — inician después.

## Tabla resumen de fases

| Fase | Duración estimada |
| --- | --- |
| 0 — Planificación y setup | 2 semanas |
| 1 — Backend / API central | 4 semanas |
| 2 — fptecnologi.com (web pública) | 4 semanas |
| 3 — Dashboard (núcleo) | 4 semanas |
| 4 — QA y lanzamiento fptecnologi | 1.5 semanas |
| 5 — Réplica 4 marcas restantes | 8 semanas (~2 por marca) |
| 6 — Multi-marca + pulido | 2 semanas |
| 7 — QA integral y lanzamiento general | 2 semanas |

Nota del plan original: si más adelante se suma un segundo developer, las
fases 5 (réplica de marcas) y 7 (QA integral) son las que más se pueden
paralelizar y acortar.

## Fase 0 — Planificación y setup

Dejar lista la base técnica y organizativa antes de escribir código de
producto.

- Confirmar el alcance final de la fase 1 (funcionalidades mínimas de
  fptecnologi y del dashboard core).
- Crear el monorepo (estructura de carpetas, configuración compartida) y
  los repositorios en GitHub.
- Configurar ramas de trabajo (main/develop/feature) y flujo de GitHub
  Actions (build, lint, tests).
- Levantar el proyecto en Supabase y definir el esquema inicial en Prisma:
  marcas, sitios, usuarios, roles.
- Configurar Cloudflare para los 5 dominios (DNS, WAF, CDN).
- Configurar el hosting en Hostinger y los entornos (desarrollo, staging,
  producción).
- Crear cuentas/proyectos de los servicios: Resend, Sentry.

**Entregable**: repositorio, entornos y servicios base configurados;
esquema de base de datos inicial listo para empezar a desarrollar.

## Fase 1 — Backend / API central

Construir la API en NestJS que va a sostener las 5 webs, el dashboard y,
más adelante, el portal de cliente.

- Módulo de autenticación: JWT + Refresh Token, verificación en 2 pasos
  por código OTP vía correo.
- Módulo de roles y permisos, con asignación de usuarios a una o varias
  marcas.
- Módulo de marcas y sitios (estructura `marca_id` / sitios).
- Módulo de productos, stock, pedidos y categorías, con separación por
  marca.
- Integración de correo transaccional (Resend) y configuración de SMTP
  corporativo.
- Documentación de la API con Swagger/OpenAPI.
- Pruebas unitarias del núcleo (autenticación y permisos primero, por ser
  lo más sensible).

**Entregable**: API central funcional y documentada, con autenticación,
roles y los módulos de datos base listos para conectar frontend.

## Fase 2 — fptecnologi.com (web prioritaria)

Lanzar la primera de las 5 marcas, ya conectada a la API central, como
validación de todo el stack.

- Maquetación en Next.js + shadcn/ui: home, catálogo, ficha de producto,
  carrito, contacto.
- Sección de servicios TI para empresas (B2B).
- Conexión de catálogo/inventario a la API (datos reales, no mockeados).
- SEO base: metadata, sitemap, alta en Google Search Console.
- Migración de contenido existente desde WordPress (textos, imágenes,
  productos).

**Entregable**: fptecnologi.com funcional en staging, con catálogo real
conectado a la API y contenido migrado.

## Fase 3 — Dashboard administrativo (núcleo)

Dar al equipo una herramienta funcional para administrar fptecnologi desde
el dashboard, con la base ya lista para sumar las otras 4 marcas después.

- Login, selector de marca activa y visibilidad de menú según el rol del
  usuario.
- Gestión de productos e inventario (para fptecnologi).
- Gestión de usuarios y roles.
- Centro de notificaciones internas.
- Visualizador de catálogos/PDFs en formato flipbook.

**Entregable**: dashboard usable en staging: el equipo puede administrar
el catálogo de fptecnologi y gestionar usuarios/roles.

## Fase 4 — QA y lanzamiento de fptecnologi

Cerrar el primer ciclo completo (web + dashboard de una marca) y salir a
producción.

- Pruebas funcionales de principio a fin: catálogo, carrito, dashboard,
  roles.
- Pruebas de responsive y cross-browser.
- Verificar que Sentry, Cloudflare y los backups de base de datos estén
  activos.
- Despliegue a producción y corte de DNS de fptecnologi.com.
- Monitoreo activo la primera semana post-lanzamiento.

**Entregable**: fptecnologi.com y su dashboard en producción, estables y
monitoreados.

## Fase 5 — Réplica a las 4 marcas restantes

Replicar el mismo patrón en fimavperu, kelqa, imaninki y quamtu. Al no
tener que reconstruir backend ni dashboard, cada marca es considerablemente
más rápida que la primera.

- Por cada marca: maquetación con su propio branding (logo, colores,
  contenido) sobre la misma base de componentes.
- Conexión de su catálogo/inventario propio a la API (ya existente).
- Migración de contenido desde su WordPress actual.
- SEO base y alta en Search Console de cada dominio.

Orden sugerido: fimavperu → kelqa → imaninki → quamtu (ajustable según
prioridad comercial).

**Entregable**: las 5 marcas con su web propia en producción, todas
conectadas a la misma API y al mismo dashboard.

## Fase 6 — Multi-marca en el dashboard + pulido

Verificar que el dashboard funcione correctamente ahora que administra las
5 marcas a la vez, no solo una.

- Probar que los roles/permisos filtren correctamente al cruzar las 5
  marcas (ej. Marketing limitado a su marca asignada).
- Reportes cruzados para Dirección/Gerencia (vista de las 5 marcas a la
  vez).
- Ajustes de rendimiento si el volumen de datos combinado lo requiere
  (índices, caché).
- Revisión general de UI/UX del dashboard con datos reales de las 5
  marcas.

**Entregable**: dashboard validado operando con las 5 marcas
simultáneamente, con reportes cruzados funcionando.

## Fase 7 — QA integral, hardening y lanzamiento general

Cierre general del proyecto: validar todo el sistema como un conjunto
antes de darlo por completado.

- Regresión completa sobre las 5 webs y el dashboard.
- Prueba de carga, pensando en el volumen de inventario por marca.
- Revisión de seguridad: 2FA, permisos por rol, backups, cabeceras de
  Cloudflare.
- Documentación técnica de entrega y checklist de mantenimiento.

**Entregable**: proyecto completo en producción, documentado y estable.
Punto de partida para las fases futuras (CRM, pagos, facturación,
logística).
