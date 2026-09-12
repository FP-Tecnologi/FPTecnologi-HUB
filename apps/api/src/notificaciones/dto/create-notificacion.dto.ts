import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoNotificacion } from '../../generated/prisma/enums.js';

export class CreateNotificacionDto {
  @IsString()
  usuarioId!: string;

  @IsOptional()
  @IsString()
  marcaId?: string;

  @IsString()
  titulo!: string;

  @IsString()
  mensaje!: string;

  @IsOptional()
  @IsEnum(TipoNotificacion)
  tipo?: TipoNotificacion;
}
