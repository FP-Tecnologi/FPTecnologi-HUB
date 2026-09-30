import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class MensajeAsesorDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  texto!: string;
}

// Web pública: el visitante guarda sus mensajes y las respuestas del
// asistente (que se generan en la web). Nunca puede escribir como ASESOR.
export class MensajePublicoDto {
  @IsString()
  token!: string;

  @IsIn(['CLIENTE', 'BOT'])
  autor!: 'CLIENTE' | 'BOT';

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  texto!: string;
}

export class CrearConversacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  paginaOrigen?: string;
}

export class EstadoConversacionDto {
  @IsIn(['BOT', 'ASESOR', 'CERRADA'])
  estado!: 'BOT' | 'ASESOR' | 'CERRADA';
}
