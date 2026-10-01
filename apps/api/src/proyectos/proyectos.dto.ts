import { PartialType } from '@nestjs/mapped-types';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

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

  @IsInt() @Min(1990) @Max(2100)
  anio!: number;

  @IsOptional() @IsString() @MaxLength(1000)
  descripcion?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(12) @IsString({ each: true }) @MaxLength(60, { each: true })
  alcance?: string[];

  @IsOptional() @IsInt() @Min(0)
  orden?: number;

  @IsOptional() @IsBoolean()
  activo?: boolean;

  @IsOptional() @IsBoolean()
  esEjemplo?: boolean;
}

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {}
