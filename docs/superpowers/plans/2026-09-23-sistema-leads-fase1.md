# Sistema de Leads — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App `apps/leads` (dashboard Vireo) sobre la DB Supabase de Expomina, con login + 2FA, roles, migración sin pérdida de datos, dashboard de gráficas, tabla de leads con filtros avanzados, importar/exportar Excel/CSV, módulo Landings (gestionar + registros), apps offline (listado), aplicaciones conectadas + API v1 de lectura, e ingreso de leads desde landings.

**Architecture:** Next.js 16 client-side app que habla con Supabase (Postgres + RLS + Auth MFA) vía `@supabase/supabase-js`. Toda regla de acceso vive en RLS; todo lo que entra/sale desde fuera del dashboard pasa por Edge Functions (Deno) con claves hasheadas. La lógica de normalización/validación de leads vive en un único archivo TS (`supabase/functions/_shared/lead.ts`) usado por la app (import relativo) y por las Edge Functions.

**Tech Stack:** Next.js 16 + React 19 + Tailwind v4 + ApexCharts (shell Vireo copiado de `apps/web`), `@supabase/supabase-js` 2, SheetJS `xlsx` 0.20.3, Vitest, Supabase CLI 2.x + Docker (stack local), pgTAP (`supabase test db`).

**Spec:** [`docs/superpowers/specs/2026-09-23-sistema-leads-design.md`](../specs/2026-09-23-sistema-leads-design.md)

## Global Constraints

- DB: proyecto Supabase `qpjxwtvmuqramhqoxkxj` (Expomina). No se crea otra DB. **Ninguna fila existente de `leads` se borra.**
- A partir de este plan, la **única** fuente de verdad de migraciones y Edge Functions de esa DB es `apps/leads/supabase/` en este repo. El repo `landing-registro-expomina` deja de desplegar migraciones/funciones.
- Nombres de tablas, columnas, rutas y textos de UI en **español**; nombres técnicos internos en inglés donde ya es norma.
- `apps/leads` es proyecto npm independiente (sin workspace raíz). npm, no pnpm/yarn. Puerto **3003**.
- 2FA TOTP obligatorio: toda política RLS de datos exige `aal2`.
- Claves (fuentes y aplicaciones) se guardan solo como hash SHA-256; el valor en claro se muestra una sola vez.
- Correo de agradecimiento: solo para leads **nuevos** que entran por `ingresar-lead` de una fuente con `correo_gracias.activo = true`. Nunca por importación.
- Zona horaria de reportes: `America/Lima`.
- Secrets en `.env.local` (gitignorado) / secrets de Supabase. Nunca en código ni en `.env.example`.
- Pasos contra la DB de **producción** (Task 17) requieren confirmación explícita del usuario antes de ejecutarse.

---

## File Structure

```
apps/leads/
  package.json, tsconfig.json, next.config.ts, postcss.config.mjs, vitest.config.ts
  .env.example                      NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
  middleware.ts                     redirección por cookie ax_session (copiado de apps/web)
  app/
    layout.tsx                      root (copiado de apps/web, textos cambiados)
    (bare)/auth/sign-in/page.tsx
    (bare)/auth/two-step-totp/page.tsx
    (bare)/auth/activar-2fa/page.tsx
    (bare)/auth/crear-clave/page.tsx
    (bare)/error/{403,404}/page.tsx
    (shell)/layout.tsx              RequireAuth + Layout
    (shell)/page.tsx                Dashboard
    (shell)/leads/page.tsx          Tabla maestra
    (shell)/leads/importar/page.tsx Asistente de importación
    (shell)/landings/page.tsx       Lista fuentes tipo landing
    (shell)/landings/[slug]/page.tsx            Gestionar
    (shell)/landings/[slug]/registros/page.tsx  Registros
    (shell)/offline/page.tsx
    (shell)/offline/[slug]/page.tsx
    (shell)/offline/[slug]/registros/page.tsx
    (shell)/exportacion/page.tsx    Exportar + aplicaciones conectadas
    (shell)/usuarios/page.tsx
  src/
    styles/, components/ui/, components/shell/, components/charts/, hooks/, lib/{color,fonts,storage,theme,manifest,pageMetadata}.ts
                                    copiados de apps/web
    data/nav-manifest.json          menú del sistema de leads
    lib/supabase.ts                 cliente único
    lib/leads/filtros.ts            modelo de filtro → query PostgREST (puro, testeado)
    lib/leads/mapeo.ts              sugerir mapeo columnas→campos + construir filas (puro, testeado)
    lib/leads/exportar.ts           descarga Excel/CSV
    lib/leads/datos.ts              funciones de acceso (listar, actualizar, fuentes, etc.)
    context/AuthContext.tsx         Supabase Auth + MFA + perfil/rol
    components/auth/RequireAuth.tsx
    components/leads/LeadsTable.tsx
    components/leads/FiltrosPanel.tsx
    components/leads/ChipsFiltros.tsx
    components/leads/ColumnasMenu.tsx
    components/leads/EditarLeadModal.tsx
    components/fuentes/FuentesLista.tsx
    components/fuentes/GestionarFuente.tsx
    components/fuentes/CamposEditor.tsx
    screens/Dashboard.tsx, Importar.tsx, Exportacion.tsx, Usuarios.tsx
    screens/auth/{SignIn,TwoStepTotp,Activar2fa,CrearClave}.tsx, authShared.tsx
  supabase/
    config.toml
    migrations/20260901000000_baseline_expomina.sql     schema.sql + 002..008 de Expomina
    migrations/20260923000001_fuentes_y_leads.sql
    migrations/20260923000002_rls.sql
    migrations/20260923000003_funciones.sql
    tests/*.test.sql                pgTAP
    functions/_shared/lead.ts       normalización + validación (compartido)
    functions/_shared/lead.test.ts  Vitest
    functions/_shared/http.ts       cors/json/hash helpers
    functions/ingresar-lead/index.ts
    functions/api-v1/index.ts
    functions/admin-usuarios/index.ts
    functions/send-thank-you/index.ts  movido desde Expomina + override asunto/html
```

---

### Task 1: Supabase local con baseline de Expomina

**Files:**
- Create: `apps/leads/supabase/config.toml` (vía `supabase init`)
- Create: `apps/leads/supabase/migrations/20260901000000_baseline_expomina.sql`
- Create: `apps/leads/supabase/functions/send-thank-you/index.ts` (copia)
- Create: `apps/leads/supabase/tests/baseline.test.sql`

**Interfaces:**
- Produces: stack local con la tabla `public.leads` idéntica a producción (columnas: `id, created_at, nombres, apellido, cargo, ruc, empresa, rubro, telefono, email, origen, status, user_agent, evento, fecha_nacimiento`), enum `lead_status`, trigger `trg_notify_thank_you_email`.

- [ ] **Step 1: Inicializar proyecto Supabase**

```bash
mkdir -p apps/leads && cd apps/leads && supabase init
```
Expected: crea `supabase/config.toml`. En `config.toml` poner `project_id = "leads"` y en `[auth]` `site_url = "http://localhost:3003"`, `additional_redirect_urls = ["http://localhost:3003/auth/crear-clave"]`; en `[auth.mfa.totp]` `enroll_enabled = true` y `verify_enabled = true`.

- [ ] **Step 2: Crear baseline concatenando las migraciones de Expomina en orden**

```bash
E="../../../landing-registro-expomina/supabase"
cat $E/schema.sql $E/migrations/002_add_apellido.sql $E/migrations/003_grant_table_privileges.sql \
    $E/migrations/004_unique_email.sql $E/migrations/005_lockdown_anon_insert.sql \
    $E/migrations/006_thank_you_webhook.sql $E/migrations/007_add_user_agent.sql \
    $E/migrations/008_evento_birthdate_allow_repeat.sql \
  > supabase/migrations/20260901000000_baseline_expomina.sql
cp -r $E/functions/send-thank-you supabase/functions/
```
Abrir el baseline y verificar que no hay `create policy` duplicados que choquen (005 hace `drop policy`, está bien).

- [ ] **Step 3: Escribir test pgTAP del baseline**

`apps/leads/supabase/tests/baseline.test.sql`:
```sql
begin;
select plan(3);
select has_table('public', 'leads', 'tabla leads existe');
select has_column('public', 'leads', 'evento', 'leads.evento existe');
select has_column('public', 'leads', 'fecha_nacimiento', 'leads.fecha_nacimiento existe');
select * from finish();
rollback;
```

- [ ] **Step 4: Levantar stack y correr tests**

```bash
supabase start && supabase db reset && supabase test db
```
Expected: `baseline.test.sql .. ok`, `All tests successful.`

- [ ] **Step 5: Commit**

```bash
git add apps/leads/supabase
git commit -m "chore(leads): supabase local con baseline de la DB Expomina"
```

---

### Task 2: Migración de esquema — fuentes y leads (sin pérdida)

**Files:**
- Create: `apps/leads/supabase/migrations/20260923000001_fuentes_y_leads.sql`
- Create: `apps/leads/supabase/seed.sql`
- Test: `apps/leads/supabase/tests/migracion.test.sql`

**Interfaces:**
- Consumes: baseline Task 1.
- Produces: tablas `fuentes, perfiles, perfil_fuentes, importaciones, filtros_guardados, aplicaciones`; columnas nuevas en `leads`: `fuente_id uuid not null`, `extra jsonb`, `actualizado_en timestamptz`, `duplicado_de uuid`, `id_externo text`; vista `api_leads`; trigger `trg_notify_thank_you_email` **eliminado**.

- [ ] **Step 1: Seed con datos que reproducen producción (2 eventos + duplicados)**

`apps/leads/supabase/seed.sql`:
```sql
-- Solo para el stack local: simula la data de producción antes de la migración.
-- Ojo: se ejecuta DESPUÉS de todas las migraciones en `supabase db reset`, por
-- eso el test de migración (Step 2) inserta su propia data dentro de la
-- transacción en vez de depender de este seed.
insert into public.fuentes (nombre, slug, tipo) values ('Demo local', 'demo-local', 'importacion')
on conflict do nothing;
```

- [ ] **Step 2: Test pgTAP que corre la lógica de backfill sobre filas pre-migración**

La migración define la función `public._backfill_fuentes()` (idempotente) que se llama una vez al final de la migración; el test la vuelve a ejecutar sobre filas insertadas con `fuente_id` nulo temporalmente.

`apps/leads/supabase/tests/migracion.test.sql`:
```sql
begin;
select plan(7);

alter table public.leads alter column fuente_id drop not null;
-- El índice único existe ya en el esquema final; aquí simulamos el estado
-- previo a la migración, donde todavía no estaba.
drop index public.leads_fuente_email_uq;
delete from public.leads;
insert into public.leads (nombres, apellido, cargo, ruc, empresa, rubro, telefono, email, evento, created_at) values
  ('Ana','Ruiz','Jefe','12345678','Mina A','Minería','987654321','ana@x.com','EXPOMINA Perú 2026', now() - interval '3 days'),
  ('Ana','Ruiz','Gerente','12345678','Mina A','Minería','987654321','ANA@x.com','EXPOMINA Perú 2026', now() - interval '1 day'),
  ('Luis','Paz','Geólogo','87654321','','Geología','912345678','luis@x.com','Semana de Ingeniería Geológica', now()),
  ('Ana','Ruiz','Jefe','12345678','Mina A','Minería','987654321','ana@x.com','Semana de Ingeniería Geológica', now());

select public._backfill_fuentes();

select is((select count(*)::int from public.leads), 4, 'no se pierde ninguna fila');
select is((select count(*)::int from public.fuentes where tipo = 'landing'), 2, 'una fuente por evento');
select ok((select slug from public.fuentes where nombre = 'Semana de Ingeniería Geológica') = 'semana-de-ingenieria-geologica', 'slug sin tildes');
select is((select count(*)::int from public.leads where fuente_id is null), 0, 'toda fila tiene fuente');
select is((select count(*)::int from public.leads where duplicado_de is not null), 1, 'solo el registro viejo de Ana en EXPOMINA es duplicado');
select ok((select cargo from public.leads where duplicado_de is null and lower(email) = 'ana@x.com'
           and fuente_id = (select id from public.fuentes where slug = 'expomina-peru-2026')) = 'Gerente', 'el más reciente queda principal');
select is((select count(*)::int from public.leads where lower(email) = 'ana@x.com' and duplicado_de is null), 2, 'Ana existe en 2 fuentes distintas');

select * from finish();
rollback;
```

- [ ] **Step 3: Correr el test para ver que falla**

Run: `supabase test db`
Expected: FAIL — `relation "public.fuentes" does not exist`.

- [ ] **Step 4: Escribir la migración**

`apps/leads/supabase/migrations/20260923000001_fuentes_y_leads.sql`:
```sql
create extension if not exists pgcrypto with schema extensions;

-- Ya no se manda correo en cada INSERT (una importación mandaría miles).
-- Lo hace ingresar-lead solo para leads nuevos de fuentes con correo activo.
drop trigger if exists trg_notify_thank_you_email on public.leads;
drop function if exists public.notify_thank_you_email();

create table public.fuentes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tipo text not null check (tipo in ('landing', 'offline', 'importacion')),
  dominio text,
  estado text not null default 'activa' check (estado in ('activa', 'cerrada')),
  campos jsonb not null default '[]'::jsonb,
  clave_hash text,
  correo_gracias jsonb,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.perfiles (
  user_id uuid primary key references auth.users on delete cascade,
  nombre text not null default '',
  rol text not null default 'lector' check (rol in ('admin', 'editor', 'lector')),
  creado_en timestamptz not null default now()
);

create table public.perfil_fuentes (
  user_id uuid not null references public.perfiles on delete cascade,
  fuente_id uuid not null references public.fuentes on delete cascade,
  primary key (user_id, fuente_id)
);

create table public.importaciones (
  id uuid primary key default gen_random_uuid(),
  fuente_id uuid not null references public.fuentes on delete cascade,
  user_id uuid not null references auth.users,
  archivo text not null,
  nuevas int not null default 0,
  actualizadas int not null default 0,
  errores int not null default 0,
  creado_en timestamptz not null default now()
);

create table public.filtros_guardados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nombre text not null,
  definicion jsonb not null,
  creado_en timestamptz not null default now()
);

create table public.aplicaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  clave_hash text not null unique,
  permisos text[] not null default array['leer'] check (permisos <@ array['leer', 'escribir']),
  fuentes uuid[],               -- null = todas las fuentes
  webhook_url text,
  activa boolean not null default true,
  ultimo_uso timestamptz,
  creado_en timestamptz not null default now()
);

-- Columnas nuevas en leads. Las núcleo antiguas pasan a nullable: un Excel
-- importado o una landing nueva no siempre trae cargo/rubro/RUC.
alter table public.leads
  add column fuente_id uuid references public.fuentes,
  add column extra jsonb not null default '{}'::jsonb,
  add column actualizado_en timestamptz not null default now(),
  add column duplicado_de uuid references public.leads,
  add column id_externo text,
  alter column nombres drop not null,
  alter column apellido drop not null,
  alter column cargo drop not null,
  alter column ruc drop not null,
  alter column empresa drop not null,
  alter column rubro drop not null,
  alter column telefono drop not null,
  alter column email drop not null,
  alter column origen set default 'dashboard';

create or replace function public.tocar_actualizado_en() returns trigger
language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end $$;

create trigger trg_leads_actualizado before update on public.leads
  for each row execute function public.tocar_actualizado_en();
create trigger trg_fuentes_actualizado before update on public.fuentes
  for each row execute function public.tocar_actualizado_en();

create or replace function public.slugify(t text) returns text
language sql immutable as $$
  select trim(both '-' from regexp_replace(
    lower(translate(t, 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
    '[^a-z0-9]+', '-', 'g'))
$$;

-- Campos del formulario actual de Expomina (register-lead).
create or replace function public._campos_expomina() returns jsonb
language sql immutable as $$
  select '[
    {"key":"nombres","label":"Nombres","tipo":"texto","requerido":true},
    {"key":"apellido","label":"Apellido","tipo":"texto","requerido":true},
    {"key":"cargo","label":"Cargo","tipo":"texto","requerido":true},
    {"key":"ruc","label":"RUC / DNI","tipo":"documento","requerido":true},
    {"key":"empresa","label":"Empresa","tipo":"texto","requerido":false},
    {"key":"rubro","label":"Rubro","tipo":"texto","requerido":true},
    {"key":"telefono","label":"Teléfono","tipo":"telefono","requerido":true},
    {"key":"email","label":"Correo","tipo":"email","requerido":true},
    {"key":"fecha_nacimiento","label":"Fecha de nacimiento","tipo":"fecha","requerido":false}
  ]'::jsonb
$$;

-- Idempotente: se puede correr de nuevo sin efectos extra.
create or replace function public._backfill_fuentes() returns void
language plpgsql as $$
begin
  insert into public.fuentes (nombre, slug, tipo, dominio, campos)
  select distinct l.evento, public.slugify(l.evento), 'landing', 'registro.fptecnologi.com', public._campos_expomina()
  from public.leads l
  where l.fuente_id is null
  on conflict (slug) do nothing;

  update public.leads l set fuente_id = f.id
  from public.fuentes f
  where l.fuente_id is null and f.slug = public.slugify(l.evento);

  -- Mismo email en la misma fuente: el más reciente queda principal.
  with ranked as (
    select id, first_value(id) over (
      partition by fuente_id, lower(email) order by created_at desc, id desc) as principal
    from public.leads
    where email is not null and email <> ''
  )
  update public.leads l set duplicado_de = r.principal
  from ranked r
  where l.id = r.id and r.principal <> l.id and l.duplicado_de is distinct from r.principal;
end $$;

select public._backfill_fuentes();

alter table public.leads alter column fuente_id set not null;

create unique index leads_fuente_email_uq on public.leads (fuente_id, lower(email))
  where duplicado_de is null and email is not null and email <> '';
create unique index leads_fuente_id_externo_uq on public.leads (fuente_id, id_externo)
  where id_externo is not null;
create index leads_fuente_created_idx on public.leads (fuente_id, created_at desc);
create index leads_status_idx on public.leads (status);
create index leads_extra_gin on public.leads using gin (extra);
create index leads_actualizado_idx on public.leads (actualizado_en, id);

-- Contrato estable para apps externas (api-v1). Cambiar tablas internas
-- no debe cambiar esta vista sin versionar la API.
create view public.api_leads with (security_invoker = true) as
select l.id, f.slug as fuente, l.nombres, l.apellido, l.email, l.telefono, l.empresa,
       l.ruc, l.cargo, l.rubro, l.fecha_nacimiento, l.status::text as estado, l.extra,
       l.created_at as creado_en, l.actualizado_en
from public.leads l
join public.fuentes f on f.id = l.fuente_id
where l.duplicado_de is null;
```

