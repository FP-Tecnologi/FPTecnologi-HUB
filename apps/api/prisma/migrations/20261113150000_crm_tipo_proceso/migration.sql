CREATE TYPE "TipoProcesoCrm" AS ENUM ('VENTA_DIRECTA', 'PRIVADO', 'LICITACION', 'CONVENIO', 'OXI');
ALTER TABLE "CrmOportunidad" ADD COLUMN "tipoProceso" "TipoProcesoCrm";
