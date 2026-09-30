import { PartialType } from '@nestjs/mapped-types';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateArticuloDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  titulo!: string;

  // Opcional: si no viene se genera desde el título.
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'El slug solo admite minúsculas, números y guiones' })
  @MaxLength(120)
  slug?: string;

  @IsString()
  @MaxLength(300)
  resumen!: string;

  @IsString()
  @MaxLength(100_000)
  contenido!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  portadaUrl?: string;

  @IsString()
  @MaxLength(60)
  categoria!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  etiquetas?: string[];

  @IsString()
  @MaxLength(80)
  autorNombre!: string;

  @IsOptional()
  @IsIn(['BORRADOR', 'PUBLICADO'])
  estado?: 'BORRADOR' | 'PUBLICADO';

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;
}

export class UpdateArticuloDto extends PartialType(CreateArticuloDto) {}
