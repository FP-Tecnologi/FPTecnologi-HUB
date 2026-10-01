import { IsIn, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CrearLandingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @Matches(SLUG, { message: 'La URL solo admite minúsculas, números y guiones' })
  @MaxLength(60)
  slug?: string;

  @IsIn(['evento', 'oferta', 'captacion'])
  plantilla!: 'evento' | 'oferta' | 'captacion';

  @IsOptional()
  @IsString()
  campanaId?: string;
}

export class ActualizarLandingDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @Matches(SLUG, { message: 'La URL solo admite minúsculas, números y guiones' })
  @MaxLength(60)
  slug?: string;

  @IsOptional()
  @IsIn(['BORRADOR', 'PUBLICADA'])
  estado?: 'BORRADOR' | 'PUBLICADA';

  /** null = sin campaña */
  @IsOptional()
  campanaId?: string | null;

  @IsOptional()
  @IsObject()
  contenido?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  formulario?: Record<string, unknown>;
}

export class RegistroPublicoDto {
  @IsObject()
  datos!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  origen?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
