// Genera una versión 100 % estática de la web (carpeta out/ lista para subir a cPanel) sin tocar el código del servidor Node.
// Trabaja en una copia temporal: quita /api, quita force-dynamic y activa output: 'export'. El contenido del dashboard se
// lee de la API UNA vez, al construir (HUB_API_URL / HUB_MARCA_ID de .env.local o del entorno); para ver cambios nuevos hay
// que volver a construir y resubir. Uso: npm run build:estatico  →  deja `out-estatico/`.
import { cpSync, rmSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve } from 'node:path';


const raiz = resolve(import.meta.dirname, '..');
const tmp = join(raiz, '.tmp-estatico');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
for (const n of ['src', 'public', 'package.json', 'tsconfig.json', 'postcss.config.mjs', 'next-env.d.ts']) {
  if (existsSync(join(raiz, n))) cpSync(join(raiz, n), join(tmp, n), { recursive: true });
}
if (existsSync(join(raiz, '.env.local'))) cpSync(join(raiz, '.env.local'), join(tmp, '.env.local'));

rmSync(join(tmp, 'src/app/api'), { recursive: true, force: true });
const layout = join(tmp, 'src/app/layout.tsx');
writeFileSync(layout, readFileSync(layout, 'utf8').replace(/export const dynamic = "force-dynamic";?\n?/, ''));
for (const f of ['sitemap.ts', 'robots.ts', 'opengraph-image.tsx', 'twitter-image.tsx']) {
  const ruta = join(tmp, 'src/app', f);
  if (existsSync(ruta) && !/export const dynamic/.test(readFileSync(ruta, 'utf8'))) writeFileSync(ruta, readFileSync(ruta, 'utf8') + '\nexport const dynamic = "force-static";\n');
}
writeFileSync(join(tmp, 'next.config.mjs'), `export default { output: 'export', turbopack: { root: ${JSON.stringify(raiz)} }, trailingSlash: true, images: { unoptimized: true }, poweredByHeader: false };\n`);

execSync('npx next build', { cwd: tmp, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });

const salida = join(raiz, 'out-estatico');
rmSync(salida, { recursive: true, force: true });
cpSync(join(tmp, 'out'), salida, { recursive: true });
writeFileSync(join(salida, '.htaccess'), `# Web estática de Company IMC (cPanel / Apache)
DirectoryIndex index.html
ErrorDocument 404 /404.html
Options -Indexes
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]
<FilesMatch "^(opengraph|twitter)-image$">
  ForceType image/png
</FilesMatch>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>
`);
rmSync(tmp, { recursive: true, force: true });
console.log('Listo: ' + salida);
