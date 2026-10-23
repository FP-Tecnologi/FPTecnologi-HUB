#!/usr/bin/env bash
# Publica un SNAPSHOT (sin historial ni credenciales) de SOLO una web pública del HUB, en la raíz de su repo espejo
# (p. ej. apps/web-fptecnologi → https://github.com/FP-Tecnologi/fptecnologi-web). La API y el dashboard viven en el HUB.
# Solo archivos versionados (git archive respeta .gitignore): nunca salen .env ni docs/credenciales-prueba.md.
# Uso, desde la raíz del repo y con la rama que quieras publicar al día:
#   bash scripts/publicar-snapshot.sh                                  # web-fptecnologi → fptecnologi-web (por defecto)
#   bash scripts/publicar-snapshot.sh fimav-web fimav-peru Fimav       # apps/<app> → FP-Tecnologi/<repo>, "Web <Nombre>"
#   bash scripts/publicar-snapshot.sh quamtu-web quamtu-web Quamtu
# Deja el mismo contenido en las ramas main y develop del repo espejo. Cada snapshot es un commit nuevo SOBRE el historial
# del espejo (sin --force): cPanel actualiza con `git pull` y un historial reescrito hace fallar el redeploy.
# El repo de destino debe existir (el script no lo crea) y la cuenta de git debe poder escribir en él.
set -euo pipefail
APP="${1:-web-fptecnologi}"
REPO="${2:-fptecnologi-web}"
NOMBRE="${3:-FPTecnologi}"
[ -d "apps/$APP" ] || { echo "No existe apps/$APP (ejecuta desde la raíz del HUB)." >&2; exit 1; }
DESTINO="${TMPDIR:-/tmp}/$REPO-snapshot"   # ruta corta: en Windows las rutas largas rompen git
rm -rf "$DESTINO"
git clone -q --depth 1 -c core.longpaths=true "https://github.com/FP-Tecnologi/$REPO.git" "$DESTINO"
find "$DESTINO" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +   # así lo borrado en el HUB también se borra en el espejo
git archive "HEAD:apps/$APP" | tar -x -C "$DESTINO"
# Revisión rápida de secretos antes de publicar
if grep -rInE --exclude="*.sql" "eyJ[A-Za-z0-9_-]{25,}|gsk_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY" "$DESTINO" 2>/dev/null | grep -v "package-lock.json" | grep -q .; then
  echo "Se encontró algo que parece un secreto: revisa antes de publicar." >&2
  exit 1
fi
cd "$DESTINO"
git add -A
git diff --cached --quiet || git commit -q -m "Web $NOMBRE: snapshot $(date +%F)"
git push -q origin HEAD:main
git push -q origin HEAD:develop   # el repo espejo también tiene develop, igual que el HUB
echo "Publicado apps/$APP en FP-Tecnologi/$REPO (solo la web pública, en la raíz del repo)."
