import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { AREAS, CATEGORIAS } from './formatos.js';

const TEXTO = /^[^<>]*$/;

export class CrearRecursoEquipoDto {
  @IsString() @MinLength(2) @MaxLength(160) @Matches(TEXTO)
  titulo!: string;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(TEXTO)
  descripcion?: string;

  @IsOptional() @IsIn(AREAS)
  area?: (typeof AREAS)[number];

  @IsOptional() @IsIn(CATEGORIAS)
  categoria?: (typeof CATEGORIAS)[number];

  @IsOptional() @IsString() @MaxLength(60) @Matches(TEXTO)
  variante?: string;

  // Vacío = material general (no de una marca en particular).
  @IsOptional() @IsString()
  marcaRef?: string;

  // Etiquetas separadas por coma (multipart no manda arreglos).
  @IsOptional() @IsString() @MaxLength(300) @Matches(TEXTO)
  etiquetas?: string;
}

export class ActualizarRecursoEquipoDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(160) @Matches(TEXTO)
  titulo?: string;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(TEXTO)
  descripcion?: string;

  @IsOptional() @IsIn(AREAS)
  area?: (typeof AREAS)[number];

  @IsOptional() @IsIn(CATEGORIAS)
  categoria?: (typeof CATEGORIAS)[number];

  @IsOptional() @IsString() @MaxLength(60) @Matches(TEXTO)
  variante?: string;

  @IsOptional() @IsString()
  marcaRef?: string;

  @IsOptional() @IsString() @MaxLength(300) @Matches(TEXTO)
  etiquetas?: string;
}

