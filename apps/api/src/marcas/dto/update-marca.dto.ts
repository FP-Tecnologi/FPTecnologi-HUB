import { PartialType } from '@nestjs/mapped-types';
import { CreateMarcaDto } from './create-marca.dto.js';

export class UpdateMarcaDto extends PartialType(CreateMarcaDto) {}
