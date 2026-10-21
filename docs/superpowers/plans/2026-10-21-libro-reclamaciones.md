# Libro de Reclamaciones (API + Fimav) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Registrar hojas de reclamación virtuales por marca desde la API del HUB y mostrarlas en un formulario completo en `apps/fimav-web`.

**Architecture:** Módulo NestJS `libro-reclamaciones` (modelo tenant `HojaReclamacion`, endpoints públicos y de dashboard, correos) calcado del módulo `cotizador`; la web de Fimav lo consume por proxies Next (`HUB_MARCA_ID` solo en servidor).

**Tech Stack:** NestJS 11 + Prisma (Postgres) + class-validator + Vitest (API); Next 16 + Tailwind 4 (web).

**Spec:** `docs/superpowers/specs/2026-10-21-libro-reclamaciones-design.md`

## Global Constraints

- Plazo de respuesta: **15 días hábiles** (sábados y domingos excluidos). Nunca "30 días calendario".
- Multi-marca: toda query sobre `HojaReclamacion` lleva `marcaId` (el guard `tenant-guard.extension.ts` lanza si falta). `marcaId` solo del query público validado contra `Marca`, o del JWT/`MarcaRolGuard` en dashboard; nunca del body.
- Nombres de negocio en español, técnicos en inglés. Rutas con `.js` en los imports de la API (ESM), como el resto del código.
- **No aplicar migraciones a la base real**: escribir `migration.sql`, correr `npx prisma generate` y los tests con mocks. (Aplicar queda para el controlador tras confirmación del usuario.)
- Fimav web: solo modo claro, paleta rojo `#E02424` / rojo profundo `#C02020` / botón `#C91F1F` (texto blanco) / carbón `#38383C` / tinta `#111` / gris `#F3F3F4` / plata / blanco; texto rojo pequeño sobre claro = `text-rojo-hondo`; texto pequeño sobre rojo = `bg-boton` + `text-white`; foco blanco sobre carbón; labels asociados, errores con `role="alert"`, `aria-invalid`, `aria-describedby`, foco al primer error y al resultado.
- Tests API: Vitest, `*.spec.ts` junto al archivo, `npx vitest run <archivo>`. `npm run lint` (oxlint) y `npx tsc --noEmit` deben pasar en la API; `npm run lint` (tsc) en fimav-web.
- Commits en español terminando con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Nunca subir `.env*`.

## File Structure

```
apps/api/prisma/schema.prisma                       (modify: enums, HojaReclamacion, Marca fields)
apps/api/prisma/migrations/20261021120000_libro_reclamaciones/migration.sql
apps/api/src/prisma/tenant-guard.extension.ts       (modify: 'HojaReclamacion')
apps/api/src/marcas/*                               (modify: DTO/servicio aceptan razonSocial, ruc, direccionFiscal)
apps/api/src/libro-reclamaciones/dias-habiles.ts    (+ .spec.ts)
apps/api/src/libro-reclamaciones/libro-reclamaciones.dto.ts
apps/api/src/libro-reclamaciones/libro-reclamaciones.service.ts (+ .spec.ts)
apps/api/src/libro-reclamaciones/libro-reclamaciones.controller.ts
apps/api/src/libro-reclamaciones/libro-reclamaciones.module.ts
apps/api/src/mail/templates.ts, mail.service.ts     (modify: 3 correos)
apps/api/src/app.module.ts                          (modify: registrar módulo)
apps/fimav-web/src/app/api/hub/libro-reclamaciones/route.ts
apps/fimav-web/src/app/api/hub/libro-reclamaciones/consulta/route.ts
apps/fimav-web/src/lib/proveedor.ts
apps/fimav-web/src/components/FormReclamacion.tsx, ConsultaReclamo.tsx
apps/fimav-web/src/app/libro-de-reclamaciones/page.tsx
apps/fimav-web/src/components/Footer.tsx, next.config.mjs, src/lib/legal.ts (modify)
```

---

### Task 1: Modelo, migración y datos de proveedor en Marca

**Files:** Modify `schema.prisma`, `tenant-guard.extension.ts`, módulo `marcas`; Create `migrations/20261021120000_libro_reclamaciones/migration.sql`.