- [ ] **Step 5: Correr tests**

Run: `supabase db reset && supabase test db`
Expected: `migracion.test.sql .. ok` (7/7), baseline ok.

- [ ] **Step 6: Commit**

```bash
git add apps/leads/supabase
git commit -m "feat(leads): esquema fuentes/perfiles/aplicaciones y backfill de Expomina sin pérdida"
```

---

### Task 3: RLS con roles y 2FA obligatorio

**Files:**
- Create: `apps/leads/supabase/migrations/20260923000002_rls.sql`
- Test: `apps/leads/supabase/tests/rls.test.sql`

**Interfaces:**
- Consumes: tablas de Task 2.
- Produces: funciones `public.mi_rol() → text`, `public.mfa_ok() → boolean`, `public.puede_ver_fuente(uuid) → boolean`, `public.puede_editar_fuente(uuid) → boolean`; políticas en todas las tablas.

- [ ] **Step 1: Test pgTAP de permisos**

`apps/leads/supabase/tests/rls.test.sql`:
```sql
begin;
select plan(9);

-- usuarios de prueba
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@t.com'),
  ('00000000-0000-0000-0000-00000000000e', 'editor@t.com'),
  ('00000000-0000-0000-0000-00000000000c', 'lector@t.com');
insert into public.perfiles (user_id, rol) values
  ('00000000-0000-0000-0000-00000000000a', 'admin'),
  ('00000000-0000-0000-0000-00000000000e', 'editor'),
  ('00000000-0000-0000-0000-00000000000c', 'lector');
insert into public.fuentes (id, nombre, slug, tipo) values
  ('10000000-0000-0000-0000-000000000001', 'F1', 'f1', 'landing'),
  ('10000000-0000-0000-0000-000000000002', 'F2', 'f2', 'landing');
insert into public.perfil_fuentes values
  ('00000000-0000-0000-0000-00000000000e', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000001');
insert into public.leads (fuente_id, email) values
  ('10000000-0000-0000-0000-000000000001', 'a@f1.com'),
  ('10000000-0000-0000-0000-000000000002', 'b@f2.com');

create function pg_temp.como(uid text, aal text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'aal', aal, 'role', 'authenticated')::text, true);
$$;

set local role authenticated;

select pg_temp.como('00000000-0000-0000-0000-00000000000a', 'aal1');
select is((select count(*)::int from public.leads), 0, 'sin 2FA (aal1) no ve nada');

select pg_temp.como('00000000-0000-0000-0000-00000000000a', 'aal2');
select is((select count(*)::int from public.leads where email in ('a@f1.com','b@f2.com')), 2, 'admin ve todas las fuentes');

select pg_temp.como('00000000-0000-0000-0000-00000000000e', 'aal2');
select is((select count(*)::int from public.leads where email in ('a@f1.com','b@f2.com')), 1, 'editor solo ve su fuente');
select lives_ok($$ update public.leads set cargo = 'X' where email = 'a@f1.com' $$, 'editor edita su fuente');
select throws_ok($$ insert into public.leads (fuente_id, email) values ('10000000-0000-0000-0000-000000000002', 'z@z.com') $$,
  '42501', null, 'editor no inserta en fuente ajena');
select throws_ok($$ insert into public.fuentes (nombre, slug, tipo) values ('X','x','landing') $$,
  '42501', null, 'editor no crea fuentes');

select pg_temp.como('00000000-0000-0000-0000-00000000000c', 'aal2');
select is((select count(*)::int from public.leads where email in ('a@f1.com','b@f2.com')), 1, 'lector ve su fuente');
update public.leads set cargo = 'Y' where email = 'a@f1.com';
select is((select cargo from public.leads where email = 'a@f1.com'), 'X', 'lector no puede actualizar');

reset role;
set local role anon;
select is((select count(*)::int from public.leads), 0, 'anon no ve nada');

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y ver que falla**

Run: `supabase test db`
Expected: FAIL (sin RLS nueva, `aal1` ve filas; políticas viejas "Autenticados pueden ver leads").

- [ ] **Step 3: Escribir la migración RLS**

`apps/leads/supabase/migrations/20260923000002_rls.sql`:
```sql
-- Políticas antiguas de Expomina: cualquier autenticado veía/editaba todo.
drop policy if exists "Autenticados pueden ver leads" on public.leads;
drop policy if exists "Autenticados pueden actualizar leads" on public.leads;
drop policy if exists "Autenticados pueden borrar leads" on public.leads;
drop policy if exists "Público puede registrar su asistencia" on public.leads;

create or replace function public.mfa_ok() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
$$;

create or replace function public.mi_rol() returns text
language sql stable security definer set search_path = public as $$
  select rol from public.perfiles where user_id = auth.uid()
$$;

create or replace function public.puede_ver_fuente(f uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.mfa_ok() and (
    public.mi_rol() = 'admin'
    or exists (select 1 from public.perfil_fuentes pf where pf.user_id = auth.uid() and pf.fuente_id = f)
  )
$$;

create or replace function public.puede_editar_fuente(f uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.mfa_ok() and (
    public.mi_rol() = 'admin'
    or (public.mi_rol() = 'editor'
        and exists (select 1 from public.perfil_fuentes pf where pf.user_id = auth.uid() and pf.fuente_id = f))
  )
$$;

create or replace function public.es_admin() returns boolean
language sql stable as $$ select public.mfa_ok() and public.mi_rol() = 'admin' $$;

alter table public.fuentes enable row level security;
alter table public.perfiles enable row level security;
alter table public.perfil_fuentes enable row level security;
alter table public.importaciones enable row level security;
alter table public.filtros_guardados enable row level security;
alter table public.aplicaciones enable row level security;

create policy leads_sel on public.leads for select to authenticated using (public.puede_ver_fuente(fuente_id));
create policy leads_ins on public.leads for insert to authenticated with check (public.puede_editar_fuente(fuente_id));
create policy leads_upd on public.leads for update to authenticated
  using (public.puede_editar_fuente(fuente_id)) with check (public.puede_editar_fuente(fuente_id));
create policy leads_del on public.leads for delete to authenticated using (public.es_admin());

create policy fuentes_sel on public.fuentes for select to authenticated using (public.puede_ver_fuente(id));
create policy fuentes_adm on public.fuentes for all to authenticated using (public.es_admin()) with check (public.es_admin());

create policy perfiles_sel on public.perfiles for select to authenticated using (user_id = auth.uid() or public.es_admin());
create policy perfiles_adm on public.perfiles for all to authenticated using (public.es_admin()) with check (public.es_admin());

create policy pf_sel on public.perfil_fuentes for select to authenticated using (user_id = auth.uid() or public.es_admin());
create policy pf_adm on public.perfil_fuentes for all to authenticated using (public.es_admin()) with check (public.es_admin());

create policy imp_sel on public.importaciones for select to authenticated using (public.puede_ver_fuente(fuente_id));
create policy imp_ins on public.importaciones for insert to authenticated
  with check (user_id = auth.uid() and public.puede_editar_fuente(fuente_id));

create policy fg_own on public.filtros_guardados for all to authenticated
  using (user_id = auth.uid() and public.mfa_ok()) with check (user_id = auth.uid() and public.mfa_ok());

create policy apps_adm on public.aplicaciones for all to authenticated using (public.es_admin()) with check (public.es_admin());

revoke all on public.leads, public.fuentes, public.perfiles, public.perfil_fuentes,
  public.importaciones, public.filtros_guardados, public.aplicaciones, public.api_leads from anon;
grant select, insert, update, delete on public.leads, public.fuentes, public.perfiles, public.perfil_fuentes,
  public.filtros_guardados, public.aplicaciones to authenticated;
grant select, insert on public.importaciones to authenticated;
revoke all on public.api_leads from authenticated;
```

- [ ] **Step 4: Correr tests**

Run: `supabase db reset && supabase test db`
Expected: `rls.test.sql .. ok` (9/9), resto ok.

- [ ] **Step 5: Commit**

```bash
git add apps/leads/supabase
git commit -m "feat(leads): RLS por rol y fuente con 2FA (aal2) obligatorio"
```

---

### Task 4: Funciones SQL — upsert, importación, dashboard, claves

**Files:**
- Create: `apps/leads/supabase/migrations/20260923000003_funciones.sql`
- Test: `apps/leads/supabase/tests/funciones.test.sql`

**Interfaces:**
- Produces (RPC):
  - `upsert_lead(p_fuente uuid, p jsonb) → text` (`'nueva' | 'actualizada'`). `p` = `{ nombres?, apellido?, email?, telefono?, empresa?, ruc?, cargo?, rubro?, fecha_nacimiento?, extra?: object, id_externo?, origen?, user_agent? }`. Solo `service_role` y funciones internas.
  - `importar_leads(p_fuente uuid, p_filas jsonb, p_archivo text) → jsonb` `{ nuevas:int, actualizadas:int, errores:[{fila:int, motivo:text}] }`. Invoker; exige `puede_editar_fuente`.
  - `dashboard_resumen(p_fuentes uuid[] default null, p_desde date default null, p_hasta date default null) → jsonb` `{ total, personas_unicas, hoy, semana, contactados, por_dia:[{dia,n}], por_fuente:[{fuente,n}], por_estado:[{estado,n}], por_rubro:[{rubro,n}], por_cargo:[{cargo,n}] }`.
  - `regenerar_clave_fuente(p_fuente uuid) → text` (clave en claro `pub_…`, admin).
  - `crear_aplicacion(p_nombre text, p_permisos text[], p_fuentes uuid[]) → jsonb` `{ id, clave }` (clave `app_…`, admin).
  - `regenerar_clave_aplicacion(p_app uuid) → text` (admin).
  - `duplicar_fuente(p_fuente uuid, p_nombre text, p_slug text) → uuid` (admin).
  - `hash_clave(text) → text` (sha256 hex; lo usan las Edge Functions para comparar).

- [ ] **Step 1: Test pgTAP**

`apps/leads/supabase/tests/funciones.test.sql`:
```sql
begin;
select plan(8);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'admin@t.com');
insert into public.perfiles (user_id, rol) values ('00000000-0000-0000-0000-00000000000a', 'admin');
insert into public.fuentes (id, nombre, slug, tipo) values ('20000000-0000-0000-0000-000000000001', 'Imp', 'imp', 'importacion');

select is(public.upsert_lead('20000000-0000-0000-0000-000000000001', '{"email":"X@y.com","nombres":"Ana","extra":{"ciudad":"Lima"}}'), 'nueva', 'primer upsert crea');
select is(public.upsert_lead('20000000-0000-0000-0000-000000000001', '{"email":"x@Y.com","cargo":"Jefe","extra":{"talla":"M"}}'), 'actualizada', 'mismo email misma fuente actualiza');
select is((select extra from public.leads where lower(email) = 'x@y.com'), '{"ciudad":"Lima","talla":"M"}'::jsonb, 'extra se fusiona');
select is((select nombres from public.leads where lower(email) = 'x@y.com'), 'Ana', 'campos no enviados se conservan');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","aal":"aal2","role":"authenticated"}', true);

select is(
  (public.importar_leads('20000000-0000-0000-0000-000000000001',
     '[{"email":"n1@y.com"},{"email":"x@y.com","rubro":"Minería"},{"fecha_nacimiento":"no-es-fecha","email":"e@y.com"}]', 'a.xlsx')
  ) - 'errores',
  '{"nuevas":1,"actualizadas":1}'::jsonb, 'importar cuenta nuevas/actualizadas');
select is((select count(*)::int from public.importaciones), 1, 'importación registrada');
select ok((public.dashboard_resumen() ->> 'total')::int >= 2, 'dashboard devuelve total');

select ok(public.regenerar_clave_fuente('20000000-0000-0000-0000-000000000001') like 'pub\_%', 'clave con prefijo pub_');

select * from finish();
rollback;
```

- [ ] **Step 2: Correr y ver que falla**

Run: `supabase test db` → Expected: FAIL `function public.upsert_lead(...) does not exist`.

- [ ] **Step 3: Escribir la migración**

`apps/leads/supabase/migrations/20260923000003_funciones.sql`:
```sql
create or replace function public.hash_clave(c text) returns text
language sql immutable set search_path = public, extensions as $$
  select encode(extensions.digest(c, 'sha256'), 'hex')
$$;

-- ponytail: carrera entre dos inserts simultáneos del mismo email la corta el
-- índice único (el segundo falla y el llamador reintenta); sin lock explícito.
create or replace function public.upsert_lead(p_fuente uuid, p jsonb) returns text
language plpgsql set search_path = public as $$
declare
  v_email text := nullif(lower(trim(p ->> 'email')), '');
  v_ext text := nullif(p ->> 'id_externo', '');
  v_id uuid;
begin
  select id into v_id from leads
  where fuente_id = p_fuente and duplicado_de is null
    and ((v_email is not null and lower(email) = v_email)
      or (v_ext is not null and id_externo = v_ext))
  limit 1;

  if v_id is not null then
    update leads set
      nombres = coalesce(nullif(p ->> 'nombres', ''), nombres),
      apellido = coalesce(nullif(p ->> 'apellido', ''), apellido),
      telefono = coalesce(nullif(p ->> 'telefono', ''), telefono),
      empresa = coalesce(nullif(p ->> 'empresa', ''), empresa),
      ruc = coalesce(nullif(p ->> 'ruc', ''), ruc),
      cargo = coalesce(nullif(p ->> 'cargo', ''), cargo),
      rubro = coalesce(nullif(p ->> 'rubro', ''), rubro),
      fecha_nacimiento = coalesce(nullif(p ->> 'fecha_nacimiento', '')::date, fecha_nacimiento),
      extra = extra || coalesce(p -> 'extra', '{}'::jsonb),
      id_externo = coalesce(id_externo, v_ext)
    where id = v_id;
    return 'actualizada';
  end if;

  insert into leads (fuente_id, nombres, apellido, email, telefono, empresa, ruc, cargo, rubro,
                     fecha_nacimiento, extra, id_externo, origen, user_agent)
  values (p_fuente, nullif(p ->> 'nombres', ''), nullif(p ->> 'apellido', ''), v_email,
          nullif(p ->> 'telefono', ''), nullif(p ->> 'empresa', ''), nullif(p ->> 'ruc', ''),
          nullif(p ->> 'cargo', ''), nullif(p ->> 'rubro', ''),
          nullif(p ->> 'fecha_nacimiento', '')::date, coalesce(p -> 'extra', '{}'::jsonb), v_ext,
          coalesce(nullif(p ->> 'origen', ''), 'dashboard'), nullif(p ->> 'user_agent', ''));
  return 'nueva';
end $$;

revoke execute on function public.upsert_lead(uuid, jsonb) from public, anon, authenticated;

-- Security definer (para poder llamar upsert_lead, que authenticated no puede
-- ejecutar). RLS no aplica aquí: el chequeo puede_editar_fuente va primero y es obligatorio.
create or replace function public.importar_leads(p_fuente uuid, p_filas jsonb, p_archivo text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_fila jsonb;
  v_i int := 0;
  v_res text;
  v_nuevas int := 0;
  v_act int := 0;
  v_err jsonb := '[]'::jsonb;
begin
  if not public.puede_editar_fuente(p_fuente) then
    raise exception 'sin_permiso' using errcode = '42501';
  end if;
  for v_fila in select * from jsonb_array_elements(p_filas) loop
    v_i := v_i + 1;
    begin
      v_res := public.upsert_lead(p_fuente, v_fila || '{"origen":"importacion"}');
      if v_res = 'nueva' then v_nuevas := v_nuevas + 1; else v_act := v_act + 1; end if;
    exception when others then
      v_err := v_err || jsonb_build_object('fila', v_i, 'motivo', sqlerrm);
    end;
  end loop;
  insert into importaciones (fuente_id, user_id, archivo, nuevas, actualizadas, errores)
  values (p_fuente, auth.uid(), p_archivo, v_nuevas, v_act, jsonb_array_length(v_err));
  return jsonb_build_object('nuevas', v_nuevas, 'actualizadas', v_act, 'errores', v_err);
end $$;

create or replace function public.dashboard_resumen(
  p_fuentes uuid[] default null, p_desde date default null, p_hasta date default null
) returns jsonb
language sql stable set search_path = public as $$
  with base as (
    select l.*, (l.created_at at time zone 'America/Lima')::date as dia
    from leads l
    where l.duplicado_de is null
      and (p_fuentes is null or l.fuente_id = any(p_fuentes))
      and (p_desde is null or (l.created_at at time zone 'America/Lima')::date >= p_desde)
      and (p_hasta is null or (l.created_at at time zone 'America/Lima')::date <= p_hasta)
  ),
  hoy as (select (now() at time zone 'America/Lima')::date as d)
  select jsonb_build_object(
    'total', (select count(*) from base),
    'personas_unicas', (select count(distinct lower(email)) from base where email is not null),
    'hoy', (select count(*) from base, hoy where base.dia = hoy.d),
    'semana', (select count(*) from base, hoy where base.dia > hoy.d - 7),
    'contactados', (select count(*) from base where status <> 'nuevo'),
    'por_dia', (select coalesce(jsonb_agg(jsonb_build_object('dia', dia, 'n', n) order by dia), '[]')
                from (select dia, count(*) n from base group by dia) x),
    'por_fuente', (select coalesce(jsonb_agg(jsonb_build_object('fuente', f.nombre, 'n', x.n) order by x.n desc), '[]')
                   from (select fuente_id, count(*) n from base group by fuente_id) x join fuentes f on f.id = x.fuente_id),
    'por_estado', (select coalesce(jsonb_agg(jsonb_build_object('estado', status, 'n', n)), '[]')
                   from (select status, count(*) n from base group by status) x),
    'por_rubro', (select coalesce(jsonb_agg(jsonb_build_object('rubro', rubro, 'n', n) order by n desc), '[]')
                  from (select coalesce(nullif(rubro, ''), 'Sin rubro') rubro, count(*) n from base group by 1 order by 2 desc limit 10) x),
    'por_cargo', (select coalesce(jsonb_agg(jsonb_build_object('cargo', cargo, 'n', n) order by n desc), '[]')
                  from (select coalesce(nullif(cargo, ''), 'Sin cargo') cargo, count(*) n from base group by 1 order by 2 desc limit 10) x)
  )
$$;

create or replace function public._nueva_clave(prefijo text) returns text
language sql volatile set search_path = public, extensions as $$
  select prefijo || encode(extensions.gen_random_bytes(24), 'hex')
$$;

create or replace function public.regenerar_clave_fuente(p_fuente uuid) returns text
language plpgsql security definer set search_path = public as $$
declare v text := public._nueva_clave('pub_');
begin
  if not public.es_admin() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  update fuentes set clave_hash = public.hash_clave(v) where id = p_fuente;
  return v;
end $$;

create or replace function public.crear_aplicacion(p_nombre text, p_permisos text[], p_fuentes uuid[]) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v text := public._nueva_clave('app_'); v_id uuid;
begin
  if not public.es_admin() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  insert into aplicaciones (nombre, clave_hash, permisos, fuentes)
  values (p_nombre, public.hash_clave(v), p_permisos, p_fuentes) returning id into v_id;
  return jsonb_build_object('id', v_id, 'clave', v);
end $$;

create or replace function public.regenerar_clave_aplicacion(p_app uuid) returns text
language plpgsql security definer set search_path = public as $$
declare v text := public._nueva_clave('app_');
begin
  if not public.es_admin() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  update aplicaciones set clave_hash = public.hash_clave(v) where id = p_app;
  return v;
end $$;

create or replace function public.duplicar_fuente(p_fuente uuid, p_nombre text, p_slug text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.es_admin() then raise exception 'sin_permiso' using errcode = '42501'; end if;
  insert into fuentes (nombre, slug, tipo, dominio, campos, correo_gracias)
  select p_nombre, p_slug, tipo, dominio, campos, correo_gracias from fuentes where id = p_fuente
  returning id into v_id;
  return v_id;
end $$;

grant execute on function public.importar_leads(uuid, jsonb, text), public.dashboard_resumen(uuid[], date, date),
  public.regenerar_clave_fuente(uuid), public.crear_aplicacion(text, text[], uuid[]),
  public.regenerar_clave_aplicacion(uuid), public.duplicar_fuente(uuid, text, text) to authenticated;
```

- [ ] **Step 4: Correr tests**

Run: `supabase db reset && supabase test db` → Expected: todos ok.

- [ ] **Step 5: Commit**

```bash
git add apps/leads/supabase
git commit -m "feat(leads): funciones upsert/importación/dashboard/claves"
```

---

### Task 5: Lógica compartida de leads (normalizar + validar)

**Files:**
- Create: `apps/leads/package.json` (mínimo para Vitest; se completa en Task 7)
- Create: `apps/leads/vitest.config.ts`
- Create: `apps/leads/supabase/functions/_shared/lead.ts`
- Test: `apps/leads/supabase/functions/_shared/lead.test.ts`

**Interfaces:**
- Produces:
```ts
export const NUCLEO: readonly ['nombres','apellido','email','telefono','empresa','ruc','cargo','rubro','fecha_nacimiento'];
export type CampoNucleo = typeof NUCLEO[number];
export type TipoCampo = 'texto' | 'email' | 'telefono' | 'fecha' | 'numero' | 'opcion' | 'documento';
export interface CampoFormulario { key: string; label: string; tipo: TipoCampo; requerido: boolean; opciones?: string[] }
export interface LeadEntrada { [k: string]: unknown; extra: Record<string, string> }
export interface ErrorCampo { campo: string; motivo: 'requerido' | 'formato' | 'contacto' }
export function separarLead(datos: Record<string, unknown>): LeadEntrada;
export function validarLead(lead: LeadEntrada, campos: CampoFormulario[]): ErrorCampo[];
export function esNucleo(k: string): k is CampoNucleo;
```

- [ ] **Step 1: package.json mínimo + vitest config**

`apps/leads/package.json`:
```json
{
  "name": "fptecnologi-leads",
  "private": true,
  "version": "0.1.0",
  "scripts": { "test": "vitest run" },
  "devDependencies": { "vitest": "^3.2.0" }
}
```
`apps/leads/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts', 'supabase/functions/_shared/**/*.test.ts'] },
});
```
Run: `cd apps/leads && npm install`

- [ ] **Step 2: Test que falla**

`apps/leads/supabase/functions/_shared/lead.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { separarLead, validarLead, type CampoFormulario } from './lead';

const campos: CampoFormulario[] = [
  { key: 'nombres', label: 'Nombres', tipo: 'texto', requerido: true },
  { key: 'email', label: 'Correo', tipo: 'email', requerido: true },
  { key: 'telefono', label: 'Teléfono', tipo: 'telefono', requerido: false },
  { key: 'ruc', label: 'RUC/DNI', tipo: 'documento', requerido: false },
  { key: 'fecha_nacimiento', label: 'Nacimiento', tipo: 'fecha', requerido: false },
  { key: 'talla', label: 'Talla', tipo: 'opcion', requerido: true, opciones: ['S', 'M', 'L'] },
];

describe('separarLead', () => {
  it('separa núcleo de extra, recorta y baja email a minúsculas', () => {
    const l = separarLead({ nombres: '  Ana ', email: ' ANA@X.COM ', talla: 'M', vacio: '  ' });
    expect(l.nombres).toBe('Ana');
    expect(l.email).toBe('ana@x.com');
    expect(l.extra).toEqual({ talla: 'M' });
  });

  it('normaliza teléfono quitando espacios y guiones', () => {
    expect(separarLead({ telefono: '987 654-321' }).telefono).toBe('987654321');
  });

  it('convierte fecha DD/MM/YYYY a ISO', () => {
    expect(separarLead({ fecha_nacimiento: '05/03/1990' }).fecha_nacimiento).toBe('1990-03-05');
  });

  it('pasa números a string en extra', () => {
    expect(separarLead({ edad: 30 }).extra).toEqual({ edad: '30' });
  });
});

describe('validarLead', () => {
  it('válido cuando cumple todo', () => {
    const l = separarLead({ nombres: 'Ana', email: 'a@x.com', talla: 'M' });
    expect(validarLead(l, campos)).toEqual([]);
  });

  it('reporta requeridos (núcleo y extra)', () => {
    const l = separarLead({ email: 'a@x.com' });
    expect(validarLead(l, campos)).toEqual([
      { campo: 'nombres', motivo: 'requerido' },
      { campo: 'talla', motivo: 'requerido' },
    ]);
  });

  it('reporta formatos inválidos', () => {
    const l = separarLead({ nombres: 'A', email: 'malo', talla: 'XL', ruc: '123', telefono: 'abc', fecha_nacimiento: '1990-13-40' });
    expect(validarLead(l, campos).map((e) => e.campo).sort()).toEqual(['email', 'fecha_nacimiento', 'ruc', 'talla', 'telefono']);
  });

  it('sin campos definidos exige al menos email o teléfono', () => {
    expect(validarLead(separarLead({ nombres: 'Ana' }), [])).toEqual([{ campo: 'email', motivo: 'contacto' }]);
    expect(validarLead(separarLead({ telefono: '987654321' }), [])).toEqual([]);
  });
});
```

Run: `npm test` → Expected: FAIL `Cannot find module './lead'`.

- [ ] **Step 3: Implementación**

`apps/leads/supabase/functions/_shared/lead.ts`:
```ts
// Lógica única de normalización/validación de leads. La usan la app Next
// (import relativo) y las Edge Functions (Deno). Sin dependencias: debe
// correr igual en ambos runtimes.

export const NUCLEO = [
  'nombres', 'apellido', 'email', 'telefono', 'empresa', 'ruc', 'cargo', 'rubro', 'fecha_nacimiento',
] as const;
export type CampoNucleo = typeof NUCLEO[number];
export type TipoCampo = 'texto' | 'email' | 'telefono' | 'fecha' | 'numero' | 'opcion' | 'documento';
export interface CampoFormulario { key: string; label: string; tipo: TipoCampo; requerido: boolean; opciones?: string[] }
export interface LeadEntrada { [k: string]: unknown; extra: Record<string, string> }
export interface ErrorCampo { campo: string; motivo: 'requerido' | 'formato' | 'contacto' }

export function esNucleo(k: string): k is CampoNucleo {
  return (NUCLEO as readonly string[]).includes(k);
}

const DMY = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;

function normalizar(key: string, v: string): string {
  if (key === 'email') return v.toLowerCase();
  if (key === 'telefono') return v.replace(/[\s\-()]/g, '');
  if (key === 'fecha_nacimiento') {
    const m = DMY.exec(v);
    return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : v;
  }
  return v;
}

export function separarLead(datos: Record<string, unknown>): LeadEntrada {
  const out: LeadEntrada = { extra: {} };
  for (const [k, raw] of Object.entries(datos)) {
    if (raw === null || raw === undefined || k === 'extra') continue;
    const v = normalizar(k, String(raw).trim());
    if (v === '') continue;
    if (esNucleo(k)) out[k] = v;
    else out.extra[k] = v;
  }
  return out;
}

const RE: Partial<Record<TipoCampo, RegExp>> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefono: /^\+?\d{6,15}$/,
  documento: /^\d{8}(\d{3})?$/,
  numero: /^-?\d+(\.\d+)?$/,
};

