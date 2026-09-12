-- Tipos de notificación para el centro de notificaciones del dashboard
-- (filtros por tipo en la pantalla /notificaciones).
CREATE TYPE "TipoNotificacion" AS ENUM ('SISTEMA', 'PEDIDO', 'COTIZACION', 'EQUIPO', 'STOCK');

ALTER TABLE "Notificacion" ADD COLUMN "tipo" "TipoNotificacion" NOT NULL DEFAULT 'SISTEMA';
