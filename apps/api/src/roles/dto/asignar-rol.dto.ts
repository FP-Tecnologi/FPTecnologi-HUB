import { IsString } from 'class-validator';

export class AsignarRolDto {
  @IsString()
  usuarioId!: string;

  @IsString()
  marcaId!: string;

  @IsString()
  rolId!: string;
}
