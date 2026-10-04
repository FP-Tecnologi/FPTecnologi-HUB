import { Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ContactoWebService } from './contacto-web.service.js';
import { ActualizarContactoDto, CrearContactoDto } from './contacto-web.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Limite } from '../common/guards/limite-peticiones.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/** Dashboard: bandeja de contactos y reclamos de la web (admin y comercial de la marca). */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'comercial')
@Controller('contacto-web')
export class ContactoWebController {
  constructor(private readonly contactos: ContactoWebService) {}

  @Get()
  list(@MarcaActual() marcaId: string) {
    return this.contactos.list(marcaId);
  }

  @Get(':id')
  get(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.contactos.get(marcaId, id);
  }

  @Patch(':id')
  actualizar(
    @MarcaActual() marcaId: string,
    @Param('id') id: string,
    @Body() dto: ActualizarContactoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.contactos.actualizar(marcaId, id, dto, user.email);
  }

  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.contactos.eliminar(marcaId, id);
  }
}

/** Web pública (sin login): el formulario de contacto y el libro de reclamaciones envían acá. */
@Public()
@Controller('public/contacto')
export class PublicContactoWebController {
  constructor(private readonly contactos: ContactoWebService) {}

  @Limite(10)
  @Post()
  crear(
    @Query('marcaId') marcaId: string,
    @Body() dto: CrearContactoDto,
    @Ip() ip: string,
    @Headers('x-forwarded-for') forwarded?: string,
  ) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    // La web pública llama vía su proxy: la IP real del visitante viaja en x-forwarded-for.
    return this.contactos.crearPublico(marcaId, dto, forwarded?.split(',')[0]?.trim() || ip);
  }
}
