import { ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/** Mínimo de unidades por producto para comprar como mayorista. */
export const MIN_UNIDADES_MAYORISTA = 6;

export class ItemPresupuestoDto {
  @IsString()
  @MaxLength(80)
  sku!: string;

  @IsInt()
  @Min(MIN_UNIDADES_MAYORISTA, { message: `Cada producto debe llevar al menos ${MIN_UNIDADES_MAYORISTA} unidades para precio de mayorista` })
  @Max(100000)
  cantidad!: number;
}

/**
 * Presupuesto de productos para clientes mayoristas (web pública, sin login).
 * El servidor recalcula precios y totales; `website` es honeypot anti-bots.
 */
export class CrearPresupuestoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  clienteNombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  clienteDocumento?: string;

  @IsEmail()
  @MaxLength(120)
  clienteEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  clienteTelefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  clienteDireccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notas?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ItemPresupuestoDto)
  items!: ItemPresupuestoDto[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  origen?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
