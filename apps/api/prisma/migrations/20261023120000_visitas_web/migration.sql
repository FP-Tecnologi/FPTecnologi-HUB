-- CreateTable
CREATE TABLE "VisitaWeb" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "dispositivo" TEXT NOT NULL,
    "visitante" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitaWeb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitaWeb_marcaId_createdAt_idx" ON "VisitaWeb"("marcaId", "createdAt");

-- AddForeignKey
ALTER TABLE "VisitaWeb" ADD CONSTRAINT "VisitaWeb_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE CASCADE ON UPDATE CASCADE;
