CREATE TABLE IF NOT EXISTS "MailingAprobacion" (
  "id" TEXT NOT NULL,
  "marcaId" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "asunto" TEXT NOT NULL,
  "preheader" TEXT,
  "html" TEXT NOT NULL,
  "audiencia" TEXT,
  "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
  "nota" TEXT,
  "solicitadoPor" TEXT NOT NULL,
  "revisadoPor" TEXT,
  "revisadoAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MailingAprobacion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MailingAprobacion_marcaId_estado_createdAt_idx" ON "MailingAprobacion"("marcaId", "estado", "createdAt");
ALTER TABLE "MailingAprobacion" ADD CONSTRAINT "MailingAprobacion_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
