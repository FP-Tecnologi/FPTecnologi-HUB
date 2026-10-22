# Libro de Reclamaciones — fase 2 (administrador + todas las marcas) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar el Libro de Reclamaciones virtual para **todas las marcas** (FPTecnologi, Quamtu, Fimav Perú), cada una con sus datos de proveedor y el estilo de su web, y **conectarlo con el administrador** (dashboard): bandeja, detalle, cambio de estado, notas internas, respuesta al consumidor, plazo de 15 días hábiles visible, resumen en el inicio y datos fiscales de cada marca editables.

**Architecture:** La API ya existe (fase 1: modelo `HojaReclamacion`, endpoints públicos y de dashboard, correos). Esta fase agrega a la API lo que falta (estado EN_PROCESO, notas internas, días hábiles restantes, resumen), una pantalla en `apps/admin` siguiendo el patrón de `CotizadorLeads`/`ContactosWeb`, edición de datos fiscales en `MarcasAdmin`, y el formulario + consulta + proxies en `apps/web-fptecnologi` y `apps/quamtu-web`, copiando la lógica de `apps/fimav-web` (`FormReclamacion`, `ConsultaReclamo`, proxies, `proveedor.ts`) con el estilo de cada web.

**Tech Stack:** NestJS 11 + Prisma + Vitest (API); Next 15 (admin) con las clases `ax-*` del dashboard; Next 16 + Tailwind 4 (webs).

**Spec:** `docs/superpowers/specs/2026-10-21-libro-reclamaciones-design.md` (fase 1) + pedidos del usuario del 2026-10-22: "completo, para todas las marcas, con sus datos y su estilo, conectado con el administrador".

## Global Constraints

- Plazo de respuesta **15 días hábiles** (sábados y domingos excluidos, hora de Lima); nunca "30 días calendario". Marco: Ley 29571 y su reglamento (DS 011-2011-PCM, modificado por DS 101-2022-PCM). La presentación no impide acudir a Indecopi.
- Multi-marca: toda query sobre `HojaReclamacion` lleva `marcaId`; el `marcaId` público viene solo del entorno del servidor de cada web (`HUB_MARCA_ID`), nunca del body; en el dashboard del `MarcaRolGuard`/`@MarcaActual()`.
- El documento del consumidor nunca va en una URL (la consulta es `POST` con cuerpo). Sin PII en logs ni en `Notificacion`.
- **Migraciones**: se escribe `migration.sql` y se prueba con mocks; **no se aplica a la base real** sin confirmación del usuario (puerto 5432, en una sola transacción, y registrar con `prisma migrate resolve --applied`). Aplicarla ANTES de desplegar el código que la usa.
- Cada web usa **su propio estilo**: Fimav (rojo/carbón, solo claro), FPTecnologi (tokens `brand-*`, el estilo actual de su `LibroReclamacionesForm`), Quamtu (cian `#238DC1`/violeta `#385CAD`, temas oscuro/claro/medio con `data-tema`, fuente Play/Carlito). No mezclar estilos.
- Accesibilidad AA: labels, `aria-invalid`, `role="alert"`, foco al primer error y al resultado, objetivos ≥44px; formularios con honeypot oculto.
- API: Vitest, `.js` en imports ESM; `npx tsc --noEmit` (único error previo: `test/app.e2e-spec.ts` supertest/types), `npm run lint`, `npx vitest run` completo y `npm run build` deben pasar. Webs: `npm run lint` (tsc) y `npm run build`. Admin: `npm run lint` y `npm run build`.
- Commits en español con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Nunca `.env*`, ni `apps/quamtu-web/.impeccable/`.
- Cada cambio en una web exige después `publicar-snapshot.sh` de su espejo (ver CLAUDE.md).

---

### Task 7: API — estados, notas, plazo restante y resumen

