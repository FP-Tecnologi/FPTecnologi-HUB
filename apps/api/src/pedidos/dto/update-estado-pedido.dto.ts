import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { EstadoPedido } from '../../generated/prisma/enums.js';

export const ESTADOS_PAGO = ['PENDIENTE', 'POR_CONFIRMAR', 'PAGADO'] as const;

/** Dashboard: cambia el estado del pedido y/o el estado del pago (al menos uno). */
export class UpdateEstadoPedidoDto {
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;

  @IsOptional()
  @IsIn(ESTADOS_PAGO)
  estadoPago?: (typeof ESTADOS_PAGO)[number];
}
