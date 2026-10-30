#!/usr/bin/env bash
# Exporta la web como sitio estático (zip con index.html en la raíz) para hosts que solo sirven archivos.
# Uso: NEXT_PUBLIC_HUB_API_URL=https://api.fptecnologi.com NEXT_PUBLIC_HUB_MARCA_ID=<id de Kelqa> bash scripts/exportar-estatico.sh
# Con la URL de la API el formulario busca solo el id de Kelqa (/public/marcas); NEXT_PUBLIC_HUB_MARCA_ID es opcional.
# El contenido del CMS no se refleja en la versión estática (sale con los textos por defecto).
# Trabaja en una copia temporal: no toca el proyecto. Sin esas dos variables el formulario solo ofrece WhatsApp y correo.
set -euo pipefail
ORIGEN="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
tar --exclude=node_modules --exclude=.next --exclude=scripts -cf - -C "$ORIGEN" . | tar -xf - -C "$TMP"
cd "$TMP"
rm -rf src/app/api
sed -i 's|const nextConfig = {|const nextConfig = {\n  output: "export",\n  trailingSlash: true,\n  images: { unoptimized: true },|' next.config.mjs
sed -i '/async headers/,/^  },$/d;/async redirects/,/^  },$/d' next.config.mjs
npm install --no-audit --no-fund
EXPORTAR_ESTATICO=1 npx next build --webpack
cd out
printf '{"name":"kelqa-web-estatico","version":"1.0.0","private":true,"scripts":{"build":"echo sitio estatico ya compilado"}}\n' > package.json
ZIP="$ORIGEN/kelqa-web-estatico.zip"
rm -f "$ZIP"
zip -qr "$ZIP" .
echo "Listo: $ZIP"