**Files:** Modify `apps/api/prisma/schema.prisma`, create `apps/api/prisma/migrations/20261022120000_libro_notas/migration.sql`, modify `src/libro-reclamaciones/{libro-reclamaciones.dto.ts,service.ts,controller.ts,*.spec.ts}`, `AGENTS.md`.

**Interfaces — Produces:**
- Campo nuevo `HojaReclamacion.notasInternas String?` y `atendidoPor String?` (último usuario que gestionó).
- `PATCH /libro-reclamaciones/:id` body `ActualizarHojaDto { estado?: 'RECIBIDO' | 'EN_PROCESO'; notasInternas?: string (≤2000, sin <>) }` (no permite RESPONDIDO: eso solo lo hace `/:id/responder`); roles admin/comercial; guarda `atendidoPor` con el email del usuario.
- `GET /libro-reclamaciones` y `GET /libro-reclamaciones/:id` devuelven además `diasHabilesRestantes: number | null` (null si ya está RESPONDIDO; negativo si vencida; contados en hora de Lima con la misma función `sumarDiasHabiles`/un helper `diasHabilesEntre`) y `vencida: boolean`.
- `GET /libro-reclamaciones/resumen` → `{ recibidas, enProceso, respondidas, vencidas, porVencer }` (`porVencer` = no respondidas con ≤3 días hábiles restantes y no vencidas), todo con `marcaId`.
- `list` acepta `q` (búsqueda por código, nombres, apellidos, documento, correo) además de `estado` y `vencidas`.

- [ ] **Step 1 (tests primero):** helper `diasHabilesEntre(desde, hasta)` (puro, Lima, con tests TZ-independientes como los de `dias-habiles.spec.ts`: sábado→lunes, vencida negativa, mismo día = 0); tests del servicio para `actualizar` (estado válido, rechaza RESPONDIDO, no cambia una hoja ya RESPONDIDO a otro estado, guarda `atendidoPor`, siempre con `marcaId`), `resumen` (conteos y `porVencer`), `list` con `q` y combinaciones, campos calculados. Ver RED.
- [ ] **Step 2:** schema + `migration.sql` (solo `ALTER TABLE "HojaReclamacion" ADD COLUMN "notasInternas" TEXT, ADD COLUMN "atendidoPor" TEXT;`, verificar con `prisma migrate diff --from-schema-datamodel <schema previo> --to-schema-datamodel` sin DB) y `npx prisma generate`. **No aplicar.**
- [ ] **Step 3:** DTO, servicio y controlador (rutas `resumen` declarada ANTES de `:id`); el correo de respuesta ya existe: al responder se guarda también `atendidoPor`. Notificación al equipo cuando una hoja pasa a "por vencer" NO se implementa (sin scheduler); el resumen lo cubre.
- [ ] **Step 4:** `npx vitest run src/libro-reclamaciones` verde, suite completa, `tsc`, lint, build. Documentar en `AGENTS.md` (nuevas rutas). Commit `Libro de reclamaciones: estado en proceso, notas internas, días hábiles restantes y resumen`.

---

### Task 8: Administrador — bandeja del libro, resumen en el inicio y datos fiscales de la marca

**Files:** Create `apps/admin/src/screens/pages/LibroReclamaciones.tsx`, `apps/admin/app/(shell)/libro-reclamaciones/page.tsx`; Modify `src/data/nav-manifest.json`, `src/components/shell/Sidebar.tsx` (permitir el módulo también a Quamtu), `src/lib/pageMetadata` si hace falta, `src/screens/pages/InicioDashboard.tsx` y `src/components/dashboard/{ResumenMarca.tsx,useResumen.ts}`, `src/screens/pages/MarcasAdmin.tsx`.

