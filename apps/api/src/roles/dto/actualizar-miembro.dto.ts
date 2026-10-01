import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ActualizarMiembroDto {
  @IsOptional()
  @IsString()
  rolId?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
