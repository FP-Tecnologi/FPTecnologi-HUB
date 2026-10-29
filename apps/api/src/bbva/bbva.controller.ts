import { BadRequestException, Body, Controller, Headers, Ip, Post, Query } from '@nestjs/common';
import { BbvaService } from './bbva.service.js';
import { ConsultarOfertasDto, SolicitarTarjetaDto } from './bbva.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';

/** Web pública: el visitante consulta qué tarjetas BBVA tiene disponibles y elige una (la contratación sigue en BBVA). */
@Public()
@Controller('public/bbva')
export class PublicBbvaController {
  constructor(private readonly bbva: BbvaService) {}

  @Limite(10)
  @Post('ofertas')
  ofertas(
    @Query('marcaId') marcaId: string,
    @Body() dto: ConsultarOfertasDto,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwarded?: string,
  ) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    // La web pública llama vía su proxy: la IP real del visitante viaja en x-forwarded-for.
    return this.bbva.consultar(marcaId, dto, forwarded?.split(',')[0]?.trim() || ip);
  }

  @Limite(20)
  @Post('solicitar')
  solicitar(@Query('marcaId') marcaId: string, @Body() dto: SolicitarTarjetaDto) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.bbva.solicitar(marcaId, dto);
  }
}