- [ ] **Step 1:** Leer `CotizadorLeads.tsx` y `ContactosWeb.tsx` (patrón de bandeja: `PageHead`, filtros, búsqueda, detalle, CSV, clases `ax-*`) y `src/data/nav-manifest.json`; crear `LibroReclamaciones.tsx` con: tarjetas de resumen (Recibidas, En proceso, Por vencer, Vencidas, Respondidas — `GET /libro-reclamaciones/resumen`), filtro por estado y "vencidas", búsqueda (`q`), tabla (código, fecha, consumidor, tipo reclamo/queja, estado, plazo con badge: verde >3 días, ámbar ≤3, rojo vencida, gris respondida), detalle lateral/modal con TODOS los campos de la hoja (consumidor, menor y representante, bien, monto y moneda, pedido, detalle, medio de respuesta, fecha límite), botón "Marcar en proceso", notas internas (`PATCH /libro-reclamaciones/:id`), formulario "Responder" (mín. 10 caracteres; confirma que se enviará por correo; aviso si el consumidor eligió carta: debe enviarse también por carta; `PATCH /libro-reclamaciones/:id/responder`), exportación CSV (con escape de fórmulas como en `CotizadorLeads`), estados de carga/error y accesibilidad (focus trap del detalle, `role="dialog"`).
- [ ] **Step 2:** Ruta `app/(shell)/libro-reclamaciones/page.tsx` y entrada en `nav-manifest.json` (sección MARCA, ícono existente, roles `["comercial"]`, keywords: libro, reclamaciones, quejas, indecopi), y en `Sidebar.tsx` agregar `marca.libro` a la excepción `soloQuamtu` para que Quamtu también lo vea. Comprobar que el super admin y los roles correctos lo ven.
- [ ] **Step 3:** Inicio del dashboard: tarjeta/pendiente "Reclamos por vencer/vencidos" con enlace a la bandeja (patrón de `Pendiente` y `ResumenMarca`), usando el resumen; sin romper marcas sin datos.
- [ ] **Step 4:** `MarcasAdmin.tsx`: campos Razón social, RUC (11 dígitos) y Dirección fiscal en el modal de edición/creación y su guardado (`PATCH/POST /marcas`), mostrando un aviso si faltan (el libro los exige) y un indicador en la tarjeta de la marca.
- [ ] **Step 5:** Verificar con `preview_start` del admin (`.claude/launch.json` → `admin`, puerto 3000) y la API en modo mock si no se puede usar la real: como no se debe tocar la base real ni la migración aún no aplicada, probar la pantalla con un **mock de API** (servidor Node temporal en el scratchpad que implemente `/auth/*` mínimo, `/libro-reclamaciones*`, `/marcas`) o, si el login real es indispensable, limitar la verificación a `tsc`/build + render de la pantalla con datos de prueba inyectados; dejar claro en el reporte qué se verificó. `npm run lint`, `npm run build`. Commit `Administrador: bandeja del libro de reclamaciones, resumen en el inicio y datos fiscales de la marca`.

---

### Task 9: FPTecnologi — libro de reclamaciones completo (estilo propio)

**Files:** en `apps/web-fptecnologi` (estructura `app/` + `src/`): reemplazar `src/components/site/LibroReclamacionesForm.tsx` y `app/libro-de-reclamaciones/page.tsx`; crear los proxies `app/api/hub/libro-reclamaciones/route.ts` y `.../consulta/route.ts` y `src/lib/proveedorLibro.ts`; actualizar `src/lib/legal.ts` y enlaces del pie.

