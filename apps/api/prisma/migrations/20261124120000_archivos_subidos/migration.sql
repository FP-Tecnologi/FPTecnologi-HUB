-- Copia permanente de /uploads: el disco del hosting se borra en cada despliegue y las imágenes se perdían.
CREATE TABLE IF NOT EXISTS "ArchivoSubido" (
  "ruta" TEXT NOT NULL,
  "datos" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArchivoSubido_pkey" PRIMARY KEY ("ruta")
);
-- Sin políticas: la API (dueña de la tabla) accede; la API pública de Supabase no.
ALTER TABLE "ArchivoSubido" ENABLE ROW LEVEL SECURITY;
