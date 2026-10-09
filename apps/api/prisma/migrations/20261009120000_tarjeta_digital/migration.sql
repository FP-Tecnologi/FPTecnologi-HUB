-- Tarjeta digital del equipo comercial. Aditivo e idempotente.
CREATE TABLE IF NOT EXISTS "TarjetaDigital" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "area" TEXT,
    "bio" TEXT,
    "fotoUrl" TEXT,
    "telefono" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "linkedin" TEXT,
    "web" TEXT,
    "agendaUrl" TEXT,
    "enlaces" JSONB NOT NULL DEFAULT '[]',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TarjetaDigital_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TarjetaDigital_marcaId_slug_key" ON "TarjetaDigital"("marcaId", "slug");
CREATE UNIQUE INDEX IF NOT EXISTS "TarjetaDigital_marcaId_usuarioId_key" ON "TarjetaDigital"("marcaId", "usuarioId");

ALTER TABLE "TarjetaDigital" ADD CONSTRAINT "TarjetaDigital_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
