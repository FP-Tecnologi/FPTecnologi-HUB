-- Qué datos muestra la tarjeta (cada persona decide) y colores del QR.
ALTER TABLE "TarjetaDigital" ADD COLUMN "mostrar" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "TarjetaDigital" ADD COLUMN "qrColor" TEXT;
ALTER TABLE "TarjetaDigital" ADD COLUMN "qrFondo" TEXT;
