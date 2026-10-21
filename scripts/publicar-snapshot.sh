#!/usr/bin/env bash
# Publica un SNAPSHOT (sin historial ni credenciales) de SOLO una web pública del HUB, en la raíz de su repo espejo
# (p. ej. apps/web-fptecnologi → https://github.com/FP-Tecnologi/fptecnologi-web). La API y el dashboard viven en el HUB.
# Solo archivos versionados (git archive respeta .gitignore): nunca salen .env ni docs/credenciales-prueba.md.
# Uso, desde la raíz del repo y con la rama que quieras publicar al día:
#   bash scripts/publicar-snapshot.sh                                  # web-fptecnologi → fptecnologi-web (por defecto)
#   bash scripts/publicar-snapshot.sh fimav-web fimav-peru Fimav       # apps/<app> → FP-Tecnologi/<repo>, "Web <Nombre>"
#   bash scripts/publicar-snapshot.sh quamtu-web quamtu-web Quamtu
# Deja el mismo contenido en las ramas main y develop del repo espejo. Ojo: hace `push --force` (es un espejo, no tiene
# historial propio). El repo de destino debe existir (el script no lo crea) y la cuenta de git debe poder escribir en él.
set -euo pipefail
APP="${1:-web-fptecnologi}"
REPO="${2:-fptecnologi-web}"
NOMBRE="${3:-FPTecnologi}"
[ -d "apps/$APP" ] || { echo "No existe apps/$APP (ejecuta desde la raíz del HUB)." >&2; exit 1; }
DESTINO="${TMPDIR:-/tmp}/$REPO-snapshot"   # ruta corta: en Windows las rutas largas rompen git
rm -rf "$DESTINO" && mkdir -p "$DESTINO"
git archive "HEAD:apps/$APP" | tar -x -C "$DESTINO"
# Revisión rápida de secretos antes de publicar
if grep -rInE --exclude="*.sql" "eyJ[A-Za-z0-9_-]{25,}|gsk_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY" "$DESTINO" 2>/dev/null | grep -v "package-lock.json" | grep -q .; then
  echo "Se encontró algo que parece un secreto: revisa antes de publicar." >&2
  exit 1
fi
cd "$DESTINO"
git init -q -b main && git config core.longpaths true && git add -A
git commit -q -m "Web $NOMBRE: snapshot $(date +%F)"
git remote add origin "https://github.com/FP-Tecnologi/$REPO.git"
git push --force origin main
git push --force origin main:develop   # el repo espejo también tiene develop, igual que el HUB
echo "Publicado apps/$APP en FP-Tecnologi/$REPO (solo la web pública, en la raíz del repo)."
