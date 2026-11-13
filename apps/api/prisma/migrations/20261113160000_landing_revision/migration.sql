-- Flujo de revisión de landings: el comercial las envía y el jefe comercial las aprueba o devuelve.
ALTER TYPE "EstadoLanding" ADD VALUE IF NOT EXISTS 'EN_REVISION';

ALTER TABLE "Landing"
  ADD COLUMN "creadoPorId" TEXT,
  ADD COLUMN "enviadaRevisionAt" TIMESTAMP(3),
  ADD COLUMN "revisadoPorId" TEXT,
  ADD COLUMN "revisadoAt" TIMESTAMP(3),
  ADD COLUMN "comentarioRevision" TEXT;
