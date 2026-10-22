# Asistente IA completo (web FPTecnologi + asistente del administrador) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Pedido del usuario (2026-10-22):** mejorar el RAG para que el asistente de fptecnologi.com responda con los datos de
las páginas nuevas, haga cotizaciones y sea un asistente completo de la empresa (datos de FPTecnologi, productos, todo);
y en el administrador un módulo **Asistente virtual** que consulte datos, haga resúmenes y métricas, lleve a la página o
módulo correcto y muestre la data real consultada. Definido y limitado **por proyecto (marca)**.

## Estado actual (antes de este plan)

- **Web** (`apps/web-fptecnologi/app/api/chat/route.ts`): Groq (`GROQ_API_KEY`, `GROQ_MODEL`, por defecto
  `openai/gpt-oss-20b`), respuesta JSON `{text, actions, options}`. Conocimiento = todo el contexto en el prompt
  (`src/lib/chatConocimiento.ts`, caché 60 s): empresa, nosotros, servicios, **primeros 80 productos**, marcas, cotizador,
  blog, proyectos reales, legales. Tercera fuente: `POST /public/conocimiento/consultar` (texto completo de Postgres sobre
  documentos y respuestas oficiales del dashboard).
- **Faltan en el conocimiento** las páginas nuevas: `/alquiler-equipos`, `/educacion`, `/compliance`, `/catalogos`,
  `/tickets` (+ seguimiento), `/presupuesto` (mayorista), `/cuenta`, `/socios`. Las acciones tampoco tienen sus enlaces.
- **Productos**: si el catálogo tiene más de 80, el resto no existe para el bot; no hay búsqueda por la pregunta.
- **Cotizaciones**: el bot solo manda al cotizador; no arma montos ni registra la solicitud.
- **Dashboard**: no hay asistente; solo la pantalla de Conocimiento (documentos, respuestas, pendientes, probador,
  instrucciones), por marca.
- **Otras marcas**: Fimav y Quamtu no tienen chat IA (solo WhatsApp). El conocimiento y las instrucciones ya son por marca.

## Decisiones

- **Proveedor**: se mantiene Groq (ya configurado y pagado por el proyecto). En la API se llama por `fetch` a su endpoint
  compatible (`https://api.groq.com/openai/v1/chat/completions`), sin dependencia nueva. Variables nuevas en la API:
  `GROQ_API_KEY` y `GROQ_MODEL` (opcionales: sin key el asistente del dashboard responde 503 «no configurado»; no se
  agregan a `assertRequiredEnv`).
- **La IA nunca decide datos ni URLs**: las cifras y tablas que ve el usuario salen tal cual de las consultas del servidor
  (no del texto del modelo); los enlaces son IDs de una lista blanca (web: `chatActions.ts`; dashboard: nodos de
  `nav-manifest.json` filtrados por rol). Los montos de una cotización los calcula el servidor con los precios del catálogo.
- **Las cotizaciones las confirma la persona**: el bot arma una tarjeta con el detalle (productos × cantidad, subtotal,
  IGV 18 %, total, o el servicio con el resumen) y la persona pulsa «Enviar solicitud». Se reutilizan los endpoints
  públicos existentes: `POST /public/presupuestos` (productos, ≥6 u. por producto = mayorista, PDF) y
  `POST /public/cotizaciones` (servicio). Con menos de 6 unidades: estimado + «Agregar al carrito».
- **Por proyecto/marca y por rol**: el asistente del dashboard trabaja solo sobre la marca activa (`MarcaRolGuard` +
  tenant-guard) y solo con las herramientas que el rol del usuario podría usar en su módulo (mismos `@Roles` que los
  controladores: pedidos/reportes → admin/ventas; leads/tickets/reclamos/contactos → admin/comercial;
  cotizaciones/presupuestos → admin/comercial/ventas; chats → admin/asesores; productos → admin/ventas). Admin = todo.
  El nombre de la marca entra en el prompt; el conocimiento y las instrucciones ya son por marca.

## Global Constraints

- Multi-marca: toda query con `marcaId` (tenant-guard). El `marcaId` sale de `@MarcaActual()`, nunca del body.
- Sin PII en logs. Historial del chat del dashboard solo en `sessionStorage` del navegador (no se guarda en la BD).
- Tope de uso: 40 consultas / 10 min por usuario en el dashboard; la web mantiene 30 / 10 min por IP.
- Máximo 4 vueltas de herramientas por pregunta; filas por tabla ≤ 25.
- API: Vitest, `.js` en imports ESM, `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build`.
  Admin y web: `npm run lint`, `npm run build`.

---

### Task 1: Web — conocimiento completo (páginas nuevas) y búsqueda de productos por la pregunta

**Files:** `apps/web-fptecnologi/src/lib/chatConocimiento.ts`, `src/lib/chatActions.ts`, `app/api/chat/route.ts`.

