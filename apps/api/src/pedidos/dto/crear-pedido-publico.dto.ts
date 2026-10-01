import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ItemPedidoPublico {
  @IsString()
  productoId!: string;

  @IsInt()
  @Min(1)
  @Max(99)
  cantidad!: number;
}

/**
 * Checkout invitado fase 1 (sin pasarela): el comprador deja sus datos y el
 * pedido queda PENDIENTE / pago POR_CONFIRMAR para coordinar por WhatsApp.
 * `website` es honeypot anti-bots (ver cotizador/boletín).
 */
export class CrearPedidoPublicoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nombre!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  celular!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  documento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  distrito?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;

  /** Envío por courier: departamento (y agencia) elegidos; el costo lo calcula el servidor. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  envioDepartamento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  envioSede?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  metodoPago?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoPublico)
  items!: ItemPedidoPublico[];

  @IsOptional()
  @IsString()
  website?: string;
}
