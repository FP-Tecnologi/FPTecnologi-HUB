-- CreateEnum
CREATE TYPE "TipoContacto" AS ENUM ('CONTACTO', 'RECLAMO');

-- CreateEnum
CREATE TYPE "EstadoContacto" AS ENUM ('NUEVO', 'CONTACTADO', 'RESUELTO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "ContactoWeb" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "tipo" "TipoContacto" NOT NULL DEFAULT 'CONTACTO',
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT,
    "empresa" TEXT,
    "mensaje" TEXT NOT NULL,
    "origen" TEXT,
    "estado" "EstadoContacto" NOT NULL DEFAULT 'NUEVO',
    "notas" TEXT,
    "atendidoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactoWeb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactoWeb_marcaId_estado_createdAt_idx" ON "ContactoWeb"("marcaId", "estado", "createdAt");

-- AddForeignKey
ALTER TABLE "ContactoWeb" ADD CONSTRAINT "ContactoWeb_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
