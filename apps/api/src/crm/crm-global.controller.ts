import { Controller, Get, Query } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { CrmService } from './crm.service.js';
import { FiltrosOportunidades } from './crm.dto.js';

class FiltrosConsolidado extends FiltrosOportunidades {
  /** Ids de marca separados por coma: solo recorta las marcas a las que el usuario ya accede. */
  @IsOptional() @IsString() @MaxLength(500) marcas?: string;
}

const ids = (v?: string) => v?.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 30);

/**
 * Vista Comercial: el CRM de todas las marcas del usuario en una sola lista. No usa MarcaRolGuard (no hay una marca activa):
 * las marcas y los roles salen del token, así que un filtro del cliente solo puede recortar, nunca ampliar. Cada fila trae su
 * `marca`; para abrir o cambiar una oportunidad se vuelve a las rutas `/crm/*` con el `x-marca-id` de esa marca.
 */
@Controller('crm/global')
export class CrmGlobalController {
  constructor(private readonly crm: CrmService) {}

  @Get('oportunidades')
  oportunidades(@Query() f: FiltrosConsolidado, @CurrentUser() u: AuthenticatedUser) {
    return this.crm.listarConsolidado(u.marcas, f, u.sub, ids(f.marcas));
  }

  /** Resumen de ventas por marca y total (meses: 3, 6 o 12). `mias=1` cuenta solo lo propio en todas las marcas. */
  @Get('reportes')
  reportes(@CurrentUser() u: AuthenticatedUser, @Query('meses') meses?: string, @Query('mias') mias?: string, @Query('marcas') marcas?: string) {
    const m = Number(meses);
    return this.crm.reportesPorMarca(u.marcas, [3, 6, 12].includes(m) ? m : 12, u.sub, mias === '1', ids(marcas?.slice(0, 500)));
  }

  @Get('agenda')
  agenda(@CurrentUser() u: AuthenticatedUser, @Query('mias') mias?: string, @Query('marcas') marcas?: string) {
    return this.crm.agendaConsolidada(u.marcas, u.sub, mias === '1', ids(marcas?.slice(0, 500)));
  }
}
