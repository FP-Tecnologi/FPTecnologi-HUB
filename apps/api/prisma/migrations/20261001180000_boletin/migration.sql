-- CreateTable
CREATE TABLE "SuscriptorBoletin" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "origen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuscriptorBoletin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuscriptorBoletin_marcaId_createdAt_idx" ON "SuscriptorBoletin"("marcaId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SuscriptorBoletin_marcaId_email_key" ON "SuscriptorBoletin"("marcaId", "email");

-- AddForeignKey
ALTER TABLE "SuscriptorBoletin" ADD CONSTRAINT "SuscriptorBoletin_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
