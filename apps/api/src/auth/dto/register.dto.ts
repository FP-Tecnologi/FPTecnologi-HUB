import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Auto-registro público — SOLO para clientes (ecommerce). Nunca asigna un
 * rol de staff; el registro siempre cae en el rol "cliente" de la marca
 * indicada. Crear cuentas de equipo es cosa de un admin (POST /roles/equipo).
 */
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsString()
  marcaId!: string;
}
