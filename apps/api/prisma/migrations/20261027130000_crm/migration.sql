-- CreateEnum
CREATE TYPE "EtapaOportunidad" AS ENUM ('NUEVO', 'CONTACTADO', 'PROPUESTA', 'NEGOCIACION', 'GANADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "OrigenOportunidad" AS ENUM ('MANUAL', 'COTIZADOR', 'COTIZACION', 'CONTACTO_WEB', 'PRESUPUESTO');

-- CreateEnum
CREATE TYPE "TipoActividadCrm" AS ENUM ('LLAMADA', 'REUNION', 'NOTA', 'CORREO', 'WHATSAPP', 'TAREA', 'ETAPA', 'SOLICITUD');

-- CreateTable
CREATE TABLE "CrmEmpresa" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT,
    "rubro" TEXT,
    "web" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmContacto" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "empresaId" TEXT,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "email" TEXT,
    "celular" TEXT,
    "documento" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmContacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmOportunidad" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "empresaId" TEXT,
    "contactoId" TEXT,
    "etapa" "EtapaOportunidad" NOT NULL DEFAULT 'NUEVO',
    "monto" DECIMAL(65,30),
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "probabilidad" INTEGER,
    "cierreEstimado" TIMESTAMP(3),
    "asignadoId" TEXT,
    "origen" "OrigenOportunidad" NOT NULL DEFAULT 'MANUAL',
    "origenId" TEXT,
    "proximaAccion" TEXT,
    "proximaAccionAt" TIMESTAMP(3),
    "motivoPerdida" TEXT,
    "ganadoAt" TIMESTAMP(3),
    "cerradoAt" TIMESTAMP(3),
    "creadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmOportunidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActividad" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "oportunidadId" TEXT NOT NULL,
    "tipo" "TipoActividadCrm" NOT NULL,
    "texto" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hecha" BOOLEAN NOT NULL DEFAULT true,
    "autor" TEXT,
    "origen" "OrigenOportunidad",
    "origenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmActividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmEmpresa_marcaId_razonSocial_idx" ON "CrmEmpresa"("marcaId", "razonSocial");

-- CreateIndex
CREATE UNIQUE INDEX "CrmEmpresa_marcaId_ruc_key" ON "CrmEmpresa"("marcaId", "ruc");

-- CreateIndex
CREATE INDEX "CrmContacto_marcaId_nombre_idx" ON "CrmContacto"("marcaId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "CrmContacto_marcaId_email_key" ON "CrmContacto"("marcaId", "email");

-- CreateIndex
CREATE INDEX "CrmOportunidad_marcaId_etapa_updatedAt_idx" ON "CrmOportunidad"("marcaId", "etapa", "updatedAt");

-- CreateIndex
CREATE INDEX "CrmOportunidad_marcaId_asignadoId_idx" ON "CrmOportunidad"("marcaId", "asignadoId");

-- CreateIndex
CREATE INDEX "CrmOportunidad_marcaId_origen_origenId_idx" ON "CrmOportunidad"("marcaId", "origen", "origenId");

-- CreateIndex
CREATE INDEX "CrmOportunidad_marcaId_contactoId_idx" ON "CrmOportunidad"("marcaId", "contactoId");

-- CreateIndex
CREATE UNIQUE INDEX "CrmOportunidad_marcaId_numero_key" ON "CrmOportunidad"("marcaId", "numero");

-- CreateIndex
CREATE INDEX "CrmActividad_oportunidadId_fecha_idx" ON "CrmActividad"("oportunidadId", "fecha");

-- CreateIndex
CREATE INDEX "CrmActividad_marcaId_origen_origenId_idx" ON "CrmActividad"("marcaId", "origen", "origenId");

-- CreateIndex
CREATE INDEX "CrmActividad_marcaId_tipo_hecha_fecha_idx" ON "CrmActividad"("marcaId", "tipo", "hecha", "fecha");

-- AddForeignKey
ALTER TABLE "CrmEmpresa" ADD CONSTRAINT "CrmEmpresa_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmContacto" ADD CONSTRAINT "CrmContacto_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmContacto" ADD CONSTRAINT "CrmContacto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "CrmEmpresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOportunidad" ADD CONSTRAINT "CrmOportunidad_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOportunidad" ADD CONSTRAINT "CrmOportunidad_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "CrmEmpresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOportunidad" ADD CONSTRAINT "CrmOportunidad_contactoId_fkey" FOREIGN KEY ("contactoId") REFERENCES "CrmContacto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOportunidad" ADD CONSTRAINT "CrmOportunidad_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActividad" ADD CONSTRAINT "CrmActividad_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActividad" ADD CONSTRAINT "CrmActividad_oportunidadId_fkey" FOREIGN KEY ("oportunidadId") REFERENCES "CrmOportunidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
