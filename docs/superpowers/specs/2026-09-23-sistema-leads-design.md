# Sistema de Leads — diseño

Fecha: 2026-09-23
Estado: aprobado en brainstorming, pendiente revisión de la spec escrita.

## Objetivo

Un sistema aparte (app nueva, diseño Vireo) que centraliza **todos los leads**
de la empresa en una sola base de datos: landings de campaña (Expomina y las
que vengan), aplicaciones offline que sincronizan al tener internet, y
archivos Excel/CSV importados. Esa base es además la **fuente de datos
principal** para otras aplicaciones: el HUB y cualquier app futura la
consumen por una API con permisos.

## Decisiones tomadas

| Tema | Decisión |
| --- | --- |
| Dónde vive | App nueva `apps/leads` dentro del repo FPTecnologi-HUB, construida desde cero con el estilo Vireo (shell, tokens `--ax-*`, login, tablas, gráficas ApexCharts). |
| Base de datos | El proyecto Supabase de Expomina (`qpjxwtvmuqramhqoxkxj`). Se rediseña conservando todos los datos existentes. No se crea otra DB. |
| Backend | Supabase directo: Postgres + RLS + Supabase Auth + Edge Functions. Sin NestJS. |
| Datos del lead | Columnas núcleo fijas + `extra` (JSONB) para campos propios de cada formulario/archivo. |
| Landings | Cada landing es su propio código. El dashboard administra la *fuente* (config, formulario, clave, correo, registros). Duplicar = copiar la config; el diseño visual se clona del repo de la landing. Un mini-CMS de landings queda fuera de alcance. |
| Roles | `admin` (todo), `editor` (importa/edita/exporta en sus fuentes asignadas), `lector` (solo ve dashboard y tablas de sus fuentes). |
| Duplicados | Mismo email + misma fuente = se actualiza. Fuentes distintas = registros separados; el dashboard cuenta "personas únicas" cruzando por email. |
| Uso externo | Toda app externa (HUB, apps offline, apps futuras) es una "aplicación conectada" con clave propia, permisos y alcance. |

## 1. Arquitectura

- `apps/leads`: Next.js 16 (App Router) + React 19 + Tailwind v4 +
  ApexCharts, mismo stack que `apps/web`. Proyecto npm independiente (sin
  workspace raíz, igual que el resto del repo). Puerto 3003 en
  `.claude/launch.json`.
- Estilo: se copian de `apps/web` los tokens y componentes base
  (`src/styles`, `src/components/ui`, `src/components/shell`,
  `src/components/charts`) y se toman pantallas de la plantilla Vireo
  original (`crm/`, `tables/`, `charts/`, `auth/`) según `VIREO-REFERENCE.md`.
  No se importa código entre apps: se copia y se adapta.
- Cliente: `@supabase/supabase-js` con la anon key + sesión del usuario;
  todo acceso a datos queda restringido por RLS.
- Edge Functions (Deno, en el proyecto Supabase) para todo lo que entra o
  sale desde fuera del dashboard: `ingresar-lead`, `sincronizar`, `api-v1`,
  y la existente `send-thank-you`.

## 2. Seguridad

- Login email + contraseña y **2FA TOTP obligatorio** (MFA nativo de
  Supabase, nivel `aal2` exigido por RLS en tablas sensibles). Flujo visual
  igual al HUB: pantalla de ingreso → pantalla de código.
- Middleware de Next que redirige a login si no hay sesión (solo UX; la
  protección real es RLS).
- RLS en todas las tablas. La anon key no inserta ni lee nada sin sesión.
- Entradas externas solo por Edge Functions con `service_role` del lado del
  servidor, validación de campos contra la definición de la fuente,
  honeypot y rate limit por IP/clave.
- Claves de fuentes y de aplicaciones conectadas se guardan **hasheadas**
  (se muestran una sola vez al crearlas), son revocables y registran último
  uso.
- Secrets solo como secrets de Supabase / `.env` gitignorado.

## 3. Modelo de datos

