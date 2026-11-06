-- Ficha de línea/categoría y detalle corto de producto (todo opcional; no afecta datos existentes).
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "icono" TEXT;
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "resumen" TEXT;
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "texto" TEXT;
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "galeria" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "marcasComerciales" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "detalle" TEXT;
