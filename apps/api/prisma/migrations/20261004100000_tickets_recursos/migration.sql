-- CreateEnum
CREATE TYPE "TipoTicket" AS ENUM ('RECLAMO', 'VERIFICACION', 'SOPORTE');
CREATE TYPE "EstadoTicket" AS ENUM ('NUEVO', 'EN_REVISION', 'RESUELTO', 'CERRADO');
CREATE TYPE "TipoRecurso" AS ENUM ('IMAGEN', 'PDF', 'VIDEO', 'DOCUMENTO', 'OTRO');

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "TipoTicket" NOT NULL,
    "estado" "EstadoTicket" NOT NULL DEFAULT 'NUEVO',
    "esEmpresa" BOOLEAN NOT NULL DEFAULT false,
    "documento" TEXT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT,
    "numeroCompra" TEXT,
    "fechaCompra" TEXT,
    "producto" TEXT,
    "comprobante" TEXT,
    "descripcion" TEXT NOT NULL,
    "evidencias" TEXT[],
    "origen" TEXT,
    "notas" TEXT,
    "atendidoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Socio" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT,
    "empresa" TEXT,
    "ruc" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Socio_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Recurso" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoRecurso" NOT NULL,
    "fabricante" TEXT,
    "categoria" TEXT,
    "archivoUrl" TEXT NOT NULL,
    "mime" TEXT,
    "bytes" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "descargas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Recurso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_marcaId_numero_key" ON "Ticket"("marcaId", "numero");
CREATE INDEX "Ticket_marcaId_estado_createdAt_idx" ON "Ticket"("marcaId", "estado", "createdAt");
CREATE INDEX "Ticket_marcaId_email_idx" ON "Ticket"("marcaId", "email");
CREATE UNIQUE INDEX "Socio_marcaId_email_key" ON "Socio"("marcaId", "email");
CREATE INDEX "Recurso_marcaId_visible_fabricante_idx" ON "Recurso"("marcaId", "visible", "fabricante");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Socio" ADD CONSTRAINT "Socio_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Recurso" ADD CONSTRAINT "Recurso_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
