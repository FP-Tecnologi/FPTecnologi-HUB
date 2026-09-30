import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class CreateChatAsesorDto {
  @IsString()
  @MaxLength(60)
  nombre!: string;

  @IsString()
  @MaxLength(40)
  area!: string;

  @IsString()
  @MaxLength(30)
  telefono!: string;

  // Solo dígitos con código de país (lo que pide wa.me): 51999999999.
  @Matches(/^\d{8,15}$/, { message: 'whatsapp debe ser solo dígitos con código de país (ej. 51999999999)' })
  whatsapp!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  fotoUrl?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}

export class UpdateChatAsesorDto extends PartialType(CreateChatAsesorDto) {}