function fechaValida(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function valor(lead: LeadEntrada, key: string): string | undefined {
  const v = esNucleo(key) ? lead[key] : lead.extra[key];
  return typeof v === 'string' ? v : undefined;
}

export function validarLead(lead: LeadEntrada, campos: CampoFormulario[]): ErrorCampo[] {
  const errores: ErrorCampo[] = [];
  const tipos: Record<string, CampoFormulario> = {};
  for (const c of campos) tipos[c.key] = c;
  // Tipos implícitos del núcleo aunque la fuente no los declare.
  tipos.email ??= { key: 'email', label: 'Correo', tipo: 'email', requerido: false };
  tipos.telefono ??= { key: 'telefono', label: 'Teléfono', tipo: 'telefono', requerido: false };
  tipos.fecha_nacimiento ??= { key: 'fecha_nacimiento', label: 'Fecha', tipo: 'fecha', requerido: false };

  for (const c of Object.values(tipos)) {
    const v = valor(lead, c.key);
    if (v === undefined) {
      if (c.requerido) errores.push({ campo: c.key, motivo: 'requerido' });
      continue;
    }
    const ok = c.tipo === 'fecha' ? fechaValida(v)
      : c.tipo === 'opcion' ? (c.opciones ?? []).includes(v)
      : RE[c.tipo]?.test(v) ?? true;
    if (!ok) errores.push({ campo: c.key, motivo: 'formato' });
  }
  if (!valor(lead, 'email') && !valor(lead, 'telefono') && !errores.some((e) => e.campo === 'email' || e.campo === 'telefono')) {
    errores.push({ campo: 'email', motivo: 'contacto' });
  }
  return errores;
}
```

- [ ] **Step 4: Correr tests**

Run: `npm test` → Expected: PASS (8 tests). Si el orden de errores de "reporta requeridos" difiere, el orden sigue `campos` (nombres antes que talla) — ajustar la implementación, no el test.

- [ ] **Step 5: Commit**

```bash
git add apps/leads/package.json apps/leads/package-lock.json apps/leads/vitest.config.ts apps/leads/supabase/functions/_shared
git commit -m "feat(leads): normalización y validación compartida de leads"
```

---

### Task 6: Edge Functions `ingresar-lead` y `api-v1`

**Files:**
- Create: `apps/leads/supabase/functions/_shared/http.ts`
- Create: `apps/leads/supabase/functions/ingresar-lead/index.ts`
- Create: `apps/leads/supabase/functions/api-v1/index.ts`
- Modify: `apps/leads/supabase/functions/send-thank-you/index.ts` (acepta `asunto`/`html` opcionales)
- Create: `apps/leads/supabase/functions/smoke.sh`

**Interfaces:**
- Consumes: `separarLead`, `validarLead`, `CampoFormulario` (Task 5); RPC `upsert_lead`, `hash_clave` (Task 4); vista `api_leads`.
- Produces HTTP:
  - `POST /functions/v1/ingresar-lead` body `{ slug, clave, datos: Record<string,string>, website?: string /*honeypot*/ }` → `200 {ok:true, resultado:'nueva'|'actualizada'}` | `400 {error:'campo_invalido', errores:ErrorCampo[]}` | `401 {error:'clave_invalida'}` | `409 {error:'fuente_cerrada'}` | `429 {error:'limite_excedido'}`.
  - `GET /functions/v1/api-v1/leads?fuente=<slug>&actualizado_desde=<ISO>&limite=<1..500>&cursor=<str>` header `x-api-key` → `{ datos: ApiLead[], siguiente: string|null }`.
  - `GET /functions/v1/api-v1/fuentes` → `{ datos: {slug,nombre,tipo,estado}[] }`.

- [ ] **Step 1: Helpers HTTP**

`apps/leads/supabase/functions/_shared/http.ts`:
```ts
export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });
}