**Interfaces:** Produces (Prisma): `HojaReclamacion` con campos
`id, marcaId, anio Int, correlativo Int, codigo String, fecha DateTime, nombres, apellidos, tipoDocumento (DNI|CE|PASAPORTE|RUC), nroDocumento, domicilio, telefono, email, menorEdad Boolean, repNombres?, repTipoDocumento?, repNroDocumento?, tipoBien (PRODUCTO|SERVICIO), montoReclamado Decimal(12,2)?, moneda ('PEN'|'USD'), descripcionBien, nroPedido?, tipo TipoHoja(RECLAMO|QUEJA), detalle, pedidoConsumidor, medioRespuesta (CORREO|CARTA), origen?, estado EstadoHoja(RECIBIDO|EN_PROCESO|RESPONDIDO), fechaLimite DateTime, respuesta?, respondidoAt?, respondidoPor?, createdAt, updatedAt`; `@@unique([marcaId, anio, correlativo])`, `@@index([marcaId, estado, fechaLimite])`, `@@index([marcaId, codigo])`.
`Marca` gana `razonSocial String?`, `ruc String?`, `direccionFiscal String?`.

- [ ] **Step 1:** Agregar al `schema.prisma` (junto a `LeadCotizador`) los enums `TipoHoja`, `EstadoHoja`, el modelo `HojaReclamacion` con exactamente los campos de Interfaces (strings para tipoDocumento/tipoBien/moneda/medioRespuesta, comentando los valores), la relación `marca Marca @relation(...)` y en `Marca` el campo inverso `hojasReclamacion HojaReclamacion[]` y los 3 campos nuevos.
- [ ] **Step 2:** Escribir `migration.sql` a mano con `CREATE TYPE "TipoHoja" AS ENUM ('RECLAMO','QUEJA')`, `CREATE TYPE "EstadoHoja" ...`, `CREATE TABLE "HojaReclamacion" (...)` con FK a `"Marca"("id")`, los índices/unique, y `ALTER TABLE "Marca" ADD COLUMN "razonSocial" TEXT, ADD COLUMN "ruc" TEXT, ADD COLUMN "direccionFiscal" TEXT`. Mirar `migrations/20261016210000_invitacion_datos/migration.sql` y la migración de `LeadCotizador` como estilo; el SQL debe coincidir con lo que generaría `prisma migrate diff` (verificar con `npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script` si hay shadow DB disponible; si no, revisar a mano contra el schema).
- [ ] **Step 3:** Añadir `'HojaReclamacion'` a `TENANT_MODELS` en `src/prisma/tenant-guard.extension.ts`.
- [ ] **Step 4:** En `src/marcas/` leer el DTO/servicio y permitir editar `razonSocial`, `ruc` (11 dígitos, validar `^\d{11}$`), `direccionFiscal` (≤200) como opcionales en crear/actualizar, devolviéndolos en las respuestas existentes. No tocar nada más.
- [ ] **Step 5:** `npx prisma generate` y `npx tsc --noEmit` sin errores; correr los tests existentes de `marcas` y `prisma` (`npx vitest run src/marcas src/prisma`).
- [ ] **Step 6:** Commit `Libro de reclamaciones: modelo HojaReclamacion, migración y datos fiscales de la marca`.

---

### Task 2: Días hábiles, DTO y servicio (con tests)

**Files:** Create `dias-habiles.ts`, `dias-habiles.spec.ts`, `libro-reclamaciones.dto.ts`, `libro-reclamaciones.service.ts`, `libro-reclamaciones.service.spec.ts`.

**Interfaces:** Consumes Task 1 (Prisma), `MailService` (Task 3 añade métodos; en esta tarea el servicio recibe `MailService` y llama `mail.sendHojaConsumidor(to, datos)`, `mail.sendHojaEquipo(to, datos)`, `mail.sendRespuestaReclamo(to, datos)` — declarar `datos` en `HojaCorreo` de Task 3; en los tests se mockean).
Produces:
```ts
export function sumarDiasHabiles(desde: Date, dias: number): Date;           // dias-habiles.ts: salta sábado/domingo
export class CrearHojaDto { ... }                                           // DTO público
export class ResponderHojaDto { respuesta: string; }                        // 10..4000 chars, sin < >
export class LibroReclamacionesService {
  crearPublico(marcaId: string, dto: CrearHojaDto, ip: string): Promise<{ ok: true; codigo?: string; fecha?: Date; fechaLimite?: Date }>;
  consultar(marcaId: string, codigo: string, documento: string): Promise<{ codigo; tipo; estado; fecha; fechaLimite; respuesta: string | null; respondidoAt: Date | null }>;
  proveedor(marcaId: string): Promise<{ razonSocial: string | null; ruc: string | null; nombreComercial: string; direccion: string | null; email: string | null }>;
  list(marcaId: string, filtro?: { estado?: EstadoHoja; vencidas?: boolean }): Promise<HojaReclamacion[]>;
  get(marcaId: string, id: string): Promise<HojaReclamacion>;
  responder(marcaId: string, id: string, dto: ResponderHojaDto, email: string): Promise<HojaReclamacion>;
}
```

