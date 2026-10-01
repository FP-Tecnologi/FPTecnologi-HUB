import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const TEXTO = /^[^<>]*$/; // sin etiquetas: estos datos se muestran en el dashboard y en correos

export class CrearLeadDto {
  @IsString() @MinLength(2) @MaxLength(80) @Matches(TEXTO)
  nombres!: string;

  @IsString() @MinLength(2) @MaxLength(80) @Matches(TEXTO)
  apellidos!: string;

  @IsIn(['NATURAL', 'JURIDICA'])
  tipoPersona!: 'NATURAL' | 'JURIDICA';

  // DNI (8) o RUC (11) — la coherencia con el tipo de persona se valida en el service.
  @IsIn(['DNI', 'RUC'])
  tipoDocumento!: 'DNI' | 'RUC';

  @Matches(/^\d{8}$|^\d{11}$/, { message: 'El documento debe tener 8 dígitos (DNI) u 11 (RUC)' })
  nroDocumento!: string;

  @IsOptional() @IsString() @MaxLength(120) @Matches(TEXTO)
  empresa?: string;

  @IsEmail() @MaxLength(120)
  email!: string;

  // Celular peruano: 9 dígitos que empiezan con 9 (se acepta +51 / espacios).
  @IsString() @MaxLength(20)
  celular!: string;

  @IsString() @MinLength(2) @MaxLength(120) @Matches(TEXTO)
  interes!: string;

  @IsOptional() @IsString() @MaxLength(1000) @Matches(TEXTO)
  mensaje?: string;

  @IsOptional() @IsString() @MaxLength(200)
  origen?: string;

  // Honeypot: un humano nunca lo llena.
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

export class ActualizarLeadDto {
  @IsOptional()
  @IsIn(['NUEVO', 'CONTACTADO', 'COTIZADO', 'GANADO', 'PERDIDO'])
  estado?: 'NUEVO' | 'CONTACTADO' | 'COTIZADO' | 'GANADO' | 'PERDIDO';

  @IsOptional() @IsString() @MaxLength(2000)
  notas?: string;
}