export async function sha256(v: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ponytail: rate limit en memoria por instancia (se reinicia con cada cold
// start y no se comparte entre instancias). Tabla en DB si hay abuso real.
const hits = new Map<string, number[]>();
export function limitar(key: string, max = 10, ventanaMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < ventanaMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}
```

- [ ] **Step 2: `ingresar-lead`**

`apps/leads/supabase/functions/ingresar-lead/index.ts`:
```ts
// Entrada pública de leads desde landings. Deploy:
//   supabase functions deploy ingresar-lead --no-verify-jwt
import { createClient } from 'npm:@supabase/supabase-js@2';
import { separarLead, validarLead, type CampoFormulario } from '../_shared/lead.ts';
import { CORS, json, limitar, sha256 } from '../_shared/http.ts';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'metodo_no_permitido' }, 405);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'desconocida';
  if (limitar(ip)) return json({ error: 'limite_excedido' }, 429);

  let body: { slug?: string; clave?: string; datos?: Record<string, unknown>; website?: string };
  try { body = await req.json(); } catch { return json({ error: 'json_invalido' }, 400); }

  // Honeypot: bots llenan el campo oculto; respondemos ok sin guardar.
  if (body.website) return json({ ok: true, resultado: 'nueva' });

  const { data: fuente } = await db.from('fuentes')
    .select('id, estado, campos, clave_hash, correo_gracias')
    .eq('slug', body.slug ?? '').maybeSingle();
  if (!fuente || !fuente.clave_hash || fuente.clave_hash !== await sha256(body.clave ?? '')) {
    return json({ error: 'clave_invalida' }, 401);
  }
  if (fuente.estado !== 'activa') return json({ error: 'fuente_cerrada' }, 409);

  const lead = separarLead(body.datos ?? {});
  const errores = validarLead(lead, fuente.campos as CampoFormulario[]);
  if (errores.length) return json({ error: 'campo_invalido', errores }, 400);

  const { data: resultado, error } = await db.rpc('upsert_lead', {
    p_fuente: fuente.id,
    p: { ...lead, origen: body.slug, user_agent: req.headers.get('user-agent') },
  });
  if (error) { console.error(error); return json({ error: 'error_interno' }, 500); }

  const correo = fuente.correo_gracias as { activo?: boolean; asunto?: string; plantilla?: string } | null;
  if (resultado === 'nueva' && correo?.activo && lead.email) {
    // No bloquea la respuesta al visitante si el correo falla.
    fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-thank-you`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'INSERT', table: 'leads', record: { nombres: lead.nombres, email: lead.email },
        asunto: correo.asunto, html: correo.plantilla }),
    }).catch((e) => console.error('send-thank-you', e));
  }
  return json({ ok: true, resultado });
});
```

- [ ] **Step 3: `send-thank-you` acepta override**

En `apps/leads/supabase/functions/send-thank-you/index.ts`, extender la interfaz del payload con `asunto?: string; html?: string;` y donde arma el correo usar `payload.asunto ?? <asunto actual>` y, si `payload.html` existe, `payload.html.replaceAll('{{nombre}}', firstName)` en lugar de `buildEmailHtml(...)`. Resto sin cambios.

- [ ] **Step 4: `api-v1`**

`apps/leads/supabase/functions/api-v1/index.ts`:
```ts
// API de lectura para apps conectadas (HUB, apps futuras). Deploy:
//   supabase functions deploy api-v1 --no-verify-jwt
import { createClient } from 'npm:@supabase/supabase-js@2';
import { CORS, json, limitar, sha256 } from '../_shared/http.ts';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

function leerCursor(c: string | null): { t: string; id: string } | null {
  if (!c) return null;
  try { const [t, id] = atob(c).split('|'); return t && id ? { t, id } : null; } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'GET') return json({ error: 'metodo_no_permitido' }, 405);

  const clave = req.headers.get('x-api-key') ?? '';
  const { data: app } = await db.from('aplicaciones')
    .select('id, permisos, fuentes, activa').eq('clave_hash', await sha256(clave)).maybeSingle();
  if (!app || !app.activa || !app.permisos.includes('leer')) return json({ error: 'clave_invalida' }, 401);
  if (limitar(app.id, 120)) return json({ error: 'limite_excedido' }, 429);
  db.from('aplicaciones').update({ ultimo_uso: new Date().toISOString() }).eq('id', app.id).then();

  const url = new URL(req.url);
  const ruta = url.pathname.split('/api-v1')[1] ?? '';

  // Slugs permitidos para esta app (null = todas).
  let slugsPermitidos: string[] | null = null;
  if (app.fuentes) {
    const { data } = await db.from('fuentes').select('slug').in('id', app.fuentes);
    slugsPermitidos = (data ?? []).map((f) => f.slug);
  }

  if (ruta === '/fuentes') {
    let q = db.from('fuentes').select('slug, nombre, tipo, estado').order('nombre');
    if (slugsPermitidos) q = q.in('slug', slugsPermitidos);
    const { data, error } = await q;
    return error ? json({ error: 'error_interno' }, 500) : json({ datos: data });
  }

  if (ruta === '/leads') {
    const limite = Math.min(Math.max(Number(url.searchParams.get('limite') ?? 100), 1), 500);
    const fuente = url.searchParams.get('fuente');
    if (fuente && slugsPermitidos && !slugsPermitidos.includes(fuente)) return json({ error: 'fuera_de_alcance' }, 403);

    let q = db.from('api_leads').select('*')
      .order('actualizado_en', { ascending: true }).order('id', { ascending: true }).limit(limite);
    if (fuente) q = q.eq('fuente', fuente);
    else if (slugsPermitidos) q = q.in('fuente', slugsPermitidos);
    const desde = url.searchParams.get('actualizado_desde');
    if (desde) q = q.gte('actualizado_en', desde);
    const cur = leerCursor(url.searchParams.get('cursor'));
    if (cur) q = q.or(`actualizado_en.gt.${cur.t},and(actualizado_en.eq.${cur.t},id.gt.${cur.id})`);

    const { data, error } = await q;
    if (error) { console.error(error); return json({ error: 'error_interno' }, 500); }
    const ult = data.length === limite ? data[data.length - 1] : null;
    return json({ datos: data, siguiente: ult ? btoa(`${ult.actualizado_en}|${ult.id}`) : null });
  }

  return json({ error: 'no_encontrado' }, 404);
});
```

- [ ] **Step 5: Smoke test local**

`apps/leads/supabase/functions/smoke.sh`:
```bash
#!/usr/bin/env bash
# Prueba end-to-end local: requiere `supabase start` y `supabase functions serve` corriendo.
set -euo pipefail
URL=http://127.0.0.1:54321
DB="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

psql "$DB" -qc "insert into fuentes (nombre, slug, tipo, campos, clave_hash) values
  ('Smoke','smoke','landing','[{\"key\":\"email\",\"label\":\"Correo\",\"tipo\":\"email\",\"requerido\":true}]', hash_clave('pub_test'))
  on conflict (slug) do update set clave_hash = excluded.clave_hash;
  insert into aplicaciones (nombre, clave_hash) values ('Smoke', hash_clave('app_test')) on conflict do nothing;"

post() { curl -s -o /dev/null -w '%{http_code}' -X POST "$URL/functions/v1/ingresar-lead" -H 'content-type: application/json' -d "$1"; }
[ "$(post '{"slug":"smoke","clave":"pub_test","datos":{"email":"s@x.com"}}')" = 200 ] && echo "ok ingresar"
[ "$(post '{"slug":"smoke","clave":"mala","datos":{"email":"s@x.com"}}')" = 401 ] && echo "ok clave invalida"
[ "$(post '{"slug":"smoke","clave":"pub_test","datos":{"email":"malo"}}')" = 400 ] && echo "ok campo invalido"

curl -s "$URL/functions/v1/api-v1/leads?fuente=smoke" -H 'x-api-key: app_test' | grep -q 's@x.com' && echo "ok api-v1 leads"
[ "$(curl -s -o /dev/null -w '%{http_code}' "$URL/functions/v1/api-v1/leads" -H 'x-api-key: nada')" = 401 ] && echo "ok api-v1 401"
```

Run (dos terminales):
```bash
cd apps/leads && supabase functions serve --no-verify-jwt
```
```bash
cd apps/leads && bash supabase/functions/smoke.sh
```
Expected: 5 líneas `ok …`.

- [ ] **Step 6: Commit**

```bash
git add apps/leads/supabase/functions
git commit -m "feat(leads): edge functions ingresar-lead y api-v1 con claves hasheadas"
```

---

### Task 7: App `apps/leads` — scaffold con shell Vireo

**Files:**
- Copy desde `apps/web`: `app/layout.tsx`, `app/(shell)/layout.tsx`, `middleware.ts`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.*`, `public/`, `src/styles/`, `src/components/{ui,shell,charts,icons}/`, `src/hooks/`, `src/lib/{color,fonts,storage,theme,manifest,pageMetadata}.ts`, `src/data/icons/`.
- Create: `apps/leads/src/data/nav-manifest.json`
- Create: `apps/leads/src/lib/supabase.ts`, `apps/leads/.env.example`, `apps/leads/.gitignore`
- Modify: `apps/leads/package.json`
- Modify: `.claude/launch.json` (entrada `leads`)
- Modify: `apps/leads/src/components/shell/Sidebar.tsx`, `HeaderUtils.tsx` (quitar marcas)

**Interfaces:**
- Produces: `export const supabase: SupabaseClient` en `src/lib/supabase.ts`; nodos de menú con ids `panel.dashboard`, `leads.tabla`, `leads.importar`, `grp.landings`, `grp.offline`, `exportacion`, `usuarios` (este último `roles:["admin"]`).

- [ ] **Step 1: Copiar archivos base**

```bash
cd apps
for p in app/layout.tsx "app/(shell)/layout.tsx" middleware.ts next.config.ts tsconfig.json postcss.config.mjs public src/styles src/components/ui src/components/shell src/components/charts src/components/icons src/hooks src/data/icons src/lib/color.ts src/lib/fonts.ts src/lib/storage.ts src/lib/theme.ts src/lib/manifest.ts src/lib/pageMetadata.ts; do
  mkdir -p "leads/$(dirname "$p")" && cp -r "web/$p" "leads/$p"
done
ls web/eslint.config.* 2>/dev/null && cp web/eslint.config.* leads/
```
Si alguno de esos paths no existe en `apps/web` (ej. `next.config.mjs` en vez de `.ts`), copiar el que exista.

- [ ] **Step 2: package.json completo**

`apps/leads/package.json`:
```json
{
  "name": "fptecnologi-leads",
  "private": true,
  "version": "0.1.0",
  "description": "Sistema de Leads de FPTecnologi (Next.js 16 + Supabase).",
  "license": "LicenseRef-Envato-Regular",
  "scripts": {
    "dev": "next dev --port 3003",
    "build": "next build",
    "start": "next start --port 3003",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "apexcharts": "^4.4.0",
    "next": "16.3.4",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.7",
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^22.20.2",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "eslint": "^9.39.5",
    "eslint-config-next": "^15.3.9",
    "tailwindcss": "^4.1.0",
    "typescript": "^7.0.2",
    "vitest": "^3.2.0"
  }
}
```
Run: `cd apps/leads && npm install`

- [ ] **Step 3: Cliente Supabase + env**

`apps/leads/src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient(url, anon);
```
`apps/leads/.env.example`:
```
# Local: valores que imprime `supabase start`. Producción: proyecto qpjxwtvmuqramhqoxkxj.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
`apps/leads/.gitignore`:
```
node_modules
.next
.env.local
supabase/.temp
supabase/.branches
```
Crear `.env.local` con los valores de `supabase status` (API URL + anon key).

- [ ] **Step 4: Menú**

`apps/leads/src/data/nav-manifest.json`:
```json
{
  "$schema": "fptecnologi-nav-manifest/v1",
  "meta": { "comment": "Menú del Sistema de Leads. Las landings y apps offline se inyectan dinámicamente desde la tabla fuentes (Sidebar).", "sections": ["PRINCIPAL", "FUENTES", "ADMINISTRACIÓN"] },
  "nodes": [
    { "id": "panel.dashboard", "title": "Dashboard", "slug": "", "icon": "layout-dashboard", "parent": null, "section": "PRINCIPAL", "order": 1, "badge": null, "keywords": ["inicio", "graficas", "resumen"], "inMenu": true, "alias": null },
    { "id": "grp.leads", "title": "Leads", "slug": "leads", "icon": "users", "parent": null, "section": "PRINCIPAL", "order": 2, "badge": null, "keywords": ["leads", "tabla"], "inMenu": true, "alias": null },
    { "id": "leads.tabla", "title": "Todos los leads", "slug": "leads", "icon": "table", "parent": "grp.leads", "section": null, "order": 1, "badge": null, "keywords": ["tabla", "filtros", "buscar"], "inMenu": true, "alias": null },
    { "id": "leads.importar", "title": "Importar", "slug": "leads/importar", "icon": "upload", "parent": "grp.leads", "section": null, "order": 2, "badge": null, "keywords": ["excel", "csv", "importar"], "inMenu": true, "alias": null, "roles": ["editor"] },
    { "id": "grp.landings", "title": "Landings", "slug": "landings", "icon": "world", "parent": null, "section": "FUENTES", "order": 1, "badge": null, "keywords": ["landing", "campaña", "formulario"], "inMenu": true, "alias": null },
    { "id": "grp.offline", "title": "Apps offline", "slug": "offline", "icon": "device-mobile", "parent": null, "section": "FUENTES", "order": 2, "badge": null, "keywords": ["offline", "sincronizar"], "inMenu": true, "alias": null },
    { "id": "exportacion", "title": "Exportación y conexiones", "slug": "exportacion", "icon": "plug", "parent": null, "section": "ADMINISTRACIÓN", "order": 1, "badge": null, "keywords": ["exportar", "api", "conectar", "hub"], "inMenu": true, "alias": null },
    { "id": "usuarios", "title": "Usuarios", "slug": "usuarios", "icon": "user-cog", "parent": null, "section": "ADMINISTRACIÓN", "order": 2, "badge": null, "keywords": ["usuarios", "roles"], "inMenu": true, "alias": null, "roles": ["admin"] },
    { "id": "auth.sign-in", "title": "Ingresar", "slug": "auth/sign-in", "icon": "login", "parent": null, "section": null, "order": 99, "badge": null, "keywords": [], "inMenu": false, "alias": null },
    { "id": "auth.two-step-totp", "title": "Verificación en dos pasos", "slug": "auth/two-step-totp", "icon": "shield", "parent": null, "section": null, "order": 99, "badge": null, "keywords": [], "inMenu": false, "alias": null },
    { "id": "auth.activar-2fa", "title": "Activar 2FA", "slug": "auth/activar-2fa", "icon": "shield", "parent": null, "section": null, "order": 99, "badge": null, "keywords": [], "inMenu": false, "alias": null },
    { "id": "auth.crear-clave", "title": "Crear contraseña", "slug": "auth/crear-clave", "icon": "key", "parent": null, "section": null, "order": 99, "badge": null, "keywords": [], "inMenu": false, "alias": null }
  ]
}
```
Verificar que cada `icon` exista en `src/data/icons/`; si no, usar uno existente parecido.

- [ ] **Step 5: Quitar la lógica de marcas del shell**

En `src/components/shell/Sidebar.tsx`: eliminar el componente `MarcaSwitcher` y su render, el bloque `showBrands` (hijos de marca bajo `inicio.dashboards`) y `sectionLabel` especial para `MARCA`. El rol para `visibleForRole` pasa a salir de `useAuth().perfil?.rol ?? null` (Task 8 define `perfil`). En `HeaderUtils.tsx` reemplazar el subtítulo `marca · rol` por `perfil?.rol`. Mientras Task 8 no exista, dejar temporalmente `const perfil = null as { rol: string } | null;` — Task 8 lo reemplaza.

En `app/layout.tsx`: `title.default = 'FPTecnologi · Leads'`, `template = '%s · Leads'`, description `'Sistema de Leads de FPTecnologi: landings, importación, dashboard y conexiones.'`. Quitar `AuthProvider` import temporalmente si rompe (Task 8 lo vuelve a poner).

Crear `app/(shell)/page.tsx` provisional:
```tsx
export default function Page() {
  return <div className="ax-card"><div className="ax-card__body">Sistema de Leads</div></div>;
}
```

- [ ] **Step 6: launch.json**

Agregar a `.claude/launch.json` → `configurations`:
```json
{
  "name": "leads",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["--prefix", "apps/leads", "run", "dev"],
  "port": 3003
}
```

- [ ] **Step 7: Verificar build y render**

Run: `cd apps/leads && npx tsc --noEmit && npm run build`
Expected: sin errores. Luego `preview_start {name:"leads"}`, abrir `/` (el middleware redirige a `/auth/sign-in` que aún no existe → 404 de Next es aceptable en este paso; comentar temporalmente el redirect y verificar que el shell con sidebar de 3 secciones se pinta sin errores de consola). Restaurar el middleware.

- [ ] **Step 8: Commit**

```bash
git add apps/leads .claude/launch.json
git commit -m "feat(leads): scaffold apps/leads con shell Vireo y menú del sistema de leads"
```

---

### Task 8: Autenticación — Supabase Auth + 2FA TOTP obligatorio

**Files:**
- Create: `apps/leads/src/context/AuthContext.tsx`
- Create: `apps/leads/src/components/auth/RequireAuth.tsx`
- Create: `apps/leads/src/screens/auth/{authShared.tsx,SignIn.tsx,TwoStepTotp.tsx,Activar2fa.tsx,CrearClave.tsx}`
- Create: `apps/leads/app/(bare)/auth/{sign-in,two-step-totp,activar-2fa,crear-clave}/page.tsx`
- Create: `apps/leads/app/(bare)/layout.tsx` (si `apps/web` tiene uno, copiarlo)
- Modify: `apps/leads/app/layout.tsx`, `Sidebar.tsx`, `HeaderUtils.tsx`

**Interfaces:**
- Consumes: `supabase` (Task 7); tabla `perfiles` (Task 2).
- Produces:
```ts
export interface Perfil { user_id: string; nombre: string; rol: 'admin' | 'editor' | 'lector' }
interface AuthValue {
  user: import('@supabase/supabase-js').User | null;
  perfil: Perfil | null;
  aal2: boolean;
  loading: boolean;
  login(email: string, password: string): Promise<'totp' | 'activar'>;
  verificarTotp(code: string): Promise<void>;
  iniciarActivacion(): Promise<{ factorId: string; qr: string; secreto: string }>;
  confirmarActivacion(factorId: string, code: string): Promise<void>;
  crearClave(password: string): Promise<void>;
  logout(): Promise<void>;
  puedeEditar: boolean; // admin | editor
  esAdmin: boolean;
}
export function useAuth(): AuthValue;
```

- [ ] **Step 1: AuthContext**

`apps/leads/src/context/AuthContext.tsx`:
```tsx
'use client';
/*
 * Sistema de Leads — AuthContext sobre Supabase Auth.
 * Flujo: email+contraseña (aal1) → TOTP (aal2). Si la cuenta no tiene factor
 * TOTP todavía, se fuerza a activarlo antes de entrar: toda política RLS de
 * datos exige aal2, así que sin 2FA no hay nada que ver.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Perfil { user_id: string; nombre: string; rol: 'admin' | 'editor' | 'lector' }

interface AuthValue {
  user: User | null;
  perfil: Perfil | null;
  aal2: boolean;
  loading: boolean;
  login(email: string, password: string): Promise<'totp' | 'activar'>;
  verificarTotp(code: string): Promise<void>;
  iniciarActivacion(): Promise<{ factorId: string; qr: string; secreto: string }>;
  confirmarActivacion(factorId: string, code: string): Promise<void>;
  crearClave(password: string): Promise<void>;
  logout(): Promise<void>;
  puedeEditar: boolean;
  esAdmin: boolean;
}

const Ctx = createContext<AuthValue | null>(null);
// Marcador liviano para middleware.ts (Edge no puede leer localStorage). No es la sesión.
const COOKIE = 'ax_session';
function marcarCookie(on: boolean) {
  document.cookie = on ? `${COOKIE}=1; path=/; SameSite=Lax` : `${COOKIE}=; path=/; Max-Age=0; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [aal2, setAal2] = useState(false);
  const [loading, setLoading] = useState(true);

  const refrescar = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const ok = aal?.currentLevel === 'aal2';
    setAal2(ok);
    marcarCookie(ok);
    if (ok && session) {
      const { data } = await supabase.from('perfiles').select('user_id, nombre, rol').eq('user_id', session.user.id).maybeSingle();
      setPerfil((data as Perfil) ?? null);
    } else {
      setPerfil(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refrescar();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { refrescar(); });
    return () => sub.subscription.unsubscribe();
  }, [refrescar]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data } = await supabase.auth.mfa.listFactors();
    return (data?.totp.some((f) => f.status === 'verified') ? 'totp' : 'activar') as 'totp' | 'activar';
  }, []);

  const verificarTotp = useCallback(async (code: string) => {
    const { data } = await supabase.auth.mfa.listFactors();
    const factor = data?.totp.find((f) => f.status === 'verified');
    if (!factor) throw new Error('No hay 2FA activo');
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    if (error) throw error;
    await refrescar();
  }, [refrescar]);

  const iniciarActivacion = useCallback(async () => {
    // Borra factores no verificados de intentos anteriores (Supabase no deja duplicar nombre).
    const { data: lista } = await supabase.auth.mfa.listFactors();
    for (const f of lista?.all ?? []) if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Leads' });
    if (error) throw error;
    return { factorId: data.id, qr: data.totp.qr_code, secreto: data.totp.secret };
  }, []);

  const confirmarActivacion = useCallback(async (factorId: string, code: string) => {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) throw error;
    await refrescar();
  }, [refrescar]);

  const crearClave = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    marcarCookie(false);
    router.push('/auth/sign-in');
  }, [router]);

  const value = useMemo<AuthValue>(() => ({
    user, perfil, aal2, loading, login, verificarTotp, iniciarActivacion, confirmarActivacion, crearClave, logout,
    puedeEditar: perfil?.rol === 'admin' || perfil?.rol === 'editor',
    esAdmin: perfil?.rol === 'admin',
  }), [user, perfil, aal2, loading, login, verificarTotp, iniciarActivacion, confirmarActivacion, crearClave, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth fuera de AuthProvider');
  return v;
}
```

- [ ] **Step 2: RequireAuth**

`apps/leads/src/components/auth/RequireAuth.tsx`:
```tsx
'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../shell/Loader';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, aal2, perfil, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/auth/sign-in');
    else if (!aal2) router.replace('/auth/two-step-totp');
  }, [loading, user, aal2, router]);

  if (loading || !user || !aal2) return <Loader />;
  if (!perfil) {
    return (
      <div className="ax-card" style={{ margin: 'var(--ax-space-8) auto', maxWidth: 480 }}>
        <div className="ax-card__body">Tu cuenta no tiene un perfil asignado. Pide a un administrador que te dé acceso.</div>
      </div>
    );
  }
  return <>{children}</>;
}
```
`app/layout.tsx`: envolver con `<AuthProvider>` importado de `../src/context/AuthContext`. `app/(shell)/layout.tsx`: import de `RequireAuth` desde `../../src/components/auth/RequireAuth` (ya está así).

- [ ] **Step 3: Pantallas de auth (portar diseño de `apps/web`)**

Copiar `apps/web/src/screens/auth/authShared.tsx`, `SignInBasic.tsx`, `TwoStepTotp.tsx`, `CreatePasswordBasic.tsx` a `apps/leads/src/screens/auth/` como `authShared.tsx`, `SignIn.tsx`, `TwoStepTotp.tsx`, `CrearClave.tsx`. Mantener todo el markup/estilos; cambiar solo la lógica:

- `SignIn.tsx` submit:
```tsx
const destino = await login(email, password);
router.push(destino === 'totp' ? '/auth/two-step-totp' : '/auth/activar-2fa');
```
Quitar Google login, "recordar dispositivo" y enlaces a registro. Errores: `Invalid login credentials` → "Correo o contraseña incorrectos".
- `TwoStepTotp.tsx` submit: `await verificarTotp(code); router.push('/');`. Si `useAuth().user` es null al montar → `router.replace('/auth/sign-in')`. Quitar códigos de respaldo.
- `CrearClave.tsx` (llega desde el enlace de invitación; Supabase deja la sesión iniciada): valida 2 campos iguales y ≥ 10 caracteres, `await crearClave(pw); router.push('/auth/activar-2fa');`.
- `Activar2fa.tsx` (nuevo, con el mismo layout de `authShared`):
```tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export function Activar2fa() {
  const { user, loading, iniciarActivacion, confirmarActivacion } = useAuth();
  const router = useRouter();
  const [f, setF] = useState<{ factorId: string; qr: string; secreto: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/sign-in'); return; }
    iniciarActivacion().then(setF).catch((e) => setError(e.message));
  }, [loading, user, iniciarActivacion, router]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try { await confirmarActivacion(f!.factorId, code.trim()); router.push('/'); }
    catch { setError('Código incorrecto. Revisa la hora del teléfono y vuelve a intentar.'); }
  }

  return (
    <form onSubmit={enviar} className="ax-stack" style={{ gap: 'var(--ax-space-4)' }}>
      <h1 className="ax-card__title">Activa la verificación en dos pasos</h1>
      <p>Escanea el código con Google Authenticator, Microsoft Authenticator o similar.</p>
      {f && <img src={f.qr} alt="Código QR para 2FA" width={200} height={200} />}
      {f && <p className="ax-text-subtle">O ingresa la clave: <code>{f.secreto}</code></p>}
      <label className="ax-field">
        <span className="ax-label">Código de 6 dígitos</span>
        <input className="ax-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
          value={code} onChange={(e) => setCode(e.target.value)} required />
      </label>
      {error && <p role="alert" style={{ color: 'var(--ax-danger-500)' }}>{error}</p>}
      <button className="ax-btn ax-btn--primary ax-btn--block" disabled={!f || code.length !== 6}>Activar y entrar</button>
    </form>
  );
}
```
Envolverlo en el mismo contenedor de tarjeta que usa `SignIn.tsx` (componente exportado por `authShared.tsx`).

Pages, ej. `app/(bare)/auth/sign-in/page.tsx`:
```tsx
import { metadataForSlug } from '../../../../src/lib/pageMetadata';
export const metadata = metadataForSlug('auth/sign-in');
export { SignIn as default } from '../../../../src/screens/auth/SignIn';
```
Idem para `two-step-totp` (`TwoStepTotp`), `activar-2fa` (`Activar2fa`), `crear-clave` (`CrearClave`).

- [ ] **Step 4: middleware — rutas de auth accesibles durante el flujo**

En `apps/leads/middleware.ts` el bloque que redirige `/auth` → `/` cuando hay cookie se mantiene (la cookie solo se pone con aal2). Nada más cambia.

- [ ] **Step 5: Sidebar/HeaderUtils usan `perfil`**

Reemplazar el placeholder de Task 7 por `const { perfil } = useAuth();` y pasar `perfil?.rol ?? null` a `visibleForRole`. En `HeaderUtils` el menú de usuario muestra `user.email` y `perfil.rol`, y "Cerrar sesión" llama `logout()`.

- [ ] **Step 6: Usuario admin local y verificación en navegador**

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@local.test',
          extensions.crypt('Admin12345!', extensions.gen_salt('bf')), now(), now(), now(), '{\"provider\":\"email\",\"providers\":[\"email\"]}', '{}');
  insert into auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
  select gen_random_uuid(), id, json_build_object('sub', id::text, 'email', email), 'email', id::text, now(), now() from auth.users where email = 'admin@local.test';
  insert into public.perfiles (user_id, nombre, rol) select id, 'Admin local', 'admin' from auth.users where email = 'admin@local.test';"
```
Guardar este bloque también en `apps/leads/supabase/seed.sql` (después del insert de fuentes) para que `supabase db reset` lo recree.

