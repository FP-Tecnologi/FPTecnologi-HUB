-- Página de detalle de proyectos (caso de éxito): texto largo, galería y videos de YouTube.
ALTER TABLE "Proyecto" ADD COLUMN IF NOT EXISTS "detalle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Proyecto" ADD COLUMN IF NOT EXISTS "galeria" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Proyecto" ADD COLUMN IF NOT EXISTS "videos" TEXT[] DEFAULT ARRAY[]::TEXT[];
