import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const TEXTO = /^[^<>]*$/; // sin etiquetas: estos datos se muestran en el dashboard y en correos

export class CrearContactoDto {
  @IsOptional() @IsIn(['CONTACTO', 'RECLAMO'])
  tipo?: 'CONTACTO' | 'RECLAMO';

  @IsString() @MinLength(2) @MaxLength(120) @Matches(TEXTO)
  nombre!: string;

  @IsEmail() @MaxLength(120)
  email!: string;

  @IsOptional() @IsString() @MaxLength(20)
  celular?: string;

  @IsOptional() @IsString() @MaxLength(120) @Matches(TEXTO)
  empresa?: string;

  @IsString() @MinLength(2) @MaxLength(3000) @Matches(TEXTO)
  mensaje!: string;

  @IsOptional() @IsString() @MaxLength(200)
  origen?: string;

  // Honeypot: un humano nunca lo llena.
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

export class ActualizarContactoDto {
  @IsOptional() @IsIn(['NUEVO', 'CONTACTADO', 'RESUELTO', 'DESCARTADO'])
  estado?: 'NUEVO' | 'CONTACTADO' | 'RESUELTO' | 'DESCARTADO';

  @IsOptional() @IsString() @MaxLength(2000)
  notas?: string;
}
