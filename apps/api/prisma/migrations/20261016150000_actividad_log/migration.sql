-- CreateTable
CREATE TABLE "ActividadLog" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "email" TEXT,
    "accion" TEXT NOT NULL,
    "detalle" TEXT,
    "marcaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActividadLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActividadLog_createdAt_idx" ON "ActividadLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActividadLog_accion_createdAt_idx" ON "ActividadLog"("accion", "createdAt");
