-- CreateEnum
CREATE TYPE "EstadoArticulo" AS ENUM ('BORRADOR', 'PUBLICADO');

-- CreateTable
CREATE TABLE "BlogArticulo" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "portadaUrl" TEXT,
    "categoria" TEXT NOT NULL,
    "etiquetas" TEXT[],
    "autorNombre" TEXT NOT NULL,
    "estado" "EstadoArticulo" NOT NULL DEFAULT 'BORRADOR',
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "publicadoEn" TIMESTAMP(3),
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogArticulo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogArticulo_marcaId_estado_publicadoEn_idx" ON "BlogArticulo"("marcaId", "estado", "publicadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "BlogArticulo_marcaId_slug_key" ON "BlogArticulo"("marcaId", "slug");

-- AddForeignKey
ALTER TABLE "BlogArticulo" ADD CONSTRAINT "BlogArticulo_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

