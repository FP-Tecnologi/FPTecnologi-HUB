import { IsEnum } from 'class-validator';
import { EstadoCotizacion } from '../../generated/prisma/enums.js';

/** Dashboard: el equipo comercial mueve el presupuesto de estado. */
export class CambiarEstadoPresupuestoDto {
  @IsEnum(EstadoCotizacion)
  estado!: EstadoCotizacion;
}