- [ ] **Step 1 (test primero) `dias-habiles.spec.ts`:** casos: lunes 2026-10-19 + 15 → martes 2026-11-09; viernes + 1 → lunes siguiente; sábado + 1 → lunes; + 0 → misma fecha. Ejecutar (FAIL: no existe).
- [ ] **Step 2:** Implementar `sumarDiasHabiles`:
```ts
export function sumarDiasHabiles(desde: Date, dias: number): Date {
  const d = new Date(desde);
  let restan = dias;
  while (restan > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) restan--;
  }
  return d;
}
// ponytail: solo excluye sábado y domingo; agregar la lista de feriados nacionales si Indecopi/legal lo exige.
```
Test PASS.
- [ ] **Step 3: DTO** con `class-validator` calcando `CrearLeadDto` (`TEXTO = /^[^<>]*$/`): nombres/apellidos 2-80; `tipoDocumento` `@IsIn(['DNI','CE','PASAPORTE','RUC'])`; `nroDocumento` 5-20 alfanumérico `^[A-Za-z0-9-]+$`; `domicilio` 5-200; `telefono` 6-20 (`^[0-9+()\s-]+$`); `email` IsEmail ≤120; `menorEdad` IsBoolean; `repNombres?`, `repTipoDocumento?` (IsIn DNI|CE|PASAPORTE), `repNroDocumento?`; `tipoBien` IsIn PRODUCTO|SERVICIO; `montoReclamado?` IsNumber max 2 decimales, Min(0), Max 100000000; `moneda` IsIn PEN|USD; `descripcionBien` 3-300; `nroPedido?` ≤60; `tipo` IsIn RECLAMO|QUEJA; `detalle` 10-2000; `pedidoConsumidor` 5-1000; `medioRespuesta` IsIn CORREO|CARTA; `aceptaVeracidad` `@Equals(true)`; `origen?` ≤200; `website?` honeypot ≤200. Todos los textos libres con `@Matches(TEXTO)`.
- [ ] **Step 4: tests del servicio (rojo)** con mocks de `prisma` y `mail` como en `cotizador.service.spec.ts`: (a) guarda con `marcaId`, correo en minúsculas, `codigo` `LR-0001-<año>` cuando no hay previas y `LR-0002-<año>` si `aggregate` devuelve max 1, `fechaLimite` = `sumarDiasHabiles(fecha, 15)`; (b) honeypot responde `{ok:true}` sin guardar; (c) marca inexistente → BadRequest; (d) DNI exige 8 dígitos, RUC 11, CE 9-12 alfanum; (e) `menorEdad=true` sin datos del representante → BadRequest; `menorEdad=false` ignora los datos del representante; (f) reintenta el correlativo 1 vez si `create` lanza `P2002` y la segunda vez guarda; (g) tope por IP: la 6.ª en 10 min → 429; (h) envía copia al consumidor y aviso al equipo, y si el correo lanza error igual devuelve ok; (i) `consultar` devuelve datos solo si `nroDocumento` coincide (case-insensitive), si no → NotFound; (j) `responder` marca RESPONDIDO con `respondidoAt`, `respondidoPor`, y envía correo; responder dos veces → BadRequest 'Ya fue respondida'.
- [ ] **Step 5: servicio** (mismo patrón que `CotizadorService`: `limitar()` en memoria 5/10 min, `avisarEquipo` a roles admin y comercial con `notificacion.createMany` tipo `'SISTEMA'` y `mail.sendHojaEquipo`; correlativo con `aggregate({ _max: { correlativo }, where: { marcaId, anio } })` + `create` con reintento ante `P2002` hasta 3 veces; `codigo = \`LR-${String(n).padStart(4,'0')}-${anio}\``; todas las queries con `marcaId`). `proveedor` lee `marca` (razonSocial, ruc, nombre, direccionFiscal, contactoEmail). `list`: `vencidas` = `estado != RESPONDIDO && fechaLimite < now`.
- [ ] **Step 6:** Correr `npx vitest run src/libro-reclamaciones` (todo verde, salida limpia), `npx tsc --noEmit`, `npm run lint`.
- [ ] **Step 7:** Commit `Libro de reclamaciones: servicio, DTO y cálculo de 15 días hábiles`.

