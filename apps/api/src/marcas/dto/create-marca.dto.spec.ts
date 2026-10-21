import { describe, expect, it } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMarcaDto } from './create-marca.dto.js';

const errores = (o: object) => validate(plainToInstance(CreateMarcaDto, { nombre: 'X', ...o }));

describe('CreateMarcaDto datos fiscales', () => {
  it('acepta RUC de 11 dígitos y dirección corta', async () => {
    expect(await errores({ ruc: '20123456789', razonSocial: 'X SAC', direccionFiscal: 'Av. 1' })).toHaveLength(0);
  });
  it('rechaza RUC inválido o dirección > 200', async () => {
    expect(await errores({ ruc: '123' })).toHaveLength(1);
    expect(await errores({ direccionFiscal: 'a'.repeat(201) })).toHaveLength(1);
  });
});
