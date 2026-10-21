import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

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
