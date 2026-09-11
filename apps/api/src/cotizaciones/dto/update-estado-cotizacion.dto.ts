import { IsEnum } from 'class-validator';
import { EstadoCotizacion } from '../../generated/prisma/enums.js';

export class UpdateEstadoCotizacionDto {
  @IsEnum(EstadoCotizacion)
  estado!: EstadoCotizacion;
}
