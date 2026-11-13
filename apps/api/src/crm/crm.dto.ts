import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

const TEXTO = /^[^<>]*$/; // sin etiquetas: se muestran en el dashboard
const ETAPAS = ['NUEVO', 'CONTACTADO', 'PROPUESTA', 'NEGOCIACION', 'GANADO', 'PERDIDO'] as const;
const ORIGENES = ['MANUAL', 'COTIZADOR', 'COTIZACION', 'CONTACTO_WEB', 'PRESUPUESTO'] as const;
const MONEDAS = ['PEN', 'USD'] as const;
export const TIPOS_MANUALES = ['LLAMADA', 'REUNION', 'NOTA', 'CORREO', 'WHATSAPP', 'TAREA'] as const;
type Etapa = (typeof ETAPAS)[number];

export class EmpresaDto {
  @IsString() @MinLength(2) @MaxLength(160) @Matches(TEXTO) razonSocial!: string;
  @IsOptional() @IsString() @MaxLength(11) ruc?: string | null;
  @IsOptional() @IsString() @MaxLength(80) @Matches(TEXTO) rubro?: string | null;
  @IsOptional() @IsString() @MaxLength(200) web?: string | null;
  @IsOptional() @IsString() @MaxLength(40) telefono?: string | null;
  @IsOptional() @IsString() @MaxLength(200) @Matches(TEXTO) direccion?: string | null;
  @IsOptional() @IsString() @MaxLength(2000) notas?: string | null;
  /** Empresa principal de la que esta es sede o subempresa (null = empresa principal). */
  @IsOptional() @IsUUID() empresaPadreId?: string | null;
}

export class ContactoDto {
  @IsString() @MinLength(2) @MaxLength(160) @Matches(TEXTO) nombre!: string;
  @IsOptional() @IsString() @MaxLength(80) @Matches(TEXTO) cargo?: string | null;
  @IsOptional() @IsEmail({}, { message: 'Correo no válido' }) @MaxLength(120) email?: string | null;
  @IsOptional() @IsString() @MaxLength(30) celular?: string | null;
  @IsOptional() @IsString() @MaxLength(15) documento?: string | null;
  @IsOptional() @IsString() @MaxLength(2000) notas?: string | null;
  @IsOptional() @IsUUID() empresaId?: string | null;
}

class EmpresaNuevaDto {
  @IsOptional() @IsString() @MaxLength(160) @Matches(TEXTO) razonSocial?: string;
  @IsOptional() @IsString() @MaxLength(11) ruc?: string;
}

class ContactoNuevoDto {
  @IsString() @MinLength(2) @MaxLength(160) @Matches(TEXTO) nombre!: string;
  @IsOptional() @IsString() @MaxLength(80) @Matches(TEXTO) cargo?: string;
  @IsOptional() @IsEmail({}, { message: 'Correo no válido' }) @MaxLength(120) email?: string;
  @IsOptional() @IsString() @MaxLength(30) celular?: string;
}

export class CrearOportunidadDto {
  @IsString() @MinLength(3) @MaxLength(160) @Matches(TEXTO) titulo!: string;
  @IsOptional() @IsUUID() empresaId?: string;
  @IsOptional() @ValidateNested() @Type(() => EmpresaNuevaDto) empresaNueva?: EmpresaNuevaDto;
  @IsOptional() @IsUUID() contactoId?: string;
  @IsOptional() @ValidateNested() @Type(() => ContactoNuevoDto) contactoNuevo?: ContactoNuevoDto;
  @IsOptional() @IsIn(ETAPAS) etapa?: Etapa;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1e10) monto?: number;
  @IsOptional() @IsIn(MONEDAS) moneda?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) probabilidad?: number;
  @IsOptional() @IsDateString() cierreEstimado?: string;
  @IsOptional() @IsUUID() asignadoId?: string;
  @IsOptional() @IsString() @MaxLength(200) @Matches(TEXTO) proximaAccion?: string;
  @IsOptional() @IsDateString() proximaAccionAt?: string;
}

export class ActualizarOportunidadDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(160) @Matches(TEXTO) titulo?: string;
  @IsOptional() @IsUUID() empresaId?: string | null;
  @IsOptional() @IsUUID() contactoId?: string | null;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1e10) monto?: number | null;
  @IsOptional() @IsIn(MONEDAS) moneda?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) probabilidad?: number | null;
  @IsOptional() @IsDateString() cierreEstimado?: string | null;
  @IsOptional() @IsUUID() asignadoId?: string | null;
  @IsOptional() @IsString() @MaxLength(200) @Matches(TEXTO) proximaAccion?: string | null;
  @IsOptional() @IsDateString() proximaAccionAt?: string | null;
}

export class CambiarEtapaDto {
  @IsIn(ETAPAS) etapa!: Etapa;
  @IsOptional() @IsString() @MaxLength(500) motivoPerdida?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1e10) monto?: number;
}

export class ActividadDto {
  @IsIn(TIPOS_MANUALES) tipo!: (typeof TIPOS_MANUALES)[number];
  @IsString() @MinLength(2) @MaxLength(4000) texto!: string;
  @IsOptional() @IsDateString() fecha?: string;
  @IsOptional() @IsBoolean() hecha?: boolean;
}

export class ActualizarActividadDto {
  @IsOptional() @IsBoolean() hecha?: boolean;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(4000) texto?: string;
  @IsOptional() @IsDateString() fecha?: string;
}

export class FiltrosOportunidades {
  @IsOptional() @IsIn(ETAPAS) etapa?: Etapa;
  @IsOptional() @IsIn(['abiertas', 'cerradas', 'todas']) estado?: 'abiertas' | 'cerradas' | 'todas';
  /** 'yo', 'sin' (sin responsable) o el id de un usuario. */
  @IsOptional() @IsString() @MaxLength(40) asignado?: string;
  @IsOptional() @IsIn(ORIGENES) origen?: (typeof ORIGENES)[number];
  @IsOptional() @IsString() @MaxLength(100) q?: string;
}