---

### Task 3: Correos, controladores y módulo

**Files:** Modify `mail/templates.ts`, `mail/mail.service.ts`, `app.module.ts`; Create `libro-reclamaciones.controller.ts`, `libro-reclamaciones.module.ts`, `libro-reclamaciones.controller.spec.ts` (si el cotizador tiene uno equivalente; si no, solo tipos).

**Interfaces:** Produces `export interface HojaCorreo { codigo; fecha: Date; fechaLimite: Date; proveedor: { razonSocial: string | null; ruc: string | null; nombreComercial: string; direccion: string | null }; consumidor: { nombres; apellidos; tipoDocumento; nroDocumento; domicilio; telefono; email }; menorEdad: boolean; representante?: { nombres; tipoDocumento; nroDocumento }; bien: { tipo; monto: string | null; moneda; descripcion; nroPedido: string | null }; tipo: 'RECLAMO' | 'QUEJA'; detalle; pedido; medioRespuesta }` y `MailService.sendHojaConsumidor(to, h: HojaCorreo)`, `sendHojaEquipo(to, h, url: string)`, `sendRespuestaReclamo(to, { codigo, tipo, respuesta, proveedor })`.

- [ ] **Step 1:** En `templates.ts` agregar `hojaConsumidorEmail`, `hojaEquipoEmail`, `respuestaReclamoEmail` con `layout()` y `escapeHtml` en TODO dato del usuario (como `leadNuevoEmail`). La copia al consumidor incluye todos los campos de la hoja, el código, la fecha, la fecha límite (15 días hábiles) y el texto "Esta es la copia de tu hoja de reclamación. Presentar un reclamo no impide acudir a Indecopi."; la respuesta incluye el texto de la respuesta del proveedor.
- [ ] **Step 2:** En `mail.service.ts` los 3 métodos usando `this.send(...)` (no lanzan).
- [ ] **Step 3:** Controladores calcados de `cotizador.controller.ts`: `@Public() @Controller('public/libro-reclamaciones')` con `@Limite(10) @Post()` (marcaId de `@Query`, IP de `x-forwarded-for` primero), `@Get('consulta')` (`@Query('marcaId')`, `codigo`, `documento`, `@Limite(30)`), `@Get('proveedor')`; y `@UseGuards(MarcaRolGuard) @Roles('admin','comercial') @Controller('libro-reclamaciones')` con `GET /`, `GET /:id`, `PATCH /:id/responder` (`@CurrentUser()` para el email).
- [ ] **Step 4:** Módulo (imports `MailModule`) y registro en `app.module.ts`.
- [ ] **Step 5:** `npx tsc --noEmit`, `npm run lint`, `npx vitest run` (todo el API: no deben romperse los demás tests). Arrancar un smoke de Nest si es posible (`npm run build`).
- [ ] **Step 6:** Commit `Libro de reclamaciones: correos, endpoints públicos y de dashboard`.

---

### Task 4: Fimav — proxies, proveedor y formulario

**Files:** Create `apps/fimav-web/src/app/api/hub/libro-reclamaciones/route.ts`, `.../consulta/route.ts`, `src/lib/proveedor.ts`, `src/components/FormReclamacion.tsx`, `src/components/ConsultaReclamo.tsx`, `src/app/libro-de-reclamaciones/page.tsx`.

**Interfaces:** Consumes los endpoints de Task 3 (cuerpo = `CrearHojaDto`). Produces `getProveedor(): Promise<Proveedor>` (`{ razonSocial, ruc, nombreComercial, direccion, email }`, desde `GET {HUB_API_URL}/public/libro-reclamaciones/proveedor?marcaId=`, con `revalidate: 3600` y respaldo en `contacto` si falla o no hay `HUB_MARCA_ID`).