Preview `leads` → `/auth/sign-in` → login `admin@local.test / Admin12345!` → debe ir a `/auth/activar-2fa`, mostrar QR. Para el código TOTP en la verificación automatizada, generar con el secreto:
```bash
node -e "const s=process.argv[1];const b32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const c of s.replace(/=+$/,''))bits+=b32.indexOf(c).toString(2).padStart(5,'0');const key=Buffer.from(bits.match(/.{8}/g).map(b=>parseInt(b,2)));const t=Buffer.alloc(8);t.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const h=require('crypto').createHmac('sha1',key).update(t).digest();const o=h[19]&15;console.log(((h.readUInt32BE(o)&0x7fffffff)%1e6).toString().padStart(6,'0'))" <SECRETO>
```
Ingresar el código → llega a `/` con shell y menú completo (Usuarios visible por ser admin). Cerrar sesión → vuelve a `/auth/sign-in`. Volver a entrar → pide `/auth/two-step-totp` (ya no activar). Consola sin errores.

- [ ] **Step 7: Commit**

```bash
git add apps/leads
git commit -m "feat(leads): login Supabase con 2FA TOTP obligatorio y perfil por rol"
```

---

### Task 9: Capa de datos y modelo de filtros

**Files:**
- Create: `apps/leads/src/lib/leads/filtros.ts`
- Test: `apps/leads/src/lib/leads/filtros.test.ts`
- Create: `apps/leads/src/lib/leads/datos.ts`

**Interfaces:**
- Produces:
```ts
// filtros.ts
export type Operador = 'eq' | 'neq' | 'contiene' | 'gte' | 'lte' | 'vacio' | 'no_vacio';
export interface Condicion { campo: string; op: Operador; valor?: string }
export interface FiltroLeads { q?: string; fuentes?: string[]; estados?: string[]; desde?: string; hasta?: string; condiciones: Condicion[] }
export const FILTRO_VACIO: FiltroLeads;
export function columna(campo: string): string;           // 'email' → 'email'; 'talla' → 'extra->>talla'
export function aplicarFiltro<Q extends ConsultaFiltrable>(q: Q, f: FiltroLeads): Q;
export function describirFiltro(f: FiltroLeads, nombreFuente: (id: string) => string): { clave: string; texto: string }[];
export function quitarDeFiltro(f: FiltroLeads, clave: string): FiltroLeads;
export interface ConsultaFiltrable { eq(c: string, v: unknown): this; neq(c: string, v: unknown): this; ilike(c: string, v: string): this;
  gte(c: string, v: unknown): this; lte(c: string, v: unknown): this; in(c: string, v: unknown[]): this; is(c: string, v: null): this;
  not(c: string, op: string, v: unknown): this; or(expr: string): this; }

// datos.ts
export const ESTADOS: readonly ['nuevo', 'contactado', 'asistio', 'descartado'];
export interface Fuente { id: string; nombre: string; slug: string; tipo: 'landing'|'offline'|'importacion'; dominio: string|null; estado: 'activa'|'cerrada'; campos: CampoFormulario[]; correo_gracias: { activo: boolean; asunto?: string; plantilla?: string } | null; clave_hash: string | null; actualizado_en: string }
export interface Lead { id: string; fuente_id: string; nombres: string|null; apellido: string|null; email: string|null; telefono: string|null; empresa: string|null; ruc: string|null; cargo: string|null; rubro: string|null; fecha_nacimiento: string|null; status: string; extra: Record<string,string>; created_at: string; actualizado_en: string; fuentes?: { nombre: string; slug: string } }
export interface Orden { campo: string; asc: boolean }
export async function listarLeads(f: FiltroLeads, orden: Orden, pagina: number, porPagina: number): Promise<{ filas: Lead[]; total: number }>;
export async function todosLosLeads(f: FiltroLeads, orden: Orden): Promise<Lead[]>;   // pagina de 1000 en 1000
export async function actualizarLead(id: string, cambios: Partial<Lead>): Promise<void>;
export async function cambiarEstado(ids: string[], estado: string): Promise<void>;
export async function listarFuentes(tipo?: Fuente['tipo']): Promise<Fuente[]>;
export async function fuentePorSlug(slug: string): Promise<Fuente | null>;
export async function guardarFuente(f: Partial<Fuente> & { id?: string }): Promise<Fuente>;
```

- [ ] **Step 1: Test que falla**

`apps/leads/src/lib/leads/filtros.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { aplicarFiltro, columna, describirFiltro, quitarDeFiltro, FILTRO_VACIO, type ConsultaFiltrable } from './filtros';

function grabadora() {
  const llamadas: unknown[][] = [];
  const q = new Proxy({} as ConsultaFiltrable & { llamadas: unknown[][] }, {
    get(_t, prop) {
      if (prop === 'llamadas') return llamadas;
      return (...args: unknown[]) => { llamadas.push([prop, ...args]); return q; };
    },
  });
  return q;
}

describe('columna', () => {
  it('núcleo directo, resto en extra', () => {
    expect(columna('email')).toBe('email');
    expect(columna('status')).toBe('status');
    expect(columna('talla')).toBe('extra->>talla');
  });
  it('rechaza claves con caracteres peligrosos', () => {
    expect(() => columna('a,b')).toThrow();
  });
});

describe('aplicarFiltro', () => {
  it('filtro vacío no agrega nada', () => {
    expect(aplicarFiltro(grabadora(), FILTRO_VACIO).llamadas).toEqual([]);
  });

  it('traduce búsqueda, fuentes, estados, fechas y condiciones', () => {
    const q = aplicarFiltro(grabadora(), {
      q: 'ana, (x)', fuentes: ['f1'], estados: ['nuevo'], desde: '2026-01-01', hasta: '2026-01-31',
      condiciones: [
        { campo: 'rubro', op: 'eq', valor: 'Minería' },
        { campo: 'ciudad', op: 'contiene', valor: 'lim' },
        { campo: 'empresa', op: 'vacio' },
        { campo: 'cargo', op: 'no_vacio' },
      ],
    });
    expect(q.llamadas).toEqual([
      ['or', 'nombres.ilike.*ana x*,apellido.ilike.*ana x*,email.ilike.*ana x*,empresa.ilike.*ana x*,telefono.ilike.*ana x*,ruc.ilike.*ana x*'],
      ['in', 'fuente_id', ['f1']],
      ['in', 'status', ['nuevo']],
      ['gte', 'created_at', '2026-01-01T00:00:00-05:00'],
      ['lte', 'created_at', '2026-01-31T23:59:59.999-05:00'],
      ['eq', 'rubro', 'Minería'],
      ['ilike', 'extra->>ciudad', '%lim%'],
      ['or', 'empresa.is.null,empresa.eq.'],
      ['not', 'cargo', 'is', null],
    ]);
  });
});

describe('chips', () => {
  const f = { ...FILTRO_VACIO, q: 'ana', estados: ['nuevo'], condiciones: [{ campo: 'rubro', op: 'eq' as const, valor: 'X' }] };
  it('describe cada filtro activo', () => {
    expect(describirFiltro(f, () => '').map((c) => c.texto)).toEqual(['Búsqueda: ana', 'Estado: nuevo', 'rubro = X']);
  });
  it('quita un filtro por clave', () => {
    expect(quitarDeFiltro(f, 'cond:0').condiciones).toEqual([]);
    expect(quitarDeFiltro(f, 'q').q).toBeUndefined();
  });
});
```
Run: `npm test` → FAIL (módulo no existe).

- [ ] **Step 2: Implementación de filtros**

`apps/leads/src/lib/leads/filtros.ts`:
```ts
import { esNucleo } from '../../../supabase/functions/_shared/lead';

export type Operador = 'eq' | 'neq' | 'contiene' | 'gte' | 'lte' | 'vacio' | 'no_vacio';
export interface Condicion { campo: string; op: Operador; valor?: string }
export interface FiltroLeads { q?: string; fuentes?: string[]; estados?: string[]; desde?: string; hasta?: string; condiciones: Condicion[] }
export interface ConsultaFiltrable {
  eq(c: string, v: unknown): this; neq(c: string, v: unknown): this; ilike(c: string, v: string): this;
  gte(c: string, v: unknown): this; lte(c: string, v: unknown): this; in(c: string, v: unknown[]): this;
  is(c: string, v: null): this; not(c: string, op: string, v: unknown): this; or(expr: string): this;
}

export const FILTRO_VACIO: FiltroLeads = { condiciones: [] };
export const OPERADORES: Record<Operador, string> = {
  eq: '=', neq: '≠', contiene: 'contiene', gte: '≥', lte: '≤', vacio: 'está vacío', no_vacio: 'no está vacío',
};

const CLAVE_OK = /^[a-z0-9_]+$/i;
const COLUMNAS_DIRECTAS = new Set(['status', 'created_at', 'actualizado_en', 'fuente_id']);

export function columna(campo: string): string {
  if (!CLAVE_OK.test(campo)) throw new Error(`campo inválido: ${campo}`);
  return esNucleo(campo) || COLUMNAS_DIRECTAS.has(campo) ? campo : `extra->>${campo}`;
}

// PostgREST usa , ( ) como sintaxis dentro de or(): se quitan del texto buscado.
const limpiar = (s: string) => s.replace(/[,()*%\\]/g, ' ').replace(/\s+/g, ' ').trim();
const BUSCABLES = ['nombres', 'apellido', 'email', 'empresa', 'telefono', 'ruc'];

export function aplicarFiltro<Q extends ConsultaFiltrable>(q: Q, f: FiltroLeads): Q {
  const texto = f.q ? limpiar(f.q) : '';
  if (texto) q = q.or(BUSCABLES.map((c) => `${c}.ilike.*${texto}*`).join(','));
  if (f.fuentes?.length) q = q.in('fuente_id', f.fuentes);
  if (f.estados?.length) q = q.in('status', f.estados);
  if (f.desde) q = q.gte('created_at', `${f.desde}T00:00:00-05:00`);
  if (f.hasta) q = q.lte('created_at', `${f.hasta}T23:59:59.999-05:00`);
  for (const c of f.condiciones) {
    const col = columna(c.campo);
    const v = c.valor ?? '';
    switch (c.op) {
      case 'eq': q = q.eq(col, v); break;
      case 'neq': q = q.neq(col, v); break;
      case 'contiene': q = q.ilike(col, `%${v}%`); break;
      case 'gte': q = q.gte(col, v); break;
      case 'lte': q = q.lte(col, v); break;
      case 'vacio': q = q.or(`${col}.is.null,${col}.eq.`); break;
      case 'no_vacio': q = q.not(col, 'is', null); break;
    }
  }
  return q;
}

export function describirFiltro(f: FiltroLeads, nombreFuente: (id: string) => string): { clave: string; texto: string }[] {
  const out: { clave: string; texto: string }[] = [];
  if (f.q) out.push({ clave: 'q', texto: `Búsqueda: ${f.q}` });
  if (f.fuentes?.length) out.push({ clave: 'fuentes', texto: `Fuente: ${f.fuentes.map(nombreFuente).join(', ')}` });
  if (f.estados?.length) out.push({ clave: 'estados', texto: `Estado: ${f.estados.join(', ')}` });
  if (f.desde) out.push({ clave: 'desde', texto: `Desde ${f.desde}` });
  if (f.hasta) out.push({ clave: 'hasta', texto: `Hasta ${f.hasta}` });
  f.condiciones.forEach((c, i) => out.push({
    clave: `cond:${i}`,
    texto: `${c.campo} ${OPERADORES[c.op]}${c.op === 'vacio' || c.op === 'no_vacio' ? '' : ` ${c.valor ?? ''}`}`,
  }));
  return out;
}

export function quitarDeFiltro(f: FiltroLeads, clave: string): FiltroLeads {
  if (clave.startsWith('cond:')) {
    const i = Number(clave.slice(5));
    return { ...f, condiciones: f.condiciones.filter((_, j) => j !== i) };
  }
  const copia = { ...f };
  delete copia[clave as 'q' | 'fuentes' | 'estados' | 'desde' | 'hasta'];
  return copia;
}
```

- [ ] **Step 3: Tests pasan**

Run: `npm test` → PASS.

- [ ] **Step 4: Acceso a datos**

