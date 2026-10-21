-- CreateEnum
CREATE TYPE "TipoHoja" AS ENUM ('RECLAMO', 'QUEJA');

-- CreateEnum
CREATE TYPE "EstadoHoja" AS ENUM ('RECIBIDO', 'EN_PROCESO', 'RESPONDIDO');

-- AlterTable
ALTER TABLE "Marca" ADD COLUMN     "direccionFiscal" TEXT,
ADD COLUMN     "razonSocial" TEXT,
ADD COLUMN     "ruc" TEXT;

-- CreateTable
CREATE TABLE "HojaReclamacion" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "correlativo" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "nroDocumento" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "menorEdad" BOOLEAN NOT NULL DEFAULT false,
    "repNombres" TEXT,
    "repTipoDocumento" TEXT,
    "repNroDocumento" TEXT,
    "tipoBien" TEXT NOT NULL,
    "montoReclamado" DECIMAL(12,2),
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "descripcionBien" TEXT NOT NULL,
    "nroPedido" TEXT,
    "tipo" "TipoHoja" NOT NULL,
    "detalle" TEXT NOT NULL,
    "pedidoConsumidor" TEXT NOT NULL,
    "medioRespuesta" TEXT NOT NULL,
    "origen" TEXT,
    "estado" "EstadoHoja" NOT NULL DEFAULT 'RECIBIDO',
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "respuesta" TEXT,
    "respondidoAt" TIMESTAMP(3),
    "respondidoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HojaReclamacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HojaReclamacion_marcaId_estado_fechaLimite_idx" ON "HojaReclamacion"("marcaId", "estado", "fechaLimite");

-- CreateIndex
CREATE INDEX "HojaReclamacion_marcaId_codigo_idx" ON "HojaReclamacion"("marcaId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "HojaReclamacion_marcaId_anio_correlativo_key" ON "HojaReclamacion"("marcaId", "anio", "correlativo");

-- AddForeignKey
ALTER TABLE "HojaReclamacion" ADD CONSTRAINT "HojaReclamacion_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
