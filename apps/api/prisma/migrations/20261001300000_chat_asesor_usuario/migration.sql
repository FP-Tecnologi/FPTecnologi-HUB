ALTER TABLE "ChatAsesor" ADD COLUMN "usuarioId" TEXT;
CREATE INDEX "ChatAsesor_marcaId_usuarioId_idx" ON "ChatAsesor"("marcaId", "usuarioId");
