-- CreateTable
CREATE TABLE "CuentaCliente" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuentaCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CuentaCliente_marcaId_email_key" ON "CuentaCliente"("marcaId", "email");

-- AddForeignKey
ALTER TABLE "CuentaCliente" ADD CONSTRAINT "CuentaCliente_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
