# Despliegue en cPanel (Node.js) — FPTecnologi HUB

Guía para publicar el sistema en un hosting con **cPanel → "Setup Node.js App"** (Phusion Passenger).
Repositorios: **HUB** (API + dashboard + web, `FP-Tecnologi/FPTecnologi-HUB`) y, solo para la web pública, <https://github.com/FP-Tecnologi/fptecnologi-web> (su raíz es la app; al crear la app en cPanel el *Application root* es la carpeta clonada). Las rutas `fptecnologi-web/apps/...` de esta guía corresponden al HUB clonado (`FPTecnologi-HUB/apps/...`).

## 0. Resumen para desplegar en dominios temporales (pruebas)

Orden obligatorio, uno por uno: **1) API → 2) Dashboard → 3) Web pública** (cada una necesita la URL de la anterior).
Los tres salen del mismo repo público `FP-Tecnologi/FPTecnologi-HUB` (carpetas `apps/api`, `apps/admin`, `apps/web-fptecnologi`).

| App | Carpeta | Compilación | Inicio | Variables clave |
| --- | --- | --- | --- | --- |
| API | `apps/api` | `npm ci --include=dev && npx prisma generate && npm run build` | `node app.cjs` | `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `WEB_ORIGIN` (= URL del dashboard), `PUBLIC_API_URL` (= URL de la API), `UPLOADS_DIR`, `SWAGGER_USER`, `SWAGGER_PASSWORD`, correo |
| Dashboard | `apps/admin` | `npm ci && npm run build` | `node server.cjs` | `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_WEB_PUBLICA_URL` (**antes** de compilar) |
| Web | `apps/web-fptecnologi` | `npm ci && npm run build` | `node server.cjs` | `HUB_API_URL`, `HUB_MARCA_ID`, `GROQ_API_KEY`, `SITE_URL`, `NOINDEX=1`, `DASHBOARD_ORIGIN` (= URL del dashboard) |

Con dominios distintos entre sí (no subdominios de uno solo), «confiar en este dispositivo» del 2FA no persiste: se pedirá el código en cada ingreso. En pruebas es normal.

## 1. Qué se despliega

El proyecto son **tres aplicaciones Node.js independientes** (cada una con su `package.json`, sin workspaces) y una
base de datos externa (Supabase / PostgreSQL):

| App | Carpeta | Qué es | Dominio sugerido | Archivo de inicio |
| --- | --- | --- | --- | --- |
| API | `apps/api` | NestJS: todo el negocio, usuarios, pedidos, landings, uploads | `api.tudominio.com` | `app.cjs` |
| Dashboard | `apps/admin` | Next.js: panel de administración | `panel.tudominio.com` | `server.cjs` |
| Web pública | `apps/web-fptecnologi` | Next.js: sitio, tienda, blog, landings (`/l/<url>`) | `www.tudominio.com` | `server.cjs` |

La **web pública y el dashboard hablan con la API**; la API habla con la base de datos. Las tres apps van por HTTPS
(Let's Encrypt/AutoSSL de cPanel).

**Requisitos del hosting:** cPanel con *Setup Node.js App*, **Node 22 o superior** (mínimo 20.9), acceso a Terminal/SSH,
al menos ~1.5 GB de RAM disponible para compilar Next.js (si no alcanza, ver §8) y poder crear subdominios.

### Subdominios ahora, dominio principal después

Es una buena estrategia: publica las tres apps en subdominios del **mismo dominio** (por ejemplo `api.`, `panel.` y `test.` o `beta.tudominio.com`) y,
cuando todo esté probado, mueve la web pública al dominio principal (`www.tudominio.com`). Qué cuidar:

- **Ahora (web de pruebas en subdominio):** pon `NOINDEX=1` en la web pública para que Google no indexe la copia y compita con tu sitio actual, y
  `SITE_URL` con la URL del subdominio. Mantén API y panel en subdominios del mismo dominio: así funciona "confiar en este dispositivo" del 2FA.
- **Al pasar al dominio principal:** (1) crea la app Node.js de la web pública en `www.tudominio.com` (o cambia su URL en *Setup Node.js App*);
  (2) pon `NOINDEX=0` y `SITE_URL=https://www.tudominio.com`; (3) en el **panel** cambia `NEXT_PUBLIC_WEB_PUBLICA_URL` y **vuelve a compilar**
  (`npm run build`); (4) la API y el panel no cambian de lugar, y `HUB_API_URL`/`HUB_MARCA_ID` de la web siguen igual; (5) si usas login con Google,
  actualiza el *callback* en la consola de Google; (6) redirige el subdominio de pruebas al principal (cPanel → Redirecciones) y envía el sitemap
  (`/sitemap.xml`) a Google Search Console.
- Qué se pierde al mover la web: solo las sesiones de **Mi cuenta** de los clientes (la cookie es por dominio): vuelven a entrar con su código.
- Los enlaces ya enviados (invitaciones, avisos al equipo) usan el dominio del **panel**, que no cambia; los de landings sí cambian de host
  (`/l/<url>` en el dominio nuevo).

