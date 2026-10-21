import { Equals, IsBoolean, IsEmail, IsIn, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

const TEXTO = /^[^<>]*$/; // sin etiquetas: estos datos se muestran en el dashboard y en correos

export class CrearHojaDto {
  @IsString() @MinLength(2) @MaxLength(80) @Matches(TEXTO)
  nombres!: string;

  @IsString() @MinLength(2) @MaxLength(80) @Matches(TEXTO)
  apellidos!: string;

  @IsIn(['DNI', 'CE', 'PASAPORTE', 'RUC'])
  tipoDocumento!: 'DNI' | 'CE' | 'PASAPORTE' | 'RUC';

  // La longitud según el tipo se valida en el service.
  @IsString() @MinLength(5) @MaxLength(20) @Matches(/^[A-Za-z0-9-]+$/)
  nroDocumento!: string;

  @IsString() @MinLength(5) @MaxLength(200) @Matches(TEXTO)
  domicilio!: string;

  @IsString() @MinLength(6) @MaxLength(20) @Matches(/^[0-9+()\s-]+$/)
  telefono!: string;

  @IsEmail() @MaxLength(120)
  email!: string;

  @IsBoolean()
  menorEdad!: boolean;

  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) @Matches(TEXTO)
  repNombres?: string;

  @IsOptional() @IsIn(['DNI', 'CE', 'PASAPORTE'])
  repTipoDocumento?: 'DNI' | 'CE' | 'PASAPORTE';

  @IsOptional() @IsString() @MinLength(5) @MaxLength(20) @Matches(/^[A-Za-z0-9-]+$/)
  repNroDocumento?: string;

  @IsIn(['PRODUCTO', 'SERVICIO'])
  tipoBien!: 'PRODUCTO' | 'SERVICIO';

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100_000_000)
  montoReclamado?: number;

  @IsIn(['PEN', 'USD'])
  moneda!: 'PEN' | 'USD';

  @IsString() @MinLength(3) @MaxLength(300) @Matches(TEXTO)
  descripcionBien!: string;

  @IsOptional() @IsString() @MaxLength(60) @Matches(TEXTO)
  nroPedido?: string;

  @IsIn(['RECLAMO', 'QUEJA'])
  tipo!: 'RECLAMO' | 'QUEJA';

  @IsString() @MinLength(10) @MaxLength(2000) @Matches(TEXTO)
  detalle!: string;

  @IsString() @MinLength(5) @MaxLength(1000) @Matches(TEXTO)
  pedidoConsumidor!: string;

  @IsIn(['CORREO', 'CARTA'])
  medioRespuesta!: 'CORREO' | 'CARTA';

  @Equals(true, { message: 'Debes declarar que la información es veraz' })
  aceptaVeracidad!: boolean;

  @IsOptional() @IsString() @MaxLength(200) @Matches(TEXTO)
  origen?: string;

  // Honeypot: un humano nunca lo llena.
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

export class ResponderHojaDto {
  @IsString() @MinLength(10) @MaxLength(4000) @Matches(TEXTO)
  respuesta!: string;
}

export class ConsultaHojaDto {
  @IsString() @MinLength(1) @MaxLength(40) @Matches(TEXTO)
  codigo!: string;

  @IsString() @MinLength(1) @MaxLength(40) @Matches(TEXTO)
  documento!: string;
}
