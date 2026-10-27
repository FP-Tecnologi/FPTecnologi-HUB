import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateMarcaDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  colorPrimario?: string;

  @IsOptional()
  @IsString()
  colorSecundario?: string;

  @IsOptional()
  @IsString()
  contactoEmail?: string;

  @IsOptional()
  @IsString()
  contactoTelefono?: string;

  /** Buzón que recibe los tickets de clientes de esta marca (vacío = el correo de contacto). */
  @IsOptional()
  @IsEmail({}, { message: 'El correo para tickets no es válido' })
  @MaxLength(120)
  correoTickets?: string | null;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'El RUC debe tener 11 dígitos' })
  ruc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccionFiscal?: string;
}