## 2. Variables de entorno

Se cargan en cPanel (cada app tiene su sección *Environment variables*) o en un `.env` dentro de la carpeta de la app
(el `.env` **nunca** se sube a git). Genera secretos largos con `openssl rand -hex 32`.

### API (`apps/api`)
| Variable | Valor / para qué |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Cadena de Supabase. En runtime el *transaction pooler* (puerto 6543, termina en `?pgbouncer=true`); para migraciones el puerto 5432 |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Dos secretos distintos y largos |
| `WEB_ORIGIN` | URL **del dashboard** (`https://panel.tudominio.com`): CORS y enlaces de invitaciones/avisos |
| `PUBLIC_API_URL` | URL de esta API (`https://api.tudominio.com`): enlaces de las imágenes subidas |
| `UPLOADS_DIR` | Ruta **absoluta fuera de la app** donde guardar imágenes, p. ej. `/home/USUARIO/uploads-fptecnologi` (así no se pierden al desplegar) |
| `MAIL_DRIVER`, `MAIL_FROM_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Correo saliente (invitaciones, códigos 2FA, cotizaciones, avisos). O `RESEND_API_KEY` + `MAIL_DRIVER=resend` |
| `SWAGGER_USER`, `SWAGGER_PASSWORD` | Obligatorias en producción (protegen `/docs`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Solo si usas login con Google (`https://api.tudominio.com/auth/google/callback`) |
| `PORT` | Lo pone Passenger; no la definas |

### Dashboard (`apps/admin`) — **se leen al compilar** (`npm run build`)
| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.tudominio.com` |
| `NEXT_PUBLIC_WEB_PUBLICA_URL` | `https://www.tudominio.com` |

> Las variables `NEXT_PUBLIC_*` se incrustan en el build: si las cambias, **vuelve a compilar**.

