-- CreateTable
CREATE TABLE "Folleto" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folleto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Folleto_marcaId_activo_idx" ON "Folleto"("marcaId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "Folleto_marcaId_slug_key" ON "Folleto"("marcaId", "slug");

-- AddForeignKey
ALTER TABLE "Folleto" ADD CONSTRAINT "Folleto_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
