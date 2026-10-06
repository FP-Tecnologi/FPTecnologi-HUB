-- Las tarifas existentes estaban en USD; las nuevas (tarifas de Shalom) se cargan en soles.
ALTER TABLE "TarifaEnvio" ADD COLUMN "moneda" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "TarifaEnvio" ALTER COLUMN "moneda" SET DEFAULT 'PEN';