- [ ] **Step 1:** Leer el formulario actual y la web (tokens `brand-*`, componentes `Campo`/`Bloque`) y los proxies existentes (`app/api/contacto/route.ts`, `lib/sitio.ts`, cómo resuelven `marcaId`/`API_URL`). Copiar la lógica (validación por tipo de documento, menor de edad, payload exacto de `CrearHojaDto`, lectura `j.data ?? j`, foco, honeypot, confirmación con código/fecha/fecha límite, imprimir, consulta por POST) desde `apps/fimav-web` (`FormReclamacion.tsx`, `ConsultaReclamo.tsx`, `src/app/api/hub/libro-reclamaciones/**`, `src/lib/proveedor.ts`) **adaptando solo el estilo** al de FPTecnologi y su variable de entorno de marca (misma convención que ya usa para otros proxies; documentar en `.env.example`).
- [ ] **Step 2:** Página con título, marco legal breve (Ley 29571, 15 días hábiles, Indecopi), datos del proveedor leídos de la API con respaldo local, formulario y consulta; metadatos; enlace "Libro de Reclamaciones" visible en el pie y en el inicio (acceso visible); corregir cualquier mención a plazos distintos en `legal.ts`/textos del chat (`chatConocimiento.ts` si menciona el libro).
- [ ] **Step 3:** Verificar con un mock upstream (como en fimav-web), `.env.local` temporal sin commitear, 375/1280, a11y, `npm run lint` y `npm run build`. Commit `FPTecnologi web: libro de reclamaciones completo conectado a la API del HUB`; luego publicar el espejo (`TMPDIR=/tmp bash scripts/publicar-snapshot.sh`) solo al final del plan (Task 11).

---

### Task 10: Quamtu — libro de reclamaciones completo (estilo propio)

**Files:** en `apps/quamtu-web`: `src/app/libro-de-reclamaciones/page.tsx`, `src/components/FormReclamacion.tsx`, `ConsultaReclamo.tsx`, `src/app/api/hub/libro-reclamaciones/**`, `src/lib/proveedor.ts`; pie (`Footer.tsx`) y `.env.example`.

- [ ] **Step 1:** Igual que la Task 9 pero con el estilo de Quamtu (leer `DESIGN.md` y `PRODUCT.md` de la app, `globals.css`, `Footer.tsx`, `Cotizador.tsx`/`/api/hub/cotizador/route.ts` para el patrón de proxy y `HUB_MARCA_ID`): colores `#238DC1`/`#385CAD`, fuentes Play/Carlito, temas `oscuro/claro/medio` con variables (`--c-*`, `--color-*`), mayúsculas en h1–h3 como el resto del sitio, sin 3D. Página `/libro-de-reclamaciones` con proveedor, formulario, consulta; enlace visible en el pie y acceso desde la home; textos con 15 días hábiles.
- [ ] **Step 2:** Verificar los tres temas (contraste AA en cada uno), 375/1280, mock upstream, `npm run lint` y `npm run build`. Commit `Quamtu web: libro de reclamaciones completo conectado a la API del HUB`.

---

### Task 11: Revisión final, migración y publicación

- [ ] Revisión final de toda la rama (API + admin + 3 webs): consistencia payload↔DTO en las 3 webs, aislamiento multi-marca, textos legales, a11y, estilos propios de cada marca.
- [ ] Con confirmación del usuario: aplicar `20261022120000_libro_notas` a la base real (5432, transacción única, `migrate resolve --applied`) ANTES de subir; luego `develop` y `main`; publicar espejos `fimav-peru` (si cambió), `fptecnologi-web` y `quamtu-web`.
- [ ] Lista de puesta en marcha para el usuario: razón social/RUC/dirección fiscal de las 3 marcas (pantalla Marcas), `contactoEmail`, usuarios admin/comercial por marca, `HUB_MARCA_ID`/`HUB_API_URL` en cada web, `WEB_ORIGIN` en la API, probar una hoja real por marca, revisión legal.

## Self-review

- Pedido: completo (T7 API faltante, T8 administrador), todas las marcas (T9 FPTecnologi, T10 Quamtu; Fimav ya está), con sus datos (campos fiscales editables en T8, proveedor leído por API en las webs) y su estilo (T9/T10), conectado con el administrador (T8: bandeja, respuesta, resumen en el inicio, datos de la marca).
- Riesgo: la migración de T7 debe aplicarse antes de desplegar; la verificación del admin sin DB real depende de un mock.