```
fuentes
  id uuid pk
  nombre text
  slug text unique
  tipo text check (landing | offline | importacion)
  dominio text null
  estado text check (activa | cerrada) default activa
  campos jsonb        -- [{ key, label, tipo, requerido, opciones? }]
  clave_hash text null
  correo_gracias jsonb null   -- { activo, asunto, plantilla }
  creado_en, actualizado_en timestamptz

leads
  id uuid pk
  fuente_id uuid fk fuentes
  nombres, apellido, cargo, ruc, empresa, rubro, telefono, email text
  fecha_nacimiento date null
  status lead_status   -- nuevo | contactado | asistio | descartado
  extra jsonb default '{}'
  user_agent text null
  origen text          -- se conserva por compatibilidad
  duplicado_de uuid null fk leads
  id_externo text null -- id local de app offline o fila de importación
  created_at, actualizado_en timestamptz
  unique (fuente_id, lower(email)) where duplicado_de is null
  unique (fuente_id, id_externo) where id_externo is not null

perfiles          -- user_id (auth.users) pk, nombre, rol (admin|editor|lector)
perfil_fuentes    -- user_id, fuente_id (acceso de editor/lector)
importaciones     -- id, fuente_id, user_id, archivo, nuevas, actualizadas, errores, creado_en
filtros_guardados -- id, user_id, nombre, definicion jsonb
aplicaciones      -- id, nombre, clave_hash, permisos (leer|escribir), fuentes uuid[] null (null = todas),
                  -- webhook_url null, activa, ultimo_uso, creado_en
api_leads (vista) -- contrato estable que consume api-v1
```

Índices: `leads(fuente_id, created_at desc)`, `leads(lower(email))`,
`leads(status)`, GIN sobre `leads.extra`.

### Migración de la DB actual (sin pérdida de datos)

1. Crear tablas nuevas y columnas nuevas en `leads` (todas nullable al
   inicio).
2. Por cada valor distinto de `leads.evento` crear una fuente tipo
   `landing` (ej. "EXPOMINA Perú 2026", "Semana de Ingeniería Geológica"),
   con los campos del formulario actual de Expomina.
3. Asignar `fuente_id` según `evento`; luego `fuente_id` pasa a `not null`.
4. Duplicados existentes (mismo email en la misma fuente, permitidos desde
   la migración 008): el más reciente queda principal, los demás se marcan
   `duplicado_de` = id del principal. No se borra ninguna fila.
5. Crear índices únicos parciales.
6. `evento` se conserva como columna de solo lectura hasta que la landing
   Expomina use `ingresar-lead`; después se elimina en una migración aparte.
7. Crear el perfil `admin` para los usuarios actuales del panel.

Se prueba primero sobre una copia (backup `pg_dump`) antes de correr en
producción.

## 4. Módulos del dashboard

1. **Dashboard** — KPIs (total leads, nuevos hoy/semana, personas únicas,
   % contactados), gráficas ApexCharts: leads por día, por fuente, donut por
   estado, barras por rubro/cargo, embudo de estados. Filtro global por
   fuente y rango de fechas. Se calcula con funciones SQL (RPC) agregadas,
   no trayendo todas las filas al navegador.
2. **Leads** (tabla maestra de todas las fuentes) — búsqueda global; panel
   de filtros avanzados (fuente, estado, fechas, rubro, empresa, cargo,
   campos de `extra`); chips de filtros activos; filtros guardados;
   columnas mostrables y reordenables; orden; paginación server-side;
   edición en modal; acciones masivas (cambiar estado, exportar selección).
   **Importar**: asistente en 3 pasos — subir Excel/CSV → elegir fuente y
   mapear columnas a campos (lo no mapeado va a `extra`) → vista previa con
   errores y duplicados detectados → confirmar. Queda en `importaciones`.
   Detalle del mapeo (2026-09-28): cada columna se sugiere por sinónimo o por
   palabra ("Nombres / Contacto" → nombres, "Empresa / Cliente" → empresa);
   "Estado", "Evento" y "Fecha" (de registro) van a `status`, `evento` y
   `created_at`; toda columna sin campo propio se guarda como **columna
   adicional** (registro global `columnas_extra`, visible en tabla, filtros y
   exportación) salvo que se elija "Ignorar". Fechas en serial de Excel
   (46281), DD/MM/AAAA o "16-Sep-2026" se pasan a ISO; varios teléfonos o
   correos en una celda se separan (el resto va a "Teléfono 2"); DNI sin el
   cero inicial se completa a 8 dígitos. Los campos obligatorios del
   formulario de la fuente solo bloquean filas si se marca "Exigir…".
