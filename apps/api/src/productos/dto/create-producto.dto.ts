import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  sku!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug solo admite minúsculas, números y guiones',
  })
  slug?: string;

  @IsNumber()
  @Min(0)
  precio!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioAntes?: number;

  /** Precio para clientes mayoristas (mínimo 6 unidades); null = usar `precio`. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioMayorista?: number | null;

  @IsOptional()
  @IsString()
  moneda?: string;

  @IsOptional()
  @IsString()
  marcaComercial?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
