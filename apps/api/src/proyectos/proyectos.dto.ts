import { PartialType } from '@nestjs/mapped-types';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class CreateProyectoDto {
  @IsString() @MaxLength(200)
  titulo!: string;

  // Id del departamento de la web (lima, cajamarca, la-libertad…).
  @IsString() @Matches(/^[a-z]+(?:-[a-z]+)*$/, { message: 'Departamento inválido' }) @MaxLength(40)
  departamento!: string;

  @IsOptional() @IsString() @MaxLength(500)
  imagenUrl?: string;

  @IsString() @MaxLength(160)
  cliente!: string;

  @IsOptional() @IsInt() @Min(1990) @Max(2100)
  anio?: number | null;

  @IsOptional() @IsNumber() @Min(0)
  monto?: number | null;

  @IsOptional() @IsString() @MaxLength(1000)
  descripcion?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(12) @IsString({ each: true }) @MaxLength(60, { each: true })
  alcance?: string[];

  @IsOptional() @IsString() @MaxLength(8000)
  detalle?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(500, { each: true })
  galeria?: string[];

  // Solo URLs de YouTube (watch, youtu.be, shorts o embed).
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsString({ each: true }) @MaxLength(300, { each: true })
  @Matches(/^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//, { each: true, message: 'Cada video debe ser un enlace de YouTube' })
  videos?: string[];

  @IsOptional() @IsInt() @Min(0)
  orden?: number;

  @IsOptional() @IsBoolean()
  activo?: boolean;

  @IsOptional() @IsBoolean()
  esEjemplo?: boolean;
}

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {}