`apps/leads/src/lib/leads/datos.ts`:
```ts
import { supabase } from '../supabase';
import { aplicarFiltro, type FiltroLeads } from './filtros';
import type { CampoFormulario } from '../../../supabase/functions/_shared/lead';

export const ESTADOS = ['nuevo', 'contactado', 'asistio', 'descartado'] as const;

export interface Fuente {
  id: string; nombre: string; slug: string; tipo: 'landing' | 'offline' | 'importacion';
  dominio: string | null; estado: 'activa' | 'cerrada'; campos: CampoFormulario[];
  correo_gracias: { activo: boolean; asunto?: string; plantilla?: string } | null;
  clave_hash: string | null; actualizado_en: string;
}
export interface Lead {
  id: string; fuente_id: string; nombres: string | null; apellido: string | null; email: string | null;
  telefono: string | null; empresa: string | null; ruc: string | null; cargo: string | null; rubro: string | null;
  fecha_nacimiento: string | null; status: string; extra: Record<string, string>; created_at: string;
  actualizado_en: string; fuentes?: { nombre: string; slug: string };
}
export interface Orden { campo: string; asc: boolean }

const SELECT = '*, fuentes(nombre, slug)';

function base(f: FiltroLeads, orden: Orden) {
  const q = supabase.from('leads').select(SELECT, { count: 'exact' }).is('duplicado_de', null);
  return aplicarFiltro(q, f).order(orden.campo, { ascending: orden.asc }).order('id');
}

export async function listarLeads(f: FiltroLeads, orden: Orden, pagina: number, porPagina: number) {
  const desde = (pagina - 1) * porPagina;
  const { data, count, error } = await base(f, orden).range(desde, desde + porPagina - 1);
  if (error) throw error;
  return { filas: (data ?? []) as Lead[], total: count ?? 0 };
}

export async function todosLosLeads(f: FiltroLeads, orden: Orden): Promise<Lead[]> {
  const out: Lead[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await base(f, orden).range(desde, desde + 999);
    if (error) throw error;
    out.push(...((data ?? []) as Lead[]));
    if (!data || data.length < 1000) return out;
  }
}

export async function actualizarLead(id: string, cambios: Partial<Lead>) {
  const { fuentes: _omit, ...resto } = cambios;
  const { error } = await supabase.from('leads').update(resto).eq('id', id);
  if (error) throw error;
}

export async function cambiarEstado(ids: string[], estado: string) {
  const { error } = await supabase.from('leads').update({ status: estado }).in('id', ids);
  if (error) throw error;
}

export async function listarFuentes(tipo?: Fuente['tipo']): Promise<Fuente[]> {
  let q = supabase.from('fuentes').select('*').order('nombre');
  if (tipo) q = q.eq('tipo', tipo);
  const { data, error } = await q;
  if (error) throw error;
  return data as Fuente[];
}

export async function fuentePorSlug(slug: string): Promise<Fuente | null> {
  const { data, error } = await supabase.from('fuentes').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as Fuente | null;
}

export async function guardarFuente(f: Partial<Fuente> & { id?: string }): Promise<Fuente> {
  const { clave_hash: _no, actualizado_en: _no2, ...datos } = f;
  const q = f.id ? supabase.from('fuentes').update(datos).eq('id', f.id) : supabase.from('fuentes').insert(datos);
  const { data, error } = await q.select('*').single();
  if (error) throw error;
  return data as Fuente;
}
```

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit && npm test` → sin errores.
```bash
git add apps/leads/src/lib/leads
git commit -m "feat(leads): modelo de filtros avanzados y capa de datos"
```

---

### Task 10: Tabla de leads con filtros avanzados

**Files:**
- Create: `apps/leads/src/components/leads/{LeadsTable,FiltrosPanel,ChipsFiltros,ColumnasMenu,EditarLeadModal}.tsx`
- Create: `apps/leads/app/(shell)/leads/page.tsx`
- Reference (diseño): `../vireo/Templates/Next/src/screens/crm/Leads.tsx`, `../vireo/Templates/Next/src/screens/tables/DataTables.tsx` (clases `ax-table*`, `ax-badge--*`, `ax-checkbox`, `ax-menu__item`, paginación del footer, estado vacío).

**Interfaces:**
- Consumes: `listarLeads`, `cambiarEstado`, `actualizarLead`, `listarFuentes`, `ESTADOS`, `Lead`, `Fuente`, `Orden` (Task 9); `aplicarFiltro`, `describirFiltro`, `quitarDeFiltro`, `FILTRO_VACIO`, `OPERADORES`, `FiltroLeads` (Task 9); `useAuth().puedeEditar` (Task 8); `exportarLeads` (Task 12 — hasta entonces el botón exportar queda oculto).
- Produces: `<LeadsTable fuenteFija?: Fuente />` — si `fuenteFija` viene, fija `fuentes=[id]`, oculta el filtro de fuente y agrega como columnas las claves de `fuenteFija.campos` que no sean núcleo.

- [ ] **Step 1: Columnas y estado base**

`LeadsTable.tsx` mantiene: `filtro: FiltroLeads`, `orden: Orden` (default `{campo:'created_at', asc:false}`), `pagina`, `porPagina` (25/50/100), `seleccion: Set<string>`, `visibles: string[]` (persistido en `localStorage` clave `leads:columnas:<fuente|todas>`, con try/catch). Columnas disponibles:
```ts
const BASE = [
  { key: 'nombre', label: 'Nombre', render: (l: Lead) => `${l.nombres ?? ''} ${l.apellido ?? ''}`.trim() || '—', orden: 'nombres' },
  { key: 'email', label: 'Correo', orden: 'email' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'empresa', label: 'Empresa', orden: 'empresa' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'rubro', label: 'Rubro', orden: 'rubro' },
  { key: 'ruc', label: 'RUC/DNI' },
  { key: 'fuente', label: 'Fuente', render: (l: Lead) => l.fuentes?.nombre ?? '—' },
  { key: 'status', label: 'Estado', orden: 'status' },
  { key: 'created_at', label: 'Registrado', orden: 'created_at', render: (l: Lead) => new Date(l.created_at).toLocaleString('es-PE') },
];
```
Columnas extra = `fuenteFija.campos.filter(c => !esNucleo(c.key)).map(c => ({ key: c.key, label: c.label, render: l => l.extra[c.key] ?? '—' }))`.
Carga: `useEffect` sobre `[filtro, orden, pagina, porPagina]` → `listarLeads(...)`; búsqueda con debounce de 300 ms.

- [ ] **Step 2: UI de tabla (portar markup Vireo)**

Tomar de `crm/Leads.tsx` la estructura: toolbar (`ax-cluster`: input búsqueda con ícono, botón "Filtros" con contador, `ColumnasMenu`, botones Importar/Exportar), `ChipsFiltros` bajo la toolbar, `ax-table-wrap > table.ax-table.ax-table--hover`, cabecera con `SortGlyph` en columnas con `orden`, checkbox de selección por fila + "seleccionar página", badge de estado:
```ts
const claseEstado: Record<string, string> = { nuevo: 'ax-badge--info', contactado: 'ax-badge--accent', asistio: 'ax-badge--success', descartado: 'ax-badge--danger' };
```
Footer: "Mostrando X–Y de Z", selector por página, botones anterior/siguiente. Estado vacío: "No hay leads con estos filtros" + botón "Limpiar filtros". Estado error: mensaje + "Reintentar".
Barra de acciones masivas (visible con `seleccion.size > 0` y `puedeEditar`): select de estado → `cambiarEstado([...seleccion], estado)` y recargar; "Exportar selección".
Click en fila → `EditarLeadModal`.

- [ ] **Step 3: FiltrosPanel (drawer lateral)**

Panel `role="dialog"` a la derecha (usar `useFocusTrap` de `src/hooks`), con:
- Fuentes: checkboxes (de `listarFuentes()`), oculto si `fuenteFija`.
- Estados: chips toggle de `ESTADOS`.
- Rango de fechas: dos `<input type="date">`.
- Constructor de condiciones: lista de filas `[campo ▾][operador ▾][valor]` + "Agregar condición". Campos del select = núcleo (`NUCLEO`) + claves extra conocidas (de `fuenteFija.campos` o, sin fuente fija, de todas las fuentes cargadas). Valor oculto para `vacio`/`no_vacio`; para campo tipo `opcion` el valor es un select con `opciones`.
- Filtros guardados: select "Mis filtros" (tabla `filtros_guardados`, `select('id,nombre,definicion')`) → aplica `definicion`; botón "Guardar filtro actual" pide nombre y hace `insert({ nombre, definicion: filtro })`; ícono borrar por filtro.
- Botones "Aplicar" (setea filtro, pagina=1) y "Limpiar".

- [ ] **Step 4: ChipsFiltros y ColumnasMenu**

```tsx
// ChipsFiltros.tsx
export function ChipsFiltros({ filtro, onCambio, nombreFuente }: { filtro: FiltroLeads; onCambio: (f: FiltroLeads) => void; nombreFuente: (id: string) => string }) {
  const chips = describirFiltro(filtro, nombreFuente);
  if (!chips.length) return null;
  return (
    <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
      {chips.map((c) => (
        <span key={c.clave} className="ax-badge ax-badge--neutral">
          {c.texto}
          <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label={`Quitar ${c.texto}`}
            onClick={() => onCambio(quitarDeFiltro(filtro, c.clave))}>×</button>
        </span>
      ))}
      <button type="button" className="ax-btn ax-btn--link ax-btn--sm" onClick={() => onCambio(FILTRO_VACIO)}>Limpiar todo</button>
    </div>
  );
}
```
`ColumnasMenu`: `Dropdown` (de `src/components/ui/Dropdown.tsx`) con checkbox por columna; mínimo 1 visible.

- [ ] **Step 5: EditarLeadModal**

Modal con los campos núcleo (inputs), `status` (select), y los extra de la fuente (inputs por `campos`, o pares clave/valor de `lead.extra` si la fuente no los declara). Solo lectura si `!puedeEditar`. Guardar → `validarLead(separarLead(form), campos)`; si hay errores, marcarlos en cada input con `aria-invalid` y mensaje; si no, `actualizarLead(id, { ...núcleo, status, extra })` y cerrar + recargar.

- [ ] **Step 6: Página**

`apps/leads/app/(shell)/leads/page.tsx`:
```tsx
'use client';
import { PageHead } from '../../../src/components/shell/PageHead';
import { LeadsTable } from '../../../src/components/leads/LeadsTable';

export default function Page() {
  return (
    <>
      <PageHead title="Todos los leads" />
      <LeadsTable />
    </>
  );
}
```
Revisar la firma real de `PageHead` en `src/components/shell/PageHead.tsx` y ajustar props.

- [ ] **Step 7: Verificar en navegador**

Cargar data de prueba:
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "
  insert into fuentes (nombre, slug, tipo, campos) values ('Prueba','prueba','landing','[{\"key\":\"ciudad\",\"label\":\"Ciudad\",\"tipo\":\"texto\",\"requerido\":false}]') on conflict do nothing;
  insert into leads (fuente_id, nombres, email, rubro, extra, created_at)
  select (select id from fuentes where slug='prueba'), 'Lead '||g, 'l'||g||'@x.com', (array['Minería','Geología','TI'])[1+g%3],
         jsonb_build_object('ciudad', (array['Lima','Arequipa'])[1+g%2]), now() - (g||' hours')::interval
  from generate_series(1,120) g;"
```
En `/leads`: paginación (5 páginas de 25), orden por Registrado, búsqueda "Lead 1", filtro rubro = Minería, condición ciudad contiene "are", chips removibles, guardar/cargar filtro, ocultar columna y recargar (persiste), editar un lead y cambiar estado en lote. Consola sin errores. Captura de pantalla.

- [ ] **Step 8: Commit**

```bash
git add apps/leads
git commit -m "feat(leads): tabla de leads con búsqueda, filtros avanzados, columnas y edición"
```

---

### Task 11: Dashboard con gráficas

**Files:**
- Create: `apps/leads/src/screens/Dashboard.tsx`
- Modify: `apps/leads/app/(shell)/page.tsx`
- Reference: `../vireo/Templates/Next/src/screens/dashboards/Crm.tsx` (KPIs `ax-kpi*`, grid `ax-dash-grid`/`ax-col--*`, tarjetas `ax-card__header`), `apps/leads/src/components/charts/ApexChart.tsx`.

**Interfaces:**
- Consumes: RPC `dashboard_resumen(p_fuentes, p_desde, p_hasta)` (Task 4); `listarFuentes` (Task 9); `<ApexChart type series height apex ariaLabel />`.

- [ ] **Step 1: Pantalla**

`apps/leads/src/screens/Dashboard.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { listarFuentes, type Fuente } from '../lib/leads/datos';
import { ApexChart } from '../components/charts/ApexChart';
import { PageHead } from '../components/shell/PageHead';

interface Resumen {
  total: number; personas_unicas: number; hoy: number; semana: number; contactados: number;
  por_dia: { dia: string; n: number }[]; por_fuente: { fuente: string; n: number }[];
  por_estado: { estado: string; n: number }[]; por_rubro: { rubro: string; n: number }[];
  por_cargo: { cargo: string; n: number }[];
}
const ORDEN_EMBUDO = ['nuevo', 'contactado', 'asistio'];

export function Dashboard() {
  const [fuentes, setFuentes] = useState<Fuente[]>([]);
  const [sel, setSel] = useState<string>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [r, setR] = useState<Resumen | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { listarFuentes().then(setFuentes).catch(() => setFuentes([])); }, []);
  useEffect(() => {
    setError('');
    supabase.rpc('dashboard_resumen', { p_fuentes: sel ? [sel] : null, p_desde: desde || null, p_hasta: hasta || null })
      .then(({ data, error: e }) => (e ? setError('No se pudo cargar el resumen.') : setR(data as Resumen)));
  }, [sel, desde, hasta]);

  const pct = r && r.total ? Math.round((r.contactados / r.total) * 100) : 0;
  const kpis = r ? [
    { label: 'Total leads', valor: r.total },
    { label: 'Personas únicas', valor: r.personas_unicas },
    { label: 'Nuevos hoy', valor: r.hoy },
    { label: 'Últimos 7 días', valor: r.semana },
    { label: '% contactados', valor: `${pct}%` },
  ] : [];

  return (
    <>
      <PageHead title="Dashboard" />
      <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', marginBottom: 'var(--ax-space-4)', flexWrap: 'wrap' }}>
        <select className="ax-select" aria-label="Fuente" value={sel} onChange={(e) => setSel(e.target.value)}>
          <option value="">Todas las fuentes</option>
          {fuentes.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
        </select>
        <input className="ax-input" type="date" aria-label="Desde" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <input className="ax-input" type="date" aria-label="Hasta" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </div>
      {error && <div className="ax-card" role="alert"><div className="ax-card__body">{error}</div></div>}
      {r && (
        <div className="ax-dash-grid">
          {kpis.map((k) => (
            <div key={k.label} className="ax-card ax-kpi ax-col--3">
              <div className="ax-card__body">
                <div className="ax-kpi__label">{k.label}</div>
                <div className="ax-kpi__value ax-num">{k.valor}</div>
              </div>
            </div>
          ))}
          <Tarjeta titulo="Leads por día" col={12}>
            {r.por_dia.length ? (
              <ApexChart type="area" height={300} ariaLabel="Leads por día"
                series={[{ name: 'Leads', data: r.por_dia.map((d) => ({ x: d.dia, y: d.n })) }]}
                apex={{ xaxis: { type: 'datetime' } }} />
            ) : <Vacio />}
          </Tarjeta>
          <Tarjeta titulo="Por fuente" col={6}>
            {r.por_fuente.length ? (
              <ApexChart type="bar" height={300} ariaLabel="Leads por fuente"
                series={[{ name: 'Leads', data: r.por_fuente.map((d) => d.n) }]}
                apex={{ xaxis: { categories: r.por_fuente.map((d) => d.fuente) }, plotOptions: { bar: { horizontal: true } } }} />
            ) : <Vacio />}
          </Tarjeta>
          <Tarjeta titulo="Por estado" col={6}>
            {r.por_estado.length ? (
              <ApexChart type="donut" height={300} ariaLabel="Leads por estado"
                series={r.por_estado.map((d) => d.n)} apex={{ labels: r.por_estado.map((d) => d.estado) }} />
            ) : <Vacio />}
          </Tarjeta>
          <Tarjeta titulo="Top rubros" col={6}>
            <ApexChart type="bar" height={300} ariaLabel="Top rubros"
              series={[{ name: 'Leads', data: r.por_rubro.map((d) => d.n) }]}
              apex={{ xaxis: { categories: r.por_rubro.map((d) => d.rubro) } }} />
          </Tarjeta>
          <Tarjeta titulo="Embudo" col={6}>
            <ApexChart type="bar" height={300} ariaLabel="Embudo de estados"
              series={[{ name: 'Leads', data: ORDEN_EMBUDO.map((e) => r.por_estado.find((x) => x.estado === e)?.n ?? 0) }]}
              apex={{ xaxis: { categories: ORDEN_EMBUDO }, plotOptions: { bar: { horizontal: true, isFunnel: true } } }} />
          </Tarjeta>
          <Tarjeta titulo="Top cargos" col={12}>
            <ApexChart type="bar" height={300} ariaLabel="Top cargos"
              series={[{ name: 'Leads', data: r.por_cargo.map((d) => d.n) }]}
              apex={{ xaxis: { categories: r.por_cargo.map((d) => d.cargo) } }} />
          </Tarjeta>
        </div>
      )}
    </>
  );
}

function Tarjeta({ titulo, col, children }: { titulo: string; col: 3 | 4 | 6 | 12; children: React.ReactNode }) {
  return (
    <section className={`ax-card ax-col--${col}`}>
      <header className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title">{titulo}</h2></div></header>
      <div className="ax-card__body">{children}</div>
    </section>
  );
}
function Vacio() { return <p className="ax-text-subtle">Sin datos en este rango.</p>; }
```
Si `ax-col--6` no existe en los estilos copiados, buscar en `src/styles` la clase de columna equivalente (`grep -r "ax-col--" apps/leads/src/styles`).

