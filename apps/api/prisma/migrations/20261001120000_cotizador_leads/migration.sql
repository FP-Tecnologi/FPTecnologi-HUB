-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('NATURAL', 'JURIDICA');

-- CreateEnum
CREATE TYPE "EstadoLead" AS ENUM ('NUEVO', 'CONTACTADO', 'COTIZADO', 'GANADO', 'PERDIDO');

-- CreateTable
CREATE TABLE "LeadCotizador" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoPersona" "TipoPersona" NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "nroDocumento" TEXT NOT NULL,
    "empresa" TEXT,
    "email" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "interes" TEXT NOT NULL,
    "mensaje" TEXT,
    "origen" TEXT,
    "estado" "EstadoLead" NOT NULL DEFAULT 'NUEVO',
    "notas" TEXT,
    "atendidoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadCotizador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadCotizador_marcaId_estado_createdAt_idx" ON "LeadCotizador"("marcaId", "estado", "createdAt");

-- AddForeignKey
ALTER TABLE "LeadCotizador" ADD CONSTRAINT "LeadCotizador_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
