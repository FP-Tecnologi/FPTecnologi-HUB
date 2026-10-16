-- CreateTable
CREATE TABLE "SoporteTicket" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "marcaId" TEXT,
    "asunto" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTO',
    "respuesta" TEXT,
    "respondidoPor" TEXT,
    "respondidoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoporteTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SoporteTicket_usuarioId_createdAt_idx" ON "SoporteTicket"("usuarioId", "createdAt");

-- CreateIndex
CREATE INDEX "SoporteTicket_estado_createdAt_idx" ON "SoporteTicket"("estado", "createdAt");

-- AddForeignKey
ALTER TABLE "SoporteTicket" ADD CONSTRAINT "SoporteTicket_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoporteTicket" ADD CONSTRAINT "SoporteTicket_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE SET NULL ON UPDATE CASCADE;