`app/(shell)/page.tsx`:
```tsx
export { Dashboard as default } from '../../src/screens/Dashboard';
```

- [ ] **Step 2: Verificar**

Preview `/`: 5 KPIs con números coherentes con los 120 leads de prueba, 6 gráficas pintadas, cambiar fuente/fechas actualiza; alternar tema claro/oscuro desde el customizer re-colorea gráficas. Consola sin errores. Captura.

- [ ] **Step 3: Commit**

```bash
git add apps/leads
git commit -m "feat(leads): dashboard con KPIs y gráficas ApexCharts"
```

---

### Task 12: Importar y exportar Excel/CSV

**Files:**
- Create: `apps/leads/src/lib/leads/mapeo.ts`
- Test: `apps/leads/src/lib/leads/mapeo.test.ts`
- Create: `apps/leads/src/lib/leads/exportar.ts`
- Create: `apps/leads/src/screens/Importar.tsx`, `apps/leads/app/(shell)/leads/importar/page.tsx`
- Modify: `apps/leads/src/components/leads/LeadsTable.tsx` (botón Exportar)

**Interfaces:**
- Consumes: `separarLead`, `validarLead`, `NUCLEO`, `CampoFormulario` (Task 5); RPC `importar_leads` (Task 4); `todosLosLeads`, `listarFuentes`, `guardarFuente` (Task 9).
- Produces:
```ts
// mapeo.ts
export type Mapeo = Record<string, string | null>;   // encabezado del archivo → clave de campo (null = ignorar)
export function normalizarEncabezado(h: string): string;
export function sugerirMapeo(encabezados: string[], campos: CampoFormulario[]): Mapeo;
export function construirFilas(filas: Record<string, unknown>[], mapeo: Mapeo, campos: CampoFormulario[]):
  { validas: { fila: number; lead: LeadEntrada }[]; errores: { fila: number; errores: ErrorCampo[]; original: Record<string, unknown> }[] };
// exportar.ts
export async function exportarLeads(leads: Lead[], columnas: { key: string; label: string }[], formato: 'xlsx' | 'csv', nombre: string): Promise<void>;
export async function leerArchivo(file: File): Promise<{ encabezados: string[]; filas: Record<string, unknown>[] }>;
```

- [ ] **Step 1: Test que falla**

`apps/leads/src/lib/leads/mapeo.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { construirFilas, normalizarEncabezado, sugerirMapeo } from './mapeo';
import type { CampoFormulario } from '../../../supabase/functions/_shared/lead';

const campos: CampoFormulario[] = [{ key: 'ciudad', label: 'Ciudad', tipo: 'texto', requerido: false }];

describe('normalizarEncabezado', () => {
  it('quita tildes, mayúsculas y símbolos', () => {
    expect(normalizarEncabezado('  Correo Electrónico* ')).toBe('correo_electronico');
  });
});

describe('sugerirMapeo', () => {
  it('reconoce sinónimos comunes y campos de la fuente', () => {
    expect(sugerirMapeo(['Nombre', 'Apellidos', 'E-mail', 'Celular', 'Razón Social', 'DNI', 'Ciudad', 'Notas'], campos)).toEqual({
      Nombre: 'nombres', Apellidos: 'apellido', 'E-mail': 'email', Celular: 'telefono',
      'Razón Social': 'empresa', DNI: 'ruc', Ciudad: 'ciudad', Notas: 'notas',
    });
  });
});

describe('construirFilas', () => {
  it('aplica mapeo, ignora columnas null y separa válidas de errores', () => {
    const r = construirFilas(
      [{ A: 'Ana', B: 'ana@x.com', C: 'ignorar' }, { A: 'Luis', B: 'malo', C: '' }],
      { A: 'nombres', B: 'email', C: null },
      [],
    );
    expect(r.validas).toEqual([{ fila: 2, lead: { nombres: 'Ana', email: 'ana@x.com', extra: {} } }]);
    expect(r.errores[0].fila).toBe(3);
    expect(r.errores[0].errores).toEqual([{ campo: 'email', motivo: 'formato' }]);
  });
});
```
(Fila 2/3 = número de fila en Excel, contando el encabezado como fila 1.)

Run: `npm test` → FAIL.

- [ ] **Step 2: Implementación de mapeo**

`apps/leads/src/lib/leads/mapeo.ts`:
```ts
import { separarLead, validarLead, type CampoFormulario, type ErrorCampo, type LeadEntrada } from '../../../supabase/functions/_shared/lead';

export type Mapeo = Record<string, string | null>;

export function normalizarEncabezado(h: string): string {
  return h.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

const SINONIMOS: Record<string, string> = {
  nombre: 'nombres', nombres: 'nombres', first_name: 'nombres',
  apellido: 'apellido', apellidos: 'apellido', last_name: 'apellido',
  email: 'email', e_mail: 'email', correo: 'email', correo_electronico: 'email', mail: 'email',
  telefono: 'telefono', celular: 'telefono', movil: 'telefono', whatsapp: 'telefono', phone: 'telefono',
  empresa: 'empresa', razon_social: 'empresa', compania: 'empresa', company: 'empresa',
  ruc: 'ruc', dni: 'ruc', ruc_dni: 'ruc', documento: 'ruc',
  cargo: 'cargo', puesto: 'cargo', rubro: 'rubro', sector: 'rubro', industria: 'rubro',
  fecha_nacimiento: 'fecha_nacimiento', cumpleanos: 'fecha_nacimiento', nacimiento: 'fecha_nacimiento',
};

export function sugerirMapeo(encabezados: string[], campos: CampoFormulario[]): Mapeo {
  const porCampo = new Map<string, string>();
  for (const c of campos) {
    porCampo.set(normalizarEncabezado(c.key), c.key);
    porCampo.set(normalizarEncabezado(c.label), c.key);
  }
  const out: Mapeo = {};
  for (const h of encabezados) {
    const n = normalizarEncabezado(h);
    out[h] = SINONIMOS[n] ?? porCampo.get(n) ?? (n || null);
  }
  return out;
}

export function construirFilas(filas: Record<string, unknown>[], mapeo: Mapeo, campos: CampoFormulario[]) {
  const validas: { fila: number; lead: LeadEntrada }[] = [];
  const errores: { fila: number; errores: ErrorCampo[]; original: Record<string, unknown> }[] = [];
  filas.forEach((original, i) => {
    const datos: Record<string, unknown> = {};
    for (const [h, destino] of Object.entries(mapeo)) if (destino) datos[destino] = original[h];
    const lead = separarLead(datos);
    const errs = validarLead(lead, campos);
    if (errs.length) errores.push({ fila: i + 2, errores: errs, original });
    else validas.push({ fila: i + 2, lead });
  });
  return { validas, errores };
}
```
Run: `npm test` → PASS.

- [ ] **Step 3: Lectura y exportación con SheetJS**

`apps/leads/src/lib/leads/exportar.ts`:
```ts
import type { Lead } from './datos';

export async function leerArchivo(file: File) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer(), { cellDates: false });
  const hoja = wb.Sheets[wb.SheetNames[0]];
  // raw:false + dateNF → las fechas de Excel llegan como texto ISO, no como número serial.
  const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: '', raw: false, dateNF: 'yyyy-mm-dd' });
  const encabezados = (XLSX.utils.sheet_to_json<string[]>(hoja, { header: 1 })[0] ?? []).map(String);
  return { encabezados, filas };
}

export function valorColumna(l: Lead, key: string): string {
  if (key === 'nombre') return `${l.nombres ?? ''} ${l.apellido ?? ''}`.trim();
  if (key === 'fuente') return l.fuentes?.nombre ?? '';
  const v = (l as unknown as Record<string, unknown>)[key];
  if (v !== undefined && v !== null && typeof v !== 'object') return String(v);
  return l.extra?.[key] ?? '';
}

export async function exportarLeads(leads: Lead[], columnas: { key: string; label: string }[], formato: 'xlsx' | 'csv', nombre: string) {
  const XLSX = await import('xlsx');
  const filas = leads.map((l) => Object.fromEntries(columnas.map((c) => [c.label, valorColumna(l, c.key)])));
  const hoja = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, hoja, 'Leads');
  XLSX.writeFile(wb, `${nombre}.${formato}`, { bookType: formato });
}
```
En `LeadsTable.tsx`: botón "Exportar" (menú: Excel / CSV) → `exportarLeads(await todosLosLeads(filtro, orden), columnasVisibles, formato, 'leads-' + fecha)`. Con selección activa, exporta solo `filas.filter(l => seleccion.has(l.id))` de la página. Mostrar "Preparando…" mientras corre.

- [ ] **Step 4: Asistente de importación**

`apps/leads/src/screens/Importar.tsx` — 3 pasos con indicador (tomar el estilo de wizard de `../vireo/Templates/Next/src/screens/forms/` si existe uno; si no, `ax-tabs__tab` como pasos):

1. **Archivo y fuente**: `<input type="file" accept=".xlsx,.xls,.csv">` → `leerArchivo`; select de fuente destino (solo fuentes donde `puedeEditar`; admin puede "Crear fuente de importación nueva" → `guardarFuente({ nombre, slug: slugify(nombre), tipo: 'importacion', campos: [] })`). Mostrar nº de filas detectadas; máximo 50 000 filas (si excede, error claro).
2. **Mapear columnas**: tabla `Columna del archivo | Ejemplo (primera fila) | Guardar como [select]`; opciones del select: `— Ignorar —`, los `NUCLEO` con etiqueta, los `campos` de la fuente, y "Campo nuevo: <encabezado normalizado>". Valor inicial = `sugerirMapeo`. Si el usuario es admin y mapea a "Campo nuevo", al confirmar se agregan a `fuente.campos` como `{ key, label: encabezado, tipo: 'texto', requerido: false }` con `guardarFuente`.
3. **Vista previa y confirmar**: `construirFilas` → "N filas válidas, M con errores"; tabla de las primeras 20 válidas; lista de errores (fila + campo + motivo) con botón "Descargar errores (CSV)" usando `exportarLeads`-like con las filas `original` + columna `errores`. Botón "Importar N filas":
```ts
let nuevas = 0, actualizadas = 0; const erroresServidor: { fila: number; motivo: string }[] = [];
for (let i = 0; i < validas.length; i += 500) {
  const lote = validas.slice(i, i + 500);
  const { data, error } = await supabase.rpc('importar_leads', {
    p_fuente: fuente.id,
    p_filas: lote.map((v) => v.lead),
    p_archivo: archivo.name,
  });
  if (error) throw error;
  nuevas += data.nuevas; actualizadas += data.actualizadas;
  for (const e of data.errores) erroresServidor.push({ fila: lote[e.fila - 1].fila, motivo: e.motivo });
  setProgreso(Math.min(i + 500, validas.length));
}
```
Resultado final: "X nuevas, Y actualizadas, Z con error" + enlace "Ver en la tabla" (`/leads` con filtro de esa fuente vía `?fuente=<id>`; `LeadsTable` lee ese query param al montar) + historial de las últimas 10 `importaciones` de esa fuente.

`app/(shell)/leads/importar/page.tsx`:
```tsx
export { Importar as default } from '../../../../src/screens/Importar';
```

- [ ] **Step 5: Verificar**

Crear en scratchpad un `.xlsx` de prueba (SheetJS desde node):
```bash
cd apps/leads && node -e "
const X=require('xlsx');const rows=[{Nombre:'Ana',Apellidos:'Ruiz','E-mail':'ana@imp.com',Celular:'987 654 321',Ciudad:'Lima',Notas:'vip'},
{Nombre:'Luis','E-mail':'malo',Celular:'',Ciudad:'Cusco'},{Nombre:'Ana 2','E-mail':'ANA@imp.com',Ciudad:'Lima'}];
const wb=X.utils.book_new();X.utils.book_append_sheet(wb,X.utils.json_to_sheet(rows),'H');X.writeFile(wb,process.argv[1]);" "$TMP/prueba-import.xlsx"
```
Importar a una fuente nueva "Importación prueba": mapeo sugerido correcto, 2 válidas + 1 error (Luis), resultado "1 nueva, 1 actualizada" (la 2ª Ana actualiza a la 1ª). En `/leads` aparece Ana con `extra.notas = vip`. Exportar a Excel y CSV con filtros → abrir el archivo descargado y verificar columnas visibles. Consola sin errores.

- [ ] **Step 6: Commit**

```bash
git add apps/leads
git commit -m "feat(leads): importación Excel/CSV con mapeo y exportación con filtros"
```

---

### Task 13: Módulo Landings y Apps offline (gestionar + registros + duplicar)

**Files:**
- Create: `apps/leads/src/components/fuentes/{FuentesLista,GestionarFuente,CamposEditor}.tsx`
- Create: `apps/leads/app/(shell)/landings/page.tsx`, `landings/[slug]/page.tsx`, `landings/[slug]/registros/page.tsx`
- Create: `apps/leads/app/(shell)/offline/page.tsx`, `offline/[slug]/page.tsx`, `offline/[slug]/registros/page.tsx`
- Modify: `apps/leads/src/components/shell/Sidebar.tsx` (hijos dinámicos por fuente)

**Interfaces:**
- Consumes: `listarFuentes`, `fuentePorSlug`, `guardarFuente`, `Fuente` (Task 9); RPC `regenerar_clave_fuente`, `duplicar_fuente` (Task 4); `<LeadsTable fuenteFija>` (Task 10); `esAdmin` (Task 8).
- Produces: `<FuentesLista tipo="landing"|"offline" />`, `<GestionarFuente slug tipo />`, `<CamposEditor value onChange />`.

- [ ] **Step 1: Sidebar con fuentes dinámicas**

En `Sidebar.tsx`, en el componente que pinta un grupo L1 (el mismo punto donde `apps/web` inyectaba `showBrands` para marcas), para los nodos `grp.landings` y `grp.offline` cargar `listarFuentes('landing' | 'offline')` (una vez, en un hook `useFuentesMenu()` con estado compartido y `refrescarFuentes()` exportado para invalidar tras crear/duplicar/renombrar) y pintar por fuente:
```
Landings
  ├ Todas las landings           → /landings
  ├ EXPOMINA Perú 2026   ▸
  │    ├ Gestionar                → /landings/expomina-peru-2026
  │    └ Registros                → /landings/expomina-peru-2026/registros
  └ Semana de Ingeniería … ▸
```
Usar las mismas clases de nav de nivel 2/3 (`ax-nav__*`) que usa el Sidebar para nodos anidados; el ítem activo se resuelve comparando `pathname`. Fuentes cerradas llevan badge `ax-badge--neutral` "cerrada".

- [ ] **Step 2: FuentesLista**

Tabla (`ax-table`) con: Nombre, Dominio, Estado (badge), Nº registros (`select('fuente_id', {count:'exact', head:true}).eq('fuente_id', id).is('duplicado_de', null)` por fila, o una sola consulta agrupada vía `dashboard_resumen().por_fuente` si se prefiere), Última actualización, acciones: "Gestionar", "Registros", "Duplicar" (admin). Botón "Nueva landing"/"Nueva app offline" (admin) → modal nombre + slug (autogenerado con `slugify` JS equivalente al SQL, editable, validado `^[a-z0-9]+(-[a-z0-9]+)*$`) → `guardarFuente({ nombre, slug, tipo, campos: [] })` → navegar a Gestionar.
"Duplicar" → modal nombre/slug nuevos → `supabase.rpc('duplicar_fuente', { p_fuente, p_nombre, p_slug })` → navegar a Gestionar de la copia. Texto de ayuda en el modal: "Se copian campos del formulario, dominio y correo de agradecimiento. Los registros no se copian. El diseño visual se clona del repositorio de la landing."

- [ ] **Step 3: CamposEditor**

Lista editable de `CampoFormulario`: filas con `key` (solo lectura si ya existe, para no romper `extra`), `label`, `tipo` (select de `TipoCampo`), `requerido` (checkbox), `opciones` (input separado por comas, visible si `tipo==='opcion'`), botones subir/bajar/eliminar, "Agregar campo" (key autogenerada de label con `normalizarEncabezado` de `mapeo.ts`, validada única). Los núcleo aparecen con badge "núcleo".

- [ ] **Step 4: GestionarFuente**

Secciones en tarjetas (`ax-card`):
1. **Datos**: nombre, slug (solo lectura), dominio, estado (activa/cerrada) → Guardar.
2. **Formulario**: `CamposEditor` → Guardar.
3. **Clave de envío** (admin): muestra "Configurada" / "Sin clave". Botón "Generar/Regenerar clave" → confirmación ("Las landings que usen la clave anterior dejarán de enviar datos") → `rpc('regenerar_clave_fuente')` → mostrar la clave una sola vez con botón copiar y aviso "Guárdala ahora, no se vuelve a mostrar". Debajo, snippet de integración:
```js
fetch('https://<proyecto>.supabase.co/functions/v1/ingresar-lead', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ slug: '<slug>', clave: '<clave>', datos: { nombres, email, ... } })
});
```
(URL tomada de `process.env.NEXT_PUBLIC_SUPABASE_URL`.)
4. **Correo de agradecimiento** (solo tipo landing): activo (switch), asunto, plantilla HTML (textarea, con nota "usa {{nombre}} para el nombre") → Guardar en `correo_gracias`.
5. **Resumen**: total registros, últimos 7 días, enlace "Ver registros".

Lector: todo en solo lectura, sin sección de clave.

- [ ] **Step 5: Páginas**

