import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCotizacionDto {
  @IsString()
  servicioId!: string;

  @IsString()
  clienteNombre!: string;

  @IsEmail()
  clienteEmail!: string;

  @IsOptional()
  @IsString()
  clienteTelefono?: string;

  @IsOptional()
  @IsString()
  mensaje?: string;
}
