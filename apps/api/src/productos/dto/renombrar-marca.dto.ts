import { IsString, MinLength } from 'class-validator';

export class RenombrarMarcaComercialDto {
  @IsString()
  @MinLength(1)
  desde!: string;

  // Vacío = quitar la marca de esos productos.
  @IsString()
  hasta!: string;
}
