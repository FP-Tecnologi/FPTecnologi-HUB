import { IsString } from 'class-validator';

export class CreateSitioDto {
  @IsString()
  dominio!: string;

  @IsString()
  marcaId!: string;
}
