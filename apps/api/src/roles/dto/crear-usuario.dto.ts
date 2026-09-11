import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Crea (o reutiliza, si ya existe) un usuario y lo asigna a la marca activa
 * con el rol dado. Solo un admin de esa marca puede llamarlo — ver
 * POST /roles/equipo.
 */
export class CrearUsuarioDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsString()
  rolId!: string;
}
