ALTER TYPE "EstadoTicket" ADD VALUE IF NOT EXISTS 'ESPERANDO_CLIENTE';
CREATE TYPE "PrioridadTicket" AS ENUM ('BAJA', 'NORMAL', 'ALTA', 'URGENTE');
CREATE TYPE "AutorTicket" AS ENUM ('CLIENTE', 'EQUIPO', 'SISTEMA');
CREATE TYPE "EstadoSocio" AS ENUM ('PENDIENTE', 'ACTIVO', 'SUSPENDIDO', 'RECHAZADO');

ALTER TABLE "Ticket" ADD COLUMN "prioridad" "PrioridadTicket" NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "Ticket" ADD COLUMN "asignadoA" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "resueltoAt" TIMESTAMP(3);

CREATE TABLE "TicketMensaje" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "autor" "AutorTicket" NOT NULL,
    "autorNombre" TEXT,
    "texto" TEXT NOT NULL,
    "adjuntos" TEXT[],
    "interno" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketMensaje_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TicketMensaje_ticketId_createdAt_idx" ON "TicketMensaje"("ticketId", "createdAt");
ALTER TABLE "TicketMensaje" ADD CONSTRAINT "TicketMensaje_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Socio" ADD COLUMN "cargo" TEXT;
ALTER TABLE "Socio" ADD COLUMN "celular" TEXT;
ALTER TABLE "Socio" ADD COLUMN "mensaje" TEXT;
ALTER TABLE "Socio" ADD COLUMN "notas" TEXT;
ALTER TABLE "Socio" ADD COLUMN "estado" "EstadoSocio" NOT NULL DEFAULT 'PENDIENTE';
ALTER TABLE "Socio" ADD COLUMN "aprobadoPor" TEXT;
ALTER TABLE "Socio" ADD COLUMN "aprobadoAt" TIMESTAMP(3);
ALTER TABLE "Socio" ADD COLUMN "ultimoAcceso" TIMESTAMP(3);
UPDATE "Socio" SET "estado" = CASE WHEN "activo" THEN 'ACTIVO'::"EstadoSocio" ELSE 'SUSPENDIDO'::"EstadoSocio" END;
ALTER TABLE "Socio" DROP COLUMN "activo";
CREATE INDEX "Socio_marcaId_estado_idx" ON "Socio"("marcaId", "estado");
