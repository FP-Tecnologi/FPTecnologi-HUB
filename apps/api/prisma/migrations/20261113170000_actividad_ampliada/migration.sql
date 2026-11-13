-- Bitácora completa: IP, dispositivo, ruta, entidad y datos enviados; índices para filtrar por marca y usuario.
ALTER TABLE "ActividadLog"
  ADD COLUMN "entidad" TEXT,
  ADD COLUMN "entidadId" TEXT,
  ADD COLUMN "metodo" TEXT,
  ADD COLUMN "ruta" TEXT,
  ADD COLUMN "ip" TEXT,
  ADD COLUMN "dispositivo" TEXT,
  ADD COLUMN "cambios" JSONB;

CREATE INDEX "ActividadLog_marcaId_createdAt_idx" ON "ActividadLog"("marcaId", "createdAt");
CREATE INDEX "ActividadLog_usuarioId_createdAt_idx" ON "ActividadLog"("usuarioId", "createdAt");
