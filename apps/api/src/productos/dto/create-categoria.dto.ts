import { IsBoolean, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug solo admite minúsculas, números y guiones',
  })
  slug?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  portadaUrl?: string;
}
