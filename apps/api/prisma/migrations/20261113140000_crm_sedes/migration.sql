ALTER TABLE "CrmEmpresa" ADD COLUMN "empresaPadreId" TEXT;
ALTER TABLE "CrmEmpresa" ADD CONSTRAINT "CrmEmpresa_empresaPadreId_fkey" FOREIGN KEY ("empresaPadreId") REFERENCES "CrmEmpresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "CrmEmpresa_marcaId_empresaPadreId_idx" ON "CrmEmpresa"("marcaId", "empresaPadreId");