`app/(shell)/landings/page.tsx`:
```tsx
'use client';
import { FuentesLista } from '../../../src/components/fuentes/FuentesLista';
export default function Page() { return <FuentesLista tipo="landing" />; }
```
`app/(shell)/landings/[slug]/page.tsx`:
```tsx
'use client';
import { use } from 'react';
import { GestionarFuente } from '../../../../src/components/fuentes/GestionarFuente';
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <GestionarFuente slug={slug} tipo="landing" />;
}
```
`app/(shell)/landings/[slug]/registros/page.tsx`:
```tsx
'use client';
import { use, useEffect, useState } from 'react';
import { fuentePorSlug, type Fuente } from '../../../../../src/lib/leads/datos';
import { LeadsTable } from '../../../../../src/components/leads/LeadsTable';
import { PageHead } from '../../../../../src/components/shell/PageHead';

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [f, setF] = useState<Fuente | null | undefined>(undefined);
  useEffect(() => { fuentePorSlug(slug).then(setF).catch(() => setF(null)); }, [slug]);
  if (f === undefined) return null;
  if (f === null) return <p>Landing no encontrada o sin acceso.</p>;
  return (<><PageHead title={`Registros · ${f.nombre}`} /><LeadsTable fuenteFija={f} /></>);
}
```
Las 3 de `offline/` son idénticas con `tipo="offline"` y textos "App offline".

- [ ] **Step 6: Verificar**

Con el admin local: `/landings` lista las fuentes landing; crear "Feria Test", editar campos (agregar "Talla" opción S/M/L requerida), generar clave, activar correo; duplicar "Feria Test" → "Feria Test 2" con los mismos campos y sin registros; sidebar muestra ambas con submenú; Registros de una fuente muestra columna "Talla". Enviar un lead con curl a `ingresar-lead` con la clave generada → aparece en Registros. Verificar como editor (crear usuario con `perfiles.rol='editor'` + `perfil_fuentes` a una sola fuente vía psql): solo ve esa fuente en menú, tabla y dashboard; no ve "Duplicar"/"Nueva"/clave. Captura.

- [ ] **Step 7: Commit**

```bash
git add apps/leads
git commit -m "feat(leads): módulo landings y apps offline con gestión, registros y duplicado"
```

---

### Task 14: Exportación y aplicaciones conectadas

**Files:**
- Create: `apps/leads/src/screens/Exportacion.tsx`, `apps/leads/app/(shell)/exportacion/page.tsx`

**Interfaces:**
- Consumes: `exportarLeads`, `todosLosLeads`, `listarFuentes`, `FiltrosPanel`, `ChipsFiltros` (Tasks 9–12); RPC `crear_aplicacion`, `regenerar_clave_aplicacion` (Task 4); tabla `aplicaciones`; `esAdmin`.

- [ ] **Step 1: Pestaña "Exportar archivo"**

Filtros (reusar `FiltrosPanel` + `ChipsFiltros`), selector de columnas (checkboxes: columnas base + claves extra de las fuentes seleccionadas), formato (Excel/CSV), vista previa del conteo (`listarLeads(filtro, orden, 1, 1).total`), botón "Descargar" → `exportarLeads(await todosLosLeads(filtro, orden), columnas, formato, 'leads-' + YYYY-MM-DD)`.

- [ ] **Step 2: Pestaña "Aplicaciones conectadas" (admin)**

Tabla: Nombre, Permisos, Alcance (todas / lista de fuentes), Activa (switch → `update({activa})`), Último uso, acciones "Regenerar clave", "Eliminar" (confirmación).
"Nueva aplicación": modal con nombre (ej. "HUB FPTecnologi"), permisos (checkbox "Leer" marcado y deshabilitado; "Escribir" deshabilitado con nota "Disponible en fase 2"), alcance (radio "Todas las fuentes" / "Elegir fuentes" + checkboxes) → `rpc('crear_aplicacion', { p_nombre, p_permisos: ['leer'], p_fuentes: todas ? null : ids })` → mostrar la clave una sola vez con botón copiar.

- [ ] **Step 3: Documentación de la API en la misma pantalla**

Tarjeta "Cómo conectar" con base URL `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-v1`, cabecera `x-api-key`, y ejemplos:
```bash
curl "$BASE/fuentes" -H "x-api-key: app_..."
curl "$BASE/leads?fuente=expomina-peru-2026&limite=100" -H "x-api-key: app_..."
curl "$BASE/leads?actualizado_desde=2026-09-01T00:00:00Z&cursor=<siguiente>" -H "x-api-key: app_..."
```
Descripción de campos de respuesta (`id, fuente, nombres, apellido, email, telefono, empresa, ruc, cargo, rubro, fecha_nacimiento, estado, extra, creado_en, actualizado_en`) y de la paginación (`siguiente` → pasar como `cursor`; `null` = fin). Nota: "Para sincronizar incrementalmente, guarda el `actualizado_en` del último lead recibido y úsalo en `actualizado_desde` la próxima vez."

`app/(shell)/exportacion/page.tsx`:
```tsx
export { Exportacion as default } from '../../../src/screens/Exportacion';
```

- [ ] **Step 4: Verificar**

Exportar CSV filtrado; crear app "HUB" con alcance a una fuente → copiar clave → `curl .../api-v1/leads -H "x-api-key: <clave>"` devuelve solo leads de esa fuente y `/leads?fuente=<otra>` → 403; desactivar la app → 401; "Último uso" se actualiza. Captura.

- [ ] **Step 5: Commit**

```bash
git add apps/leads
git commit -m "feat(leads): exportación con filtros y aplicaciones conectadas con API v1"
```

---

### Task 15: Usuarios (invitar, rol, fuentes)

**Files:**
- Create: `apps/leads/supabase/functions/admin-usuarios/index.ts`
- Create: `apps/leads/src/screens/Usuarios.tsx`, `apps/leads/app/(shell)/usuarios/page.tsx`

**Interfaces:**
- Produces HTTP (JWT del usuario en `Authorization`, verificado por Supabase; la función exige que sea admin con aal2):
  - `POST /functions/v1/admin-usuarios` `{ accion: 'invitar', email, nombre, rol, fuentes: string[] }` → `{ ok: true, user_id }`
  - `{ accion: 'listar' }` → `{ usuarios: { user_id, email, nombre, rol, fuentes: string[], ultimo_ingreso: string|null, mfa: boolean }[] }`
  - `{ accion: 'actualizar', user_id, rol, fuentes }` → `{ ok: true }`
  - `{ accion: 'desactivar', user_id }` → `{ ok: true }` (ban de Supabase Auth, no borra)

- [ ] **Step 1: Edge Function**

`apps/leads/supabase/functions/admin-usuarios/index.ts`:
```ts
// Gestión de usuarios (requiere service_role para auth.admin). Deploy:
//   supabase functions deploy admin-usuarios   (con verificación de JWT)
import { createClient } from 'npm:@supabase/supabase-js@2';
import { CORS, json } from '../_shared/http.ts';

const URL_ = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(URL_, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const SITE = Deno.env.get('LEADS_SITE_URL') ?? 'http://localhost:3003';
const ROLES = ['admin', 'editor', 'lector'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { ...CORS, 'Access-Control-Allow-Headers': 'authorization, content-type' } });

  const jwt = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const { data: { user } } = await admin.auth.getUser(jwt);
  if (!user) return json({ error: 'no_autenticado' }, 401);
  const claims = JSON.parse(atob(jwt.split('.')[1]));
  const { data: perfil } = await admin.from('perfiles').select('rol').eq('user_id', user.id).maybeSingle();
  if (claims.aal !== 'aal2' || perfil?.rol !== 'admin') return json({ error: 'sin_permiso' }, 403);

  const body = await req.json().catch(() => ({}));
  const asignarFuentes = async (uid: string, fuentes: string[]) => {
    await admin.from('perfil_fuentes').delete().eq('user_id', uid);
    if (fuentes.length) await admin.from('perfil_fuentes').insert(fuentes.map((f) => ({ user_id: uid, fuente_id: f })));
  };

  switch (body.accion) {
    case 'invitar': {
      if (!ROLES.includes(body.rol) || !body.email) return json({ error: 'datos_invalidos' }, 400);
      const { data, error } = await admin.auth.admin.inviteUserByEmail(body.email, { redirectTo: `${SITE}/auth/crear-clave` });
      if (error) return json({ error: 'invitacion_fallida', detalle: error.message }, 400);
      await admin.from('perfiles').upsert({ user_id: data.user.id, nombre: body.nombre ?? '', rol: body.rol });
      await asignarFuentes(data.user.id, body.fuentes ?? []);
      return json({ ok: true, user_id: data.user.id });
    }
    case 'listar': {
      const { data: lista } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const { data: perfiles } = await admin.from('perfiles').select('user_id, nombre, rol');
      const { data: pf } = await admin.from('perfil_fuentes').select('user_id, fuente_id');
      return json({ usuarios: lista.users.map((u) => {
        const p = perfiles?.find((x) => x.user_id === u.id);
        return { user_id: u.id, email: u.email, nombre: p?.nombre ?? '', rol: p?.rol ?? null,
          fuentes: (pf ?? []).filter((x) => x.user_id === u.id).map((x) => x.fuente_id),
          ultimo_ingreso: u.last_sign_in_at ?? null, mfa: (u.factors ?? []).some((f) => f.status === 'verified'),
          desactivado: Boolean(u.banned_until) };
      }) });
    }
    case 'actualizar': {
      if (!ROLES.includes(body.rol)) return json({ error: 'datos_invalidos' }, 400);
      if (body.user_id === user.id && body.rol !== 'admin') return json({ error: 'no_puedes_quitarte_admin' }, 400);
      await admin.from('perfiles').upsert({ user_id: body.user_id, rol: body.rol });
      await asignarFuentes(body.user_id, body.fuentes ?? []);
      return json({ ok: true });
    }
    case 'desactivar': {
      if (body.user_id === user.id) return json({ error: 'no_puedes_desactivarte' }, 400);
      await admin.auth.admin.updateUserById(body.user_id, { ban_duration: '876000h' });
      return json({ ok: true });
    }
  }
  return json({ error: 'accion_desconocida' }, 400);
});
```

- [ ] **Step 2: Pantalla**

`Usuarios.tsx`: llama `supabase.functions.invoke('admin-usuarios', { body: { accion: 'listar' } })`. Tabla (portar `ax-table` + `ax-avatar` de `crm/Leads.tsx`): Usuario (nombre + email), Rol (badge), Fuentes (nombres o "Todas" si admin), 2FA (badge activo/pendiente), Último ingreso, Estado, acciones "Editar" (modal rol + checkboxes de fuentes → `actualizar`) y "Desactivar" (confirmación). Botón "Invitar usuario" → modal email, nombre, rol, fuentes → `invitar` → toast "Invitación enviada a <email>".

`app/(shell)/usuarios/page.tsx`:
```tsx
export { Usuarios as default } from '../../../src/screens/Usuarios';
```
Si `!esAdmin`, la pantalla muestra "Solo administradores" (el menú ya la oculta).

- [ ] **Step 3: Verificar**

`supabase functions serve` + preview: invitar `editor@local.test` como editor de una fuente → el correo aparece en Inbucket local (`http://127.0.0.1:54324`) → abrir enlace → `/auth/crear-clave` → `/auth/activar-2fa` → entra y solo ve su fuente. Admin cambia su rol a lector → tras recargar, el editor ya no ve "Importar" ni puede editar. Desactivar → no puede iniciar sesión.

- [ ] **Step 4: Commit**

```bash
git add apps/leads
git commit -m "feat(leads): gestión de usuarios con invitación, roles y fuentes"
```

---

### Task 16: Revisión de calidad, docs y CI

**Files:**
- Modify: `AGENTS.md` (estructura del repo + sección Sistema de Leads)
- Modify: `docs/ESTADO-ACTUAL.md` (entrada con fecha real)
- Modify: `.github/workflows/ci.yml` (job `apps/leads`: `npm ci && npx tsc --noEmit && npm test && npm run build`)
- Create: `apps/leads/README.md`

- [ ] **Step 1: Suite completa**

```bash
cd apps/leads && npx tsc --noEmit && npm test && npm run build && supabase db reset && supabase test db
```
Expected: todo verde.

- [ ] **Step 2: Docs**

`AGENTS.md`: agregar `apps/leads/` al árbol ("Next.js + Supabase — Sistema de Leads; DB = proyecto Supabase de Expomina, dueño de sus migraciones y Edge Functions") y una sección corta: por qué no usa NestJS (decisión de la spec), dónde viven las migraciones, cómo correr local (`supabase start`, `.env.local`, `npm run dev`), regla "toda entrada externa por Edge Function con clave hasheada". `apps/leads/README.md` con los mismos comandos de arranque y deploy (Task 17). `docs/ESTADO-ACTUAL.md`: entrada fechada con lo construido y lo pendiente (fases 2 y 3).

- [ ] **Step 3: CI**

Agregar job para `apps/leads` siguiendo el patrón de los jobs existentes de `apps/api`/`apps/web` en `ci.yml` (mismo `node-version`, `working-directory: apps/leads`). Build requiere env: usar valores dummy `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321` y `NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy` en el job.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md docs/ESTADO-ACTUAL.md .github/workflows/ci.yml apps/leads/README.md
git commit -m "docs(leads): documentar sistema de leads y agregar CI"
```

---

### Task 17: Despliegue a producción y reconexión de Expomina — **requiere confirmación del usuario en cada paso marcado ⚠**

**Files:**
- Modify (repo `landing-registro-expomina`): `components/RegisterForm.tsx` (llamada a `ingresar-lead`), `.env.example`

- [ ] **Step 1: ⚠ Backup de producción**

```bash
cd apps/leads && supabase link --project-ref qpjxwtvmuqramhqoxkxj
supabase db dump --data-only -f ../../backups/leads-prod-$(date +%F).sql   # carpeta backups/ en .gitignore
supabase db dump -f ../../backups/leads-prod-schema-$(date +%F).sql
```
Anotar el conteo actual: `select count(*) from leads;` (SQL editor) — valor `N_ANTES`.

- [ ] **Step 2: ⚠ Marcar baseline como aplicado y subir migraciones**

Las migraciones de Expomina se corrieron a mano en el SQL editor (sin historial CLI):
```bash
supabase migration repair --status applied 20260901000000
supabase db push --dry-run     # debe listar solo las 3 migraciones 20260923*
supabase db push
```
Verificar: `select count(*) from leads;` = `N_ANTES`; `select nombre, slug from fuentes;` lista los eventos; `select count(*) from leads where duplicado_de is not null;` (anotar).

- [ ] **Step 3: ⚠ Perfiles admin para los usuarios actuales del panel Expomina**

```sql
insert into public.perfiles (user_id, nombre, rol)
select id, coalesce(raw_user_meta_data->>'nombre', email), 'admin' from auth.users
on conflict (user_id) do nothing;
```
(Revisar la lista de `auth.users` con el usuario antes: solo deben quedar admin quienes el usuario indique; el resto se ajusta luego en Usuarios.)

- [ ] **Step 4: ⚠ Deploy de funciones y secrets**

```bash
supabase secrets set LEADS_SITE_URL=https://<dominio-del-sistema-de-leads>
supabase functions deploy ingresar-lead --no-verify-jwt
supabase functions deploy api-v1 --no-verify-jwt
supabase functions deploy send-thank-you --no-verify-jwt
supabase functions deploy admin-usuarios
```
En el dashboard de Supabase → Authentication → URL configuration: agregar el dominio del sistema a Site URL / Redirect URLs; Authentication → MFA: TOTP habilitado.

- [ ] **Step 5: ⚠ Clave de la fuente activa y reconexión de la landing**

Entrar al sistema de leads (producción) como admin → Landings → fuente del evento activo → Generar clave → activar correo de agradecimiento con el asunto/plantilla actuales. En `landing-registro-expomina/components/RegisterForm.tsx`, cambiar el `fetch` a `register-lead` por:
```ts
fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ingresar-lead`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    slug: process.env.NEXT_PUBLIC_LEADS_SLUG,
    clave: process.env.NEXT_PUBLIC_LEADS_CLAVE,
    website: honeypotValue,
    datos: { nombres, apellido, cargo, ruc, empresa, rubro, telefono, email, fecha_nacimiento },
  }),
});
```
Agregar `NEXT_PUBLIC_LEADS_SLUG=` y `NEXT_PUBLIC_LEADS_CLAVE=` a su `.env.example`; manejar respuestas `400 campo_invalido` (mostrar errores por campo) y `409 fuente_cerrada` ("Las inscripciones están cerradas"). Rebuild + deploy de la landing (flujo actual: export estático a cPanel).

- [ ] **Step 6: Prueba end-to-end en producción**

Registrar un lead de prueba desde la landing real → aparece en Registros de la fuente en el sistema, llega el correo de agradecimiento → marcarlo `descartado`. Verificar que `register-lead` ya no recibe tráfico (logs de funciones) y luego: ⚠ `supabase functions delete register-lead`.

- [ ] **Step 7: Deploy de `apps/leads`**

Definir con el usuario dónde se hospeda (mismo cPanel/Node que las otras apps o Vercel). Build: `npm run build` con `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` de producción.

- [ ] **Step 8: Commit**

```bash
git add -A apps/leads docs
git commit -m "chore(leads): despliegue a producción y reconexión de la landing Expomina"
```
(En el repo de la landing, commit aparte con el cambio de `RegisterForm.tsx`.)

---

## Self-review

- Cobertura de la spec (fase 1): arquitectura (T7), seguridad 2FA/RLS/claves (T3, T4, T6, T8), modelo + migración sin pérdida (T2), dashboard (T4, T11), tabla con filtros avanzados/guardados/columnas/masivas (T9, T10), importación con mapeo y errores descargables (T12), exportación (T12, T14), landings gestionar/registros/duplicar + sidebar dinámico (T13), apps offline listado (T13), aplicaciones conectadas + api-v1 lectura (T4, T6, T14), usuarios (T15), ingresar-lead + reconexión Expomina (T6, T17), pruebas SQL/Vitest/smoke (T1–T6, T9, T12). Fase 2 (escritura API, webhooks, HUB) y fase 3 (`sincronizar`) quedan fuera, según la spec.
- Nombres consistentes: `upsert_lead`, `importar_leads`, `dashboard_resumen`, `regenerar_clave_fuente`, `crear_aplicacion`, `duplicar_fuente`, `separarLead`, `validarLead`, `aplicarFiltro`, `listarLeads`, `todosLosLeads`, `exportarLeads`, `leerArchivo`, `sugerirMapeo`, `construirFilas`, `LeadsTable fuenteFija`.
