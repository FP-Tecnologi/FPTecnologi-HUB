import { IsEnum } from 'class-validator';
import { EstadoPedido } from '../../generated/prisma/enums.js';

export class UpdateEstadoPedidoDto {
  @IsEnum(EstadoPedido)
  estado!: EstadoPedido;
}
