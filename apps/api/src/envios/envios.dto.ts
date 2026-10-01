import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CrearTarifaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  departamento!: string;

  /** Costo del envío en la moneda del pedido (USD), sin IGV adicional. */
  @IsNumber()
  @Min(0)
  costo!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  plazoDias?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ActualizarTarifaDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  plazoDias?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