- [ ] **Step 1: proxies** (calcar `src/app/api/hub/cotizador/route.ts`): POST reenvía a `/public/libro-reclamaciones?marcaId=${HUB_MARCA_ID}` (tope 20_000 bytes, 503 sin marca, 502 si no responde, `x-forwarded-for`); GET `consulta` reenvía `codigo` y `documento` (validar longitudes ≤40 antes de reenviar).
- [ ] **Step 2: `FormReclamacion.tsx`** (`'use client'`): cabecera con datos del proveedor (prop) y fecha; bloque 1 Identificación del consumidor (nombres, apellidos, tipo y n.° de documento con validación por tipo, domicilio, teléfono, correo; casilla "Soy menor de edad" que muestra los datos del padre/madre/apoderado obligatorios); bloque 2 Bien contratado (producto/servicio, monto reclamado con moneda, descripción, n.° de pedido o comprobante); bloque 3 Detalle (reclamo/queja con la definición de cada uno, detalle, pedido del consumidor, medio de respuesta CORREO/CARTA); casilla de veracidad y aviso "Responderemos en un plazo máximo de 15 días hábiles. Presentar un reclamo no impide acudir a Indecopi."; honeypot oculto. Validación cliente que replica el DTO; foco al primer campo inválido y al resultado; éxito: pantalla con código, fecha, fecha límite y botones "Imprimir / guardar PDF" (`window.print()` con estilos `print:` para ocultar header/footer) y "Registrar otro"; fallo 5xx/503: mensaje con correo `comercial` y teléfono. Estilo Fimav (globals y constraints).
- [ ] **Step 3: `ConsultaReclamo.tsx`** (`'use client'`): código + documento → muestra estado, fecha límite y respuesta; errores 404 como "No encontramos una hoja con esos datos".
- [ ] **Step 4: `page.tsx`**: server component, `await getProveedor()`, h1 "Libro de Reclamaciones", texto breve con el marco legal (Ley 29571 y su reglamento; 15 días hábiles), formulario y consulta; `metadata.title`.
- [ ] **Step 5: verificar** con un mock upstream temporal (como en Task 8 de la web: servidor Node en el scratchpad que valida path y devuelve `{ok:true,codigo:'LR-0001-2026',...}`; `.env.local` temporal que se borra): enviar el formulario (reclamo, menor de edad y no), consulta; sin `HUB_MARCA_ID` → 503 y aviso; errores de validación; `npm run lint`; capturas 1280 y 375; sin scroll horizontal; un solo h1.
- [ ] **Step 6:** Commit `Fimav web: libro de reclamaciones (formulario, consulta y proxies)`.

---

### Task 5: Fimav — acceso visible, redirección y textos

**Files:** Modify `src/components/Footer.tsx`, `next.config.mjs`, `src/lib/legal.ts`, `src/components/home/*` (solo si hace falta el acceso en el inicio), `src/app/sitemap` (si existe).

- [ ] **Step 1:** En el pie reemplazar el enlace a `/legal/reclamaciones` por `/libro-de-reclamaciones` con un distintivo visible "Libro de Reclamaciones" (icono `BookOpen` de lucide en un cuadro `bg-boton`), y mostrar el mismo distintivo en el inicio (barra o pie de la home) para cumplir el acceso visible.
- [ ] **Step 2:** `next.config.mjs`: `redirects()` permanente de `/legal/reclamaciones` a `/libro-de-reclamaciones`; quitar la entrada `reclamaciones` de `legal.ts` y de `generateStaticParams` (se alimenta de `legal`).
- [ ] **Step 3:** Corregir en `legal.ts` cualquier mención a "30 días calendario" por "15 días hábiles" (términos, devoluciones, preguntas frecuentes) y apuntar a la nueva página donde se mencione el libro.
- [ ] **Step 4:** `npm run lint`, `npm run build` (reiniciar el dev server después), comprobar `/legal/reclamaciones` → 308 al formulario, enlaces del pie y 1 h1 por página.
- [ ] **Step 5:** Documentar en `AGENTS.md` (módulo `libro-reclamaciones`) y `docs/ESTADO-ACTUAL.md` (qué está hecho y pendientes: aplicar migración a la base real, cargar razón social/RUC/dirección fiscal de cada marca, pantalla del dashboard, webs de FPTecnologi y Quamtu, validar texto legal). Commit `Fimav web: acceso visible al libro de reclamaciones, redirección y plazo de 15 días hábiles`.

## Self-review

- Spec: modelo y marca (T1), servicio/DTO/15 días hábiles/correlativo/consulta (T2), correos y endpoints público + dashboard (T3), formulario/consulta/proxies (T4), acceso visible/redirección/textos/docs (T5). Pantalla del dashboard y otras webs quedan fuera (declarado).
- Nombres consistentes: `HojaReclamacion`, `CrearHojaDto`, `ResponderHojaDto`, `LibroReclamacionesService`, `sumarDiasHabiles`, `HojaCorreo`, `getProveedor`.
- Riesgo: la migración no se aplica a la base real en este plan; sin aplicarla los endpoints fallan en runtime (el controlador la aplica tras confirmar con el usuario).