### Web pública (`apps/web-fptecnologi`)
| Variable | Valor |
| --- | --- |
| `HUB_API_URL` | `https://api.tudominio.com` |
| `HUB_MARCA_ID` | Id de la marca FPTecnologi: abre `https://api.tudominio.com/public/marcas` y copia su `id` |
| `GROQ_API_KEY` | Clave del asistente de IA (<https://console.groq.com/keys>) |
| `SITE_URL` | `https://www.tudominio.com` (sitemap, canonical, Open Graph) |
| `NOINDEX` | `1` mientras sea un sitio de pruebas en subdominio (no indexar); `0` o vacío en el dominio principal |
| `LEADS_SUPABASE_URL`, `LEADS_SUPABASE_ANON_KEY` | Copia de contactos al sistema `centralizacion-leads` (opcional; sin ellas el contacto responde 503) |

## 3. Subir el código

Con acceso SSH (lo más cómodo):

```bash
cd ~
git clone https://github.com/FP-Tecnologi/fptecnologi-web.git
```

Sin SSH: en cPanel → **Git™ Version Control → Create** con esa URL (repositorio público, no pide credenciales) y
luego *Update from Remote* cuando haya cambios. También sirve subir un `.zip` y descomprimirlo con el *Administrador de archivos*
(sin `node_modules`).

## 4. Crear y arrancar cada app

Repite para las tres (cPanel → **Setup Node.js App → Create Application**):

1. **Node.js version:** 22 · **Application mode:** Production.
2. **Application root:** `fptecnologi-web/apps/api` (o `…/apps/admin`, `…/apps/web-fptecnologi`).
3. **Application URL:** el subdominio de la tabla (créalo antes en *Dominios → Subdominios*).
4. **Application startup file:** `app.cjs` para la API; `server.cjs` para las dos webs.
5. Agrega las variables de entorno de la sección 2 y pulsa **Create**.
6. Copia el comando *"Enter to the virtual environment"* que muestra cPanel (empieza con `source /home/USUARIO/nodevenv/...`),
   ábrelo en la Terminal y ejecuta:

**API**
```bash
cd ~/fptecnologi-web/apps/api
source /home/USUARIO/nodevenv/fptecnologi-web/apps/api/22/bin/activate   # el comando exacto lo da cPanel
npm ci
npx prisma generate        # genera el cliente de base de datos (necesario antes de compilar)
npm run build              # crea la carpeta dist/
```

**Dashboard y web pública** (cada una en su carpeta)
```bash
cd ~/fptecnologi-web/apps/admin            # y luego apps/web-fptecnologi
source …/bin/activate
npm ci
npm run build                            # lee las variables NEXT_PUBLIC_* (dashboard)
```

7. En *Setup Node.js App* pulsa **Restart** en cada una. Prueba:
   - `https://api.tudominio.com/health` → `{"success":true,…"status":"ok"}`
   - `https://panel.tudominio.com` → pantalla de inicio de sesión
   - `https://www.tudominio.com` → la web

## 5. Base de datos

La base ya vive en Supabase y las migraciones están en `apps/api/prisma/migrations`. Para una base **nueva**:

```bash
cd apps/api
# usar la conexión del puerto 5432 (session pooler), no la 6543: la 6543 deja colgado `prisma migrate`
DATABASE_URL="postgresql://…:5432/postgres" npx prisma migrate deploy
```

Si `migrate deploy` se cuelga, aplica cada `migration.sql` con `npx tsx prisma/run-sql.ts prisma/migrations/<carpeta>/migration.sql`
y márcala con `npx prisma migrate resolve --applied <carpeta>`.

**Primer administrador:** crea el usuario desde la base o con un script `seed`, asígnale el rol `admin` en la marca
(tabla `UsuarioMarcaRol`) y entra al dashboard. Desde ahí se invita al resto del equipo (§7).

## 6. Actualizar después de cambios

```bash
cd ~/fptecnologi-web && git pull
cd apps/api && npm ci && npx prisma generate && npm run build && touch tmp/restart.txt
cd ../admin && npm ci && npm run build && touch tmp/restart.txt
cd ../web-fptecnologi && npm ci && npm run build && touch tmp/restart.txt
```

(`touch tmp/restart.txt` reinicia Passenger; también sirve el botón *Restart* de cPanel.) Si el cambio incluye una migración nueva,
aplícala antes de reiniciar la API (§5).

## 7. Usuarios e invitaciones

- **Invitar a alguien:** dashboard → **Configuración → Usuarios y equipo → Invitar miembro** → correo + rol. La persona recibe un
  correo con un enlace (vence en 7 días); al abrirlo crea su nombre y contraseña y queda con ese rol en la marca. Si ya tenía cuenta,
  solo se le suma la marca. Desde la pestaña *Invitaciones* se puede **reenviar** o **revocar**.
- **Requisitos para que funcione:** el correo saliente configurado (§2: `SMTP_*` o Resend) y `WEB_ORIGIN` apuntando al dashboard,
  porque el enlace es `WEB_ORIGIN/auth/invitacion?token=…`. Si el correo no sale, la invitación queda creada pero nadie la recibe.
- **Gestionar:** en *Equipo* se cambia el rol, se activa/desactiva la cuenta, se quita de la marca o se restablece su 2FA.
- **Segundo factor:** cada persona entra con contraseña + código por correo. En *Ajustes* puede activar una app autenticadora
  (Google Authenticator/Authy); en el login siempre puede pedir el código por correo como alternativa.
- **Roles:** admin, ventas, comercial, marketing, asesores, soporte, logistica, finanzas, direccion (y `cliente` para compradores).
  El menú del dashboard solo muestra a cada rol los módulos que le corresponden.
- **Cuentas de prueba:** `npx tsx prisma/seeds/usuarios-prueba.ts` crea una cuenta por rol (`dev+prueba-<rol>@…`; las contraseñas quedan en
  `docs/credenciales-prueba.md`, que no se sube a git). **Bórralas antes de abrir al público:** `… --borrar`.

## 8. Problemas frecuentes

| Síntoma | Causa y arreglo |
| --- | --- |
| La app arranca y se cae / "Faltan variables de entorno" | Falta `DATABASE_URL`, `JWT_*` o (en producción) `SWAGGER_*`; revisa los valores y que no empiecen con `change-me` |
| `npm run build` termina con "Killed" | Sin memoria: compila en tu PC (`npm ci && npm run build`) y sube la carpeta `.next` (y `dist` para la API) por el *Administrador de archivos*; en el servidor solo `npm ci --omit=dev` |
| El dashboard dice "Failed to fetch" / CORS | `WEB_ORIGIN` de la API no es exactamente la URL del dashboard (con `https://` y sin `/` al final) |
| El dashboard llama a `localhost:3001` | `NEXT_PUBLIC_API_URL` no estaba definida al compilar: define y vuelve a `npm run build` |
| Las imágenes subidas no se ven | `PUBLIC_API_URL` mal puesta, o `UPLOADS_DIR` sin permisos de escritura |
| El formulario de contacto devuelve 503 | Faltan `LEADS_SUPABASE_URL` / `LEADS_SUPABASE_ANON_KEY` |
| El chat de IA no responde | Falta `GROQ_API_KEY` en la web pública |
| Error 500 al abrir la tienda o el blog | `HUB_API_URL` / `HUB_MARCA_ID` incorrectos en la web pública |
| No llegan correos (invitaciones, códigos) | Revisa `SMTP_*` / `MAIL_FROM_EMAIL`; en cPanel el remitente debe ser una cuenta del propio dominio |

## 9. Seguridad antes de publicar

- No subas `.env` ni credenciales a git (el repositorio es público). Los `*.example` solo llevan valores de ejemplo.
- Secretos JWT largos y distintos a los de desarrollo; contraseña de `SWAGGER_*` fuerte.
- Elimina las cuentas de prueba (§7) y activa **Dependabot alerts**, **secret scanning** y la protección de la rama `main` en GitHub.
- Haz copias de seguridad de la carpeta `UPLOADS_DIR` (las imágenes subidas no están en git ni en la base de datos).
