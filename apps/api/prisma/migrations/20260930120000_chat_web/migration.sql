-- CreateEnum
CREATE TYPE "EstadoChat" AS ENUM ('BOT', 'ASESOR', 'CERRADA');

-- CreateEnum
CREATE TYPE "AutorChat" AS ENUM ('CLIENTE', 'BOT', 'ASESOR');

-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'CHAT';

-- CreateTable
CREATE TABLE "ChatAsesor" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatAsesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversacion" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "titulo" TEXT,
    "estado" "EstadoChat" NOT NULL DEFAULT 'BOT',
    "asesorId" TEXT,
    "paginaOrigen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMensaje" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "conversacionId" TEXT NOT NULL,
    "autor" "AutorChat" NOT NULL,
    "texto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatAsesor_marcaId_idx" ON "ChatAsesor"("marcaId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversacion_token_key" ON "ChatConversacion"("token");

-- CreateIndex
CREATE INDEX "ChatConversacion_marcaId_updatedAt_idx" ON "ChatConversacion"("marcaId", "updatedAt");

-- CreateIndex
CREATE INDEX "ChatMensaje_conversacionId_createdAt_idx" ON "ChatMensaje"("conversacionId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMensaje_marcaId_idx" ON "ChatMensaje"("marcaId");

-- AddForeignKey
ALTER TABLE "ChatAsesor" ADD CONSTRAINT "ChatAsesor_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversacion" ADD CONSTRAINT "ChatConversacion_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversacion" ADD CONSTRAINT "ChatConversacion_asesorId_fkey" FOREIGN KEY ("asesorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMensaje" ADD CONSTRAINT "ChatMensaje_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMensaje" ADD CONSTRAINT "ChatMensaje_conversacionId_fkey" FOREIGN KEY ("conversacionId") REFERENCES "ChatConversacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

