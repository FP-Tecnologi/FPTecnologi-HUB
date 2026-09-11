import { IsOptional, IsString } from 'class-validator';

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
}
