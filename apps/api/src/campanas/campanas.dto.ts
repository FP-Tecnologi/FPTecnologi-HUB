import { IsDateString, IsIn, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CrearCampanaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  objetivo?: string;

  @IsOptional()
  @IsIn(['BORRADOR', 'ACTIVA', 'FINALIZADA'])
  estado?: 'BORRADOR' | 'ACTIVA' | 'FINALIZADA';

  @IsOptional()
  @IsDateString()
  inicio?: string;

  @IsOptional()
  @IsDateString()
  fin?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  presupuesto?: number;

  @IsOptional()
  @IsIn(['PEN', 'USD'])
  moneda?: 'PEN' | 'USD';
}

export class ActualizarCampanaDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100) nombre?: string;
  @IsOptional() @IsString() @MaxLength(1000) descripcion?: string;
  @IsOptional() @IsString() @MaxLength(300) objetivo?: string;
  @IsOptional() @IsIn(['BORRADOR', 'ACTIVA', 'FINALIZADA']) estado?: 'BORRADOR' | 'ACTIVA' | 'FINALIZADA';
  /** '' = quitar la fecha */
  @IsOptional() @IsString() inicio?: string;
  @IsOptional() @IsString() fin?: string;
  @IsOptional() @IsNumber() @Min(0) presupuesto?: number;
  @IsOptional() @IsIn(['PEN', 'USD']) moneda?: 'PEN' | 'USD';
}
