import { IsEmail } from 'class-validator';

/** El admin identifica al bloqueado por su correo; la marca sale del header `x-marca-id`. */
export class Reset2faDto {
  @IsEmail()
  email!: string;
}
