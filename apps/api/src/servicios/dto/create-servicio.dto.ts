import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class BeneficioDto {
  @IsString() @MaxLength(80)
  titulo!: string;

  @IsString() @MaxLength(300)
  texto!: string;
}

export class FaqDto {
  @IsString() @MaxLength(200)
  p!: string;

  @IsString() @MaxLength(800)
  r!: string;
}

export class CreateServicioDto {
  @IsString() @MaxLength(120)
  nombre!: string;

  // Descripción corta (tarjeta y encabezado de la página).
  @IsOptional() @IsString() @MaxLength(400)
  descripcion?: string;

  @IsOptional() @IsNumber() @Min(0)
  precioDesde?: number;

  @IsOptional() @IsBoolean()
  activo?: boolean;

  // Opcional: si no viene se genera desde el nombre.
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'El slug solo admite minúsculas, números y guiones' })
  @MaxLength(100)
  slug?: string;

  @IsOptional() @IsString() @MaxLength(60)
  etiqueta?: string;

  @IsOptional() @IsString() @MaxLength(40)
  icono?: string;

  @IsOptional() @IsString() @MaxLength(500)
  imagenUrl?: string;

  @IsOptional() @IsString() @MaxLength(1500)
  intro?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(160, { each: true })
  incluye?: string[];

  @IsOptional() @IsArray() @ArrayMaxSize(8) @ValidateNested({ each: true }) @Type(() => BeneficioDto)
  beneficios?: BeneficioDto[];

  @IsOptional() @IsArray() @ArrayMaxSize(12) @IsString({ each: true }) @MaxLength(80, { each: true })
  sectores?: string[];

  @IsOptional() @IsArray() @ArrayMaxSize(12) @ValidateNested({ each: true }) @Type(() => FaqDto)
  faqs?: FaqDto[];

  @IsOptional() @IsInt() @Min(0)
  orden?: number;
}
