import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateServicioDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioDesde?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