- [x] Secciones nuevas desde `getPagina()` (respetan lo editado en el CMS): Alquiler de equipos (beneficios, equipos,
      pasos), FP Education, Compliance (resumen de secciones + documentos descargables), Catálogos (títulos), Soporte y
      tickets (`/tickets`, seguimiento por número), Presupuesto mayorista (`/presupuesto`, mínimo 6 u. por producto,
      precio mayorista, PDF), Mi cuenta (`/cuenta`: pedidos y cotizaciones con código por correo), Socios
      (`/socios/registro`), cifras de la empresa.
- [x] Acciones nuevas: `alquiler`, `educacion`, `compliance`, `catalogos`, `tickets`, `seguimiento`, `presupuesto`,
      `cuenta`, `socios`, `carrito`.
- [x] Productos: `productosRelevantes(pregunta, productos)` puntúa por términos (nombre, marca, SKU, categoría, sin
      tildes) sobre TODO el catálogo; el prompt lleva los 30 más relevantes con detalle (precio, precio mayorista, antes,
      stock disponible sí/no) + el resto resumido por categoría/marca (conteo y rango de precios). Sin coincidencias →
      los destacados/primeros 30.

### Task 2: Web — cotizaciones dentro del chat

**Files:** `app/api/chat/route.ts`, `src/lib/chatCotizacion.ts` (nuevo), `src/components/site/ChatWidget.tsx`.

- [x] El JSON del modelo admite `cotizacion`: `{tipo:"productos", items:[{sku,cantidad}]}` o
      `{tipo:"servicio", servicio:"slug", detalle}`, más `contacto` `{nombre, email, telefono?, empresa?, documento?}`
      cuando la persona ya lo dio.
- [x] `armarCotizacion()` (servidor) valida SKUs/slug contra el catálogo real, calcula línea a línea (precio mayorista si
      ≥6 u. y existe), subtotal, IGV 18 % y total; decide el destino: `presupuesto` (todas las líneas ≥6 u.),
      `carrito` (<6 u.) o `servicio`.
- [x] El widget pinta la tarjeta (líneas, totales, validez «referencial, confirma un asesor») con botones
      «Enviar solicitud» (si hay nombre + correo válidos; llama a `/api/presupuestos` o `/api/hub/cotizaciones`
      existentes con `origen: "asistente"`), «Agregar al carrito» y «Abrir presupuesto» (`/presupuesto/<id>` al crearse).
- [x] Prompt: flujo de cotización (qué y cuánto → datos de contacto → tarjeta), nunca inventar precios.

### Task 3: API — módulo `asistente` (dashboard)

**Files:** `apps/api/src/asistente/{asistente.module.ts,asistente.controller.ts,asistente.service.ts,asistente.herramientas.ts,asistente.groq.ts,*.spec.ts}`, `src/app.module.ts`, `.env.example`, `AGENTS.md`.

- [x] `POST /asistente/consultar` `{ mensajes: [{role:'user'|'assistant', content}] }` (≤12, ≤2000 caracteres), todos los
      roles de la marca. Respuesta `{ texto, modulos: string[], tablas: Tabla[], metricas: Metrica[], sugerencias: string[] }`.
- [x] Herramientas (function calling), cada una con sus roles: `resumen_negocio(desde,hasta)`, `reporte_ventas`,
      `buscar_productos(texto, stockBajo)`, `buscar_pedidos`, `buscar_cotizaciones`, `buscar_presupuestos`,
      `buscar_leads`, `buscar_tickets`, `buscar_reclamos`, `buscar_contactos`, `buscar_chats`,
      `buscar_conocimiento(pregunta)`. Cada una devuelve un texto compacto para el modelo y una `Tabla`/`Metrica` para la
      pantalla con su `modulo` (ID del manifiesto).
- [x] Bucle: hasta 4 vueltas de tool calls; respuesta final JSON `{texto, modulos, sugerencias}`; módulos filtrados por
      la lista blanca del rol.
- [x] Tests: permisos por rol (una herramienta fuera del rol no se ofrece ni se ejecuta), `marcaId` en cada query,
      bucle con fetch simulado, módulos inválidos descartados, 503 sin key, tope por usuario.

### Task 4: Administrador — pantalla «Asistente virtual»

**Files:** `apps/admin/src/screens/pages/AsistenteVirtual.tsx`, `app/(shell)/asistente/page.tsx`, `src/data/nav-manifest.json`.

- [x] Nodo `inicio.asistente` (sección INICIO, todos los roles) → `/asistente`.
- [x] Chat con sugerencias iniciales según rol, burbujas, tarjetas de métricas, tablas (con enlace al módulo), botones
      «Ir a <módulo>» resueltos contra el manifiesto + `visibleForRole`, historial por marca en `sessionStorage`,
      «Nueva conversación», estados de carga/error, accesible (aria-live, foco).

### Task 5: Documentación y cierre

- [x] `AGENTS.md` (módulo `asistente`), `docs/ESTADO-ACTUAL.md` (entrada con fecha), `.env.example` de la API.
- [x] Verificación: tsc/lint/tests/build de las 3 apps; el chat real necesita `GROQ_API_KEY` (no disponible en la
      sesión de nube: se prueba con fetch simulado y se deja anotado).
- [ ] Pendiente para después: chat IA en Fimav/Quamtu (reutilizando `/asistente`-like público por marca).
