import { IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { DISPARADORES, DISPOSITIVOS, FORMATOS_POPUP, FRECUENCIAS, PLANTILLAS_POPUP } from './popups.modelo.js';

export class CrearPopupDto {
  @IsString() @MinLength(2) @MaxLength(100)
  nombre!: string;

  @IsIn(PLANTILLAS_POPUP)
  plantilla!: (typeof PLANTILLAS_POPUP)[number];

  @IsOptional() @IsIn(FORMATOS_POPUP)
  formato?: (typeof FORMATOS_POPUP)[number];
}

export class ActualizarPopupDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100)
  nombre?: string;

  @IsOptional() @IsIn(FORMATOS_POPUP)
  formato?: (typeof FORMATOS_POPUP)[number];

  @IsOptional() @IsIn(['BORRADOR', 'ACTIVO', 'PAUSADO'])
  estado?: 'BORRADOR' | 'ACTIVO' | 'PAUSADO';

  /** Se recorta a la forma de ContenidoPopup en el servicio. */
  @IsOptional() @IsObject()
  contenido?: Record<string, unknown>;

  /** null = sin producto */
  @IsOptional() @IsString()
  productoId?: string | null;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  prioridad?: number;

  @IsOptional() @IsIn(DISPARADORES)
  disparador?: (typeof DISPARADORES)[number];

  @IsOptional() @IsInt() @Min(0) @Max(3600)
  disparadorValor?: number;

  @IsOptional() @IsIn(FRECUENCIAS)
  frecuencia?: (typeof FRECUENCIAS)[number];

  @IsOptional() @IsInt() @Min(1) @Max(365)
  frecuenciaValor?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  paginas?: string[];

  @IsOptional() @IsIn(DISPOSITIVOS)
  dispositivo?: (typeof DISPOSITIVOS)[number];

  /** ISO; null o '' = sin límite */
  @IsOptional() @IsString()
  inicio?: string | null;

  @IsOptional() @IsString()
  fin?: string | null;
}

export class EventoPopupDto {
  @IsIn(['vista', 'clic'])
  tipo!: 'vista' | 'clic';
}
