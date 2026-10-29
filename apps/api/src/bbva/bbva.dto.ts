import { Equals, IsEmail, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

/** Operadores que acepta BBVA: Movistar, Claro, Bitel, Entel. */
export const OPERADORES = ['M', 'C', 'B', 'E'] as const;

export class ConsultarOfertasDto {
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener 8 dígitos' })
  dni!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha de nacimiento inválida' })
  nacimiento!: string;

  @Matches(/^9\d{8}$/, { message: 'Ingresa un celular válido de 9 dígitos' })
  celular!: string;

  @IsIn(OPERADORES)
  operador!: (typeof OPERADORES)[number];

  @IsEmail() @MaxLength(120)
  email!: string;

  /** Ley de Protección de Datos Personales: sin aceptarla BBVA no consulta. */
  @Equals(true, { message: 'Debes aceptar el tratamiento de datos personales' })
  aceptaDatos!: boolean;

  @IsOptional() @IsString() @MaxLength(200)
  origen?: string;

  // Honeypot: un humano nunca lo llena.
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

export class SolicitarTarjetaDto {
  /** Id de la consulta que devolvió /ofertas. */
  @IsUUID()
  consultaId!: string;

  @IsInt()
  ofertaId!: number;
}
