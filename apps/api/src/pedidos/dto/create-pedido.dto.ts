import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

class PedidoItemInput {
  @IsString()
  productoId!: string;

  @IsNumber()
  @Min(1)
  cantidad!: number;
}

export class CreatePedidoDto {
  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PedidoItemInput)
  items!: PedidoItemInput[];
}
