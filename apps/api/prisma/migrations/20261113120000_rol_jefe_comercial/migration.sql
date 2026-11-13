-- Rol nuevo: jefe comercial (ve y asigna todas las oportunidades del CRM). Idempotente.
INSERT INTO "Rol" ("id", "nombre") VALUES (gen_random_uuid()::text, 'jefe_comercial') ON CONFLICT ("nombre") DO NOTHING;
