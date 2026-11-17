-- El PDF del folleto se guarda en la base (BYTEA): el disco del hosting no es permanente.
ALTER TABLE "Folleto" ADD COLUMN "datos" BYTEA;
