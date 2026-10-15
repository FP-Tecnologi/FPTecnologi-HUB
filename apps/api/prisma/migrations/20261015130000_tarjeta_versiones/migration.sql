-- Una persona puede tener varias versiones de su tarjeta digital (cada una con su propio enlace).
ALTER TABLE "TarjetaDigital" ADD COLUMN "etiqueta" TEXT NOT NULL DEFAULT 'Principal';
DROP INDEX IF EXISTS "TarjetaDigital_marcaId_usuarioId_key";
CREATE INDEX "TarjetaDigital_marcaId_usuarioId_idx" ON "TarjetaDigital"("marcaId", "usuarioId");
