-- CreateTable
CREATE TABLE "DispositivoConfiable" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispositivoConfiable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DispositivoConfiable_usuarioId_idx" ON "DispositivoConfiable"("usuarioId");

-- AddForeignKey
ALTER TABLE "DispositivoConfiable" ADD CONSTRAINT "DispositivoConfiable_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
