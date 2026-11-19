import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { EstadoCotizacion } from '../../generated/prisma/enums.js';

/** Dashboard: el equipo completa la propuesta y gestiona la cotización. */
export class ActualizarCotizacionDto {
  @IsOptional()
  @IsEnum(EstadoCotizacion)
  estado?: EstadoCotizacion;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  propuesta?: string;

  /** Monto de la propuesta; null/ausente = sin monto. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  monto?: number;

  @IsOptional()
  @IsIn(['USD', 'PEN'])
  moneda?: 'USD' | 'PEN';

  /** Días de vigencia desde hoy (0 = sin vencimiento). */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  validezDias?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notas?: string;
}

export class EnviarCotizacionDto {
  @IsIn(['EMAIL', 'WHATSAPP'])
  canal!: 'EMAIL' | 'WHATSAPP';

  /** Texto adicional al inicio del mensaje (opcional). */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mensaje?: string;
}

/** Cotización armada desde la ficha de una oportunidad del CRM: se toma el cliente de su contacto; `canal` la envía de inmediato. */
export class CotizacionDesdeCrmDto {
  @IsUUID() oportunidadId!: string;

  @IsString() @MaxLength(60) servicioId!: string;

  @IsOptional() @IsString() @MaxLength(4000) propuesta?: string;

  @IsOptional() @IsNumber() @Min(0) monto?: number;

  @IsOptional() @IsIn(['USD', 'PEN']) moneda?: 'USD' | 'PEN';

  /** Días de vigencia desde hoy (0 = sin vencimiento). */
  @IsOptional() @IsInt() @Min(0) @Max(365) validezDias?: number;

  /** Si viene, la cotización se envía al crearla (correo, o enlace de WhatsApp para abrir). */
  @IsOptional() @IsIn(['EMAIL', 'WHATSAPP']) canal?: 'EMAIL' | 'WHATSAPP';
}
