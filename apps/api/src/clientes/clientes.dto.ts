import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export const SECTORES_CLIENTE = ['gobierno', 'educacion', 'privado'] as const;

export class CreateClienteDto {
  @IsString() @MaxLength(160)
  nombre!: string;

  // Iniciales para el logo provisional cuando no hay logo.
  @IsString() @MaxLength(4)
  sigla!: string;

  @IsOptional() @IsString() @MaxLength(500)
  logoUrl?: string;

  @IsIn(SECTORES_CLIENTE)
  sector!: (typeof SECTORES_CLIENTE)[number];

  @IsOptional() @IsInt() @Min(0)
  orden?: number;

  @IsOptional() @IsBoolean()
  activo?: boolean;

  @IsOptional() @IsBoolean()
  esEjemplo?: boolean;
}

export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
