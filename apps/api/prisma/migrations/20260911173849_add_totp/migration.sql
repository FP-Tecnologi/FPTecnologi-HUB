-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpSecret" TEXT;

-- CreateTable
CREATE TABLE "TotpBackupCode" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "codigoHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TotpBackupCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TotpBackupCode_usuarioId_idx" ON "TotpBackupCode"("usuarioId");

-- AddForeignKey
ALTER TABLE "TotpBackupCode" ADD CONSTRAINT "TotpBackupCode_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
