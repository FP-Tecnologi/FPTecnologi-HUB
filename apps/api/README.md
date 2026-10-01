# API central — FPTecnologi-HUB (NestJS)

API multi-marca (multi-tenant) para el dashboard administrativo (`apps/admin`)
y la futura web pública (fptecnologi.com). Vende
productos (ecommerce) y servicios de soluciones IT.

## Stack
- NestJS 12 (ESM)
- Prisma 6 + PostgreSQL
- JWT (access + refresh token) con 2FA por código OTP
- Resend (correo transaccional)

## Requisitos
- Node.js 24+
- PostgreSQL 14+ (local o Docker)

## Puesta en marcha

1. Copiar variables de entorno:
   ```powershell
   Copy-Item .env.example .env
   ```
   Editar `.env` con credenciales reales (`DATABASE_URL`, `JWT_*_SECRET`, `RESEND_API_KEY`).

2. Levantar Postgres (opción rápida con Docker):
   ```powershell
   docker run -d --name fptecnologi-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fptecnologi -p 5432:5432 postgres:16-alpine
   ```

3. Instalar dependencias y generar el cliente Prisma:
   ```powershell
   npm install
   npx prisma generate
   ```

4. Crear la primera migración (crea las tablas en la base de datos):
   ```powershell
   npx prisma migrate dev --name init
   ```

5. Levantar el servidor:
   ```powershell
   npm run start:dev
   ```
   La API queda en `http://localhost:3001`. Health check: `GET /health`.

## Convenciones de la API

- **Respuesta estándar**: éxito → `{ success: true, statusCode, data, timestamp }`;
  error → `{ success: false, statusCode, message, error, path, timestamp }`
  (`ResponseInterceptor` + `AllExceptionsFilter`, aplicados globalmente).
- **Autenticación**: `Authorization: Bearer <accessToken>` en cada request
  protegida. Rutas marcadas con `@Public()` no lo requieren.
- **Marca activa (multi-tenant)**: las rutas de negocio (`/productos`,
  `/pedidos`, `/servicios`, `/cotizaciones`, equipo de marca) requieren el
  encabezado `x-marca-id: <marcaId>`. `MarcaRolGuard` verifica que el
  usuario autenticado tenga un rol asignado en esa marca — el backend
  **nunca** confía en un `marcaId` que solo venga del cliente sin validar.
- **Roles**: `@Roles('admin', 'ventas', ...)` restringe una ruta al rol que
  el usuario tiene específicamente en la marca activa (un mismo usuario
  puede tener roles distintos en distintas marcas).

## Flujo de autenticación (2FA)

1. `POST /auth/login` `{ email, password }` → si las credenciales son
   correctas, genera y envía un código OTP por correo (Resend), responde
   `{ requiresOtp: true }`.
2. `POST /auth/otp/verify` `{ email, codigo }` → valida el código y
   devuelve `{ accessToken, refreshToken, marcas }`.
3. `POST /auth/refresh` `{ refreshToken }` → rota el refresh token y emite
   un nuevo access token.
4. `POST /auth/logout` `{ refreshToken }` (autenticado) → revoca el token.

## Endpoints públicos (web fptecnologi.com)

`GET /public/productos?marcaId=...`, `GET /public/productos/:id?marcaId=...`,
`GET /public/servicios?marcaId=...`, `GET /public/servicios/:id?marcaId=...`
— sin autenticación, solo lectura, solo registros activos. `POST
/cotizaciones?marcaId=...` también es público (formulario de solicitud de
cotización).

## Módulos

| Módulo | Descripción |
| --- | --- |
| `config` | Variables de entorno tipadas |
| `prisma` | Cliente Prisma inyectable (`PrismaService`, global) |
| `common` | Filtro de excepciones, interceptor de respuesta, guards y decoradores compartidos |
| `mail` | Envío de correo vía Resend (OTP, confirmaciones) |
| `auth` | Registro, login, JWT + refresh token, 2FA OTP |
| `marcas` / `sitios` | Marcas (tenants) y sitios (dominio → marca) |
| `roles` | Roles, asignación usuario↔marca↔rol, equipo por marca |
| `productos` | Categorías y productos, filtrados por marca |
| `pedidos` | Pedidos (estructura base, sin pasarela de pago aún) |
| `servicios` | Catálogo de servicios/soluciones IT |
| `cotizaciones` | Solicitudes de cotización de servicios |
| `notificaciones` | Centro de notificaciones del dashboard |
| `public` | Endpoints de solo lectura para la web pública |

## Próximos pasos (fuera de este alcance inicial)

- Conectar pasarela de pago a `Pedidos`.
- Conectar el dashboard (`apps/admin`) a esta API (login + OTP, selector
  de marca, menú dinámico, gestión de productos/usuarios, notificaciones).
- Publicar endpoints de esta API para consumo desde la web pública con ISR.
