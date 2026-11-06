# CDN con Cloudflare (plan Free)

Objetivo: que imágenes, fuentes, JS/CSS y PDF salgan del borde de Cloudflare y no del hosting, y que el servidor aguante más visitas.
Dominios: `fptecnologi.com`, `fimavperu.com`, `kelqa.com`, `imaninki.com`, `quamtu.com` (+ `api.` y `admin.fptecnologi.com`).

## 1. Alta (una vez por dominio)
1. Cloudflare → *Add a site* → plan **Free** → importa los DNS actuales.
2. Revisa que estén todos los registros (A/CNAME de la web, **MX y TXT del correo**, SPF/DKIM) antes de continuar.
3. En el registrador cambia los *nameservers* a los que da Cloudflare (la propagación tarda de minutos a horas).
4. Nube **naranja (Proxied)** en los registros de las webs; **gris (DNS only)** en `mail`, `MX` y cualquier subdominio de correo/FTP.
5. SSL/TLS → modo **Full (strict)**; *Always Use HTTPS*: on; *Automatic HTTPS Rewrites*: on; TLS mínimo 1.2.

## 2. Velocidad
- Speed → Optimization: **Brotli** on, *Early Hints* on, *HTTP/3* on.
- Caching → *Browser Cache TTL*: *Respect existing headers* (las webs ya mandan sus cabeceras).
- No actives Rocket Loader ni Auto Minify (rompen React/Next).

## 3. Reglas de caché (Rules → Cache Rules), en este orden
| # | Si la URL… | Acción |
| --- | --- | --- |
| 1 | empieza por `/api/` **o** `api.fptecnologi.com` (todo) **o** `admin.fptecnologi.com` (todo) | *Bypass cache* |
| 2 | contiene `/cuenta`, `/socios`, `/carrito`, `/finalizar-compra`, `/tickets`, `/presupuesto` | *Bypass cache* |
| 3 | empieza por `/_next/static/` | *Eligible for cache*, Edge TTL **1 año** |
| 4 | empieza por `/images/`, `/fonts/`, `/fotos/`, `/brand/`, `/clientes/`, `/herobanner/`, `/wp-content/`, `/pdfjs/`, `/catalogos/` | *Eligible for cache*, Edge TTL **30 días** |
| 5 | `api.fptecnologi.com` y ruta empieza por `/public/contenido` o `/public/blog` | *Eligible for cache*, Edge TTL **respetar origen** (la API manda `s-maxage=30`) |
| 6 | resto de páginas HTML | no tocar (las webs ya regeneran cada 30 s; Cloudflare no cachea HTML por defecto) |

Tras publicar un cambio de imagen con el mismo nombre: Caching → *Purge Cache* → *Purge Everything* (o por URL).

## 4. Seguridad básica (gratis)
- Security → *Bot Fight Mode*: on.
- WAF → regla de **rate limiting** (1 gratuita) sobre `/api/hub/*` y `/public/*` de formularios: p. ej. 30 peticiones/min por IP.
- *Under Attack Mode* solo si hay un ataque.
- La API ya limita peticiones por su cuenta; Cloudflare corta antes de llegar al hosting.

## 5. Ajustes en el proyecto
- API: `TRUST_PROXY=2` (Cloudflare + proxy del hosting) para que `req.ip` sea el visitante real; si no, el límite de peticiones cuenta a Cloudflare como un solo cliente.
- Los PDF de `public/catalogos` (12 MB y 11 MB) se sirven por Cloudflare con la regla 4; no hace falta moverlos.
- Quita el `.htaccess` redundante solo si el hosting lo permite; las cabeceras de seguridad del proyecto se mantienen.

## 6. Verificar
```bash
curl -sI https://fptecnologi.com/images/logo.png | grep -i -E "cf-cache-status|cache-control"
```
Primera vez `cf-cache-status: MISS`, la segunda `HIT`. Para páginas HTML debe salir `DYNAMIC`.

## Pendiente de confirmar con el hosting
- Región del servidor (decide si conviene mover Supabase de `us-west-2`).
- Que el correo (MX/SPF/DKIM) quede en gris tras importar los DNS.

---

## Alternativa elegida: CDN solo para archivos (sin cambiar nameservers ni tocar el correo)

Se crea un subdominio por web (`cdn.fptecnologi.com`, `cdn.fimavperu.com`, …) con un solo registro **CNAME** hacia un CDN de tipo *pull* (p. ej. bunny.net: *Pull Zone* con origen = la propia web). Los DNS, el MX y el correo no se tocan.

1. En el CDN crea una *Pull Zone* por dominio con origen `https://<dominio>` y *hostname* `cdn.<dominio>`; activa SSL gratuito y CORS (`Access-Control-Allow-Origin: *`, necesario para fuentes).
2. En el DNS del dominio añade `cdn` → CNAME al *hostname* que dé el CDN.
3. En el hosting define la variable `CDN_URL=https://cdn.<dominio>` y vuelve a compilar (`npm run build`): el JS/CSS de `/_next/static` se pedirá al CDN. Sin la variable todo queda igual (`assetPrefix` en `next.config.mjs` de fptecnologi, fimav, imaninki y kelqa).
4. Imágenes y PDF de `public/`: siguen saliendo del hosting con caché de 30 días; pasarlas al CDN requiere prefijar sus rutas en el código (pendiente, hacerlo cuando el CDN esté activo).
5. Si algo falla, quitar `CDN_URL` y recompilar revierte todo.
