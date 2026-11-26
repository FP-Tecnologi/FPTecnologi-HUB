import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { PanelService } from './panel.service.js';

/** `?marcas=id1,id2` limita las marcas; ids que el usuario no tiene se ignoran. */
const leerMarcas = (marcas?: string) => marcas?.split(',').map((s) => s.trim()).filter(Boolean);

/**
 * Panel general del dashboard (todas las marcas del usuario en una petición). Sin `MarcaRolGuard`: el servicio
 * solo recorre las marcas del JWT y aplica a cada módulo los roles de su propio controlador.
 */
@Controller('panel')
export class PanelController {
  constructor(private readonly panel: PanelService) {}

  @Get('resumen')
  resumen(@CurrentUser() user: AuthenticatedUser, @Query('marcas') marcas?: string) {
    return this.panel.resumen(user, leerMarcas(marcas));
  }

  @Get('visitas')
  visitas(@CurrentUser() user: AuthenticatedUser, @Query('dias') dias?: string, @Query('marcas') marcas?: string) {
    return this.panel.visitasResumen(user, Number(dias), leerMarcas(marcas));
  }
}