3. **Landings** — lista de fuentes tipo landing, botones "Nueva" y
   "Duplicar". Cada landing aparece en el menú con submenú:
   - **Gestionar**: nombre, dominio, estado, editor de campos del
     formulario, clave de envío (regenerar), correo de agradecimiento.
   - **Registros**: la misma tabla avanzada, filtrada a esa fuente y con
     las columnas de su formulario.
4. **Apps offline** — igual que Landings para fuentes tipo `offline`, con
   fecha de última sincronización.
5. **Exportación y conexiones** — exportar Excel/CSV con filtros y columnas
   elegidas; **Aplicaciones conectadas**: crear app (HUB, app offline, app
   futura), definir permisos y alcance, ver/regenerar/revocar clave, ver
   último uso; documentación de la API visible ahí mismo.
6. **Usuarios** (solo admin) — invitar, asignar rol y fuentes.

## 5. Flujos de datos

- **Landing → DB**: `POST ingresar-lead` con `{ slug, clave, datos }`.
  Valida contra `fuentes.campos`, separa núcleo/`extra`, upsert por
  (fuente, email), dispara correo de agradecimiento si está activo. La
  landing Expomina cambia su llamada de `register-lead` a `ingresar-lead`;
  `register-lead` se elimina cuando ya no reciba tráfico.
- **Importación**: el navegador parsea el archivo con `xlsx` (ya usado en
  Expomina), valida, y envía en lotes de 500 a una función RPC
  `importar_leads` que hace el upsert en una transacción por lote.
- **Apps offline → DB**: `POST sincronizar` con la clave de aplicación y un
  lote de registros con `id_externo`. Idempotente: reenviar el mismo lote no
  duplica. Respuesta: aceptados / rechazados con motivo.
- **DB → otras apps (HUB, futuras)**: `api-v1` con clave de aplicación:
  - `GET /leads` — filtros, paginación por cursor, `actualizado_desde` para
    sincronización incremental.
  - `GET /fuentes`
  - `POST /leads` — solo con permiso `escribir`.
  - Respuestas salen de la vista `api_leads`, limitadas al alcance de la app.
- **Webhooks**: al crear/actualizar un lead, se notifica a las apps con
  `webhook_url` cuyo alcance incluya esa fuente (firma HMAC en cabecera).

## 6. Manejo de errores

- Importación: filas inválidas no bloquean el lote; se listan con la causa
  en palabras (valor + qué se esperaba) y se descargan como **registro de
  fallas en Excel** (fila del archivo, causa, etapa, datos originales) para
  corregir y reimportar solo esas.
- Edge Functions: respuestas JSON con código de error estable
  (`campo_invalido`, `clave_invalida`, `fuente_cerrada`, `limite_excedido`).
- Webhooks: reintentos con espera creciente; fallos visibles en la app
  conectada.
- Dashboard: estados vacíos y de error en cada gráfica y tabla.

## 7. Pruebas

- Vitest: mapeo de columnas de importación, separación núcleo/`extra`,
  validación contra `campos`, deduplicación.
- Pruebas SQL de RLS: lector no escribe, editor solo ve sus fuentes, anon
  no lee nada, sin `aal2` no hay acceso.
- Migración: correr sobre copia de la DB y verificar que el conteo de filas
  antes = después.
- Edge Functions: pruebas de `ingresar-lead`, `sincronizar` (idempotencia)
  y `api-v1` (alcance de la clave).

## 8. Fases

Cada fase tiene su propio plan de implementación.

1. **Base** — `apps/leads` con shell Vireo, login + 2FA, roles y usuarios,
   migración de la DB Expomina, Landings (gestionar + registros), tabla
   Leads con filtros avanzados, Dashboard con gráficas, importar/exportar
   Excel/CSV, `ingresar-lead` con Expomina reconectada, tabla
   `aplicaciones` + `api-v1` de solo lectura.
2. **Conectores** — escritura por API, webhooks, integración del HUB como
   aplicación conectada.
3. **Offline** — `sincronizar` + guía para las apps offline.

## Fuera de alcance

- Constructor/CMS de landings (las landings siguen siendo código propio).
- Mover el HUB (NestJS) a esta DB: el HUB consume por `api-v1`.
- Automatizaciones de marketing (envío de campañas, scoring de leads).
