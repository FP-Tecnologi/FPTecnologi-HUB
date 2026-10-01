#!/usr/bin/env bash
# Publica un SNAPSHOT (sin historial ni credenciales) del código desplegable en el repo público
# https://github.com/FP-Tecnologi/fptecnologi-web (el que se clona en cPanel). Solo archivos versionados
# (git archive respeta .gitignore): nunca salen .env ni docs/credenciales-prueba.md.
# Uso, desde la raíz del repo y con la rama que quieras publicar al día:  bash scripts/publicar-snapshot.sh
# Deja el mismo contenido en las ramas main y develop del repo público. Ojo: hace `push --force` (es un espejo, no tiene historial propio).
set -euo pipefail
DESTINO="${TMPDIR:-/tmp}/fpweb-snapshot"   # ruta corta: en Windows las rutas largas rompen git
rm -rf "$DESTINO" && mkdir -p "$DESTINO"
git archive HEAD README.md SECURITY.md .gitignore apps docs/DESPLIEGUE-CPANEL.md | tar -x -C "$DESTINO"
# Revisión rápida de secretos antes de publicar
if grep -rInE --exclude="*.sql" "eyJ[A-Za-z0-9_-]{25,}|gsk_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY" "$DESTINO" 2>/dev/null | grep -v "package-lock.json" | grep -q .; then
  echo "Se encontró algo que parece un secreto: revisa antes de publicar." >&2
  exit 1
fi
cd "$DESTINO"
git init -q -b main && git config core.longpaths true && git add -A
git commit -q -m "FPTecnologi HUB: snapshot $(date +%F)"
git remote add origin https://github.com/FP-Tecnologi/fptecnologi-web.git
git push --force origin main
git push --force origin main:develop   # el repo público también tiene develop, igual que el HUB
echo "Publicado. En cPanel: git pull y los pasos de la sección 6 de docs/DESPLIEGUE-CPANEL.md"
