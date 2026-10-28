import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsIn, IsString, MaxLength } from 'class-validator';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { CrmService } from './crm.service.js';
import {
  ActividadDto, ActualizarActividadDto, ActualizarOportunidadDto, CambiarEtapaDto, ContactoDto, CrearOportunidadDto, EmpresaDto, FiltrosOportunidades,
} from './crm.dto.js';

class PorOrigenDto {
  @IsIn(['COTIZADOR', 'COTIZACION', 'CONTACTO_WEB', 'PRESUPUESTO']) origen!: 'COTIZADOR' | 'COTIZACION' | 'CONTACTO_WEB' | 'PRESUPUESTO';
  @IsString() @MaxLength(40) id!: string;
}

/** Dashboard → CRM (admin y comercial de la marca activa). Borrar oportunidades, empresas y contactos: solo admin. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'comercial')
@Controller('crm')
export class CrmController {
  constructor(private readonly crm: CrmService) {}

  @Roles('admin', 'comercial', 'direccion') // dirección: solo lectura (embudo y reportes)
  @Get('asignables')
  asignables(@MarcaActual() marcaId: string) {
    return this.crm.asignables(marcaId);
  }

  @Roles('admin', 'comercial', 'direccion') // dirección: solo lectura (embudo y reportes)
  @Get('oportunidades')
  listar(@MarcaActual() marcaId: string, @Query() f: FiltrosOportunidades, @CurrentUser() u: AuthenticatedUser) {
    return this.crm.listar(marcaId, f, u.sub);
  }

  /** ¿Qué oportunidad tiene esta solicitud? (botón «Ver en CRM» de Leads, Cotizaciones, Contactos y Presupuestos). */
  @Get('por-origen')
  async porOrigen(@MarcaActual() marcaId: string, @Query() q: PorOrigenDto) {
    const o = await this.crm.porOrigen(marcaId, q.origen, q.id);
    if (!o) throw new NotFoundException('Esta solicitud no está en el CRM');
    return o;
  }

  @Roles('admin', 'comercial', 'direccion') // dirección: solo lectura (embudo y reportes)
  @Get('oportunidades/:id')
  obtener(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.crm.obtener(marcaId, id);
  }

  @Post('oportunidades')
  crear(@MarcaActual() marcaId: string, @Body() dto: CrearOportunidadDto, @CurrentUser() u: AuthenticatedUser) {
    return this.crm.crear(marcaId, dto, u.email);
  }

  @Patch('oportunidades/:id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarOportunidadDto, @CurrentUser() u: AuthenticatedUser) {
    return this.crm.actualizar(marcaId, id, dto, u.email);
  }

  @Patch('oportunidades/:id/etapa')
  etapa(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: CambiarEtapaDto, @CurrentUser() u: AuthenticatedUser) {
    return this.crm.cambiarEtapa(marcaId, id, dto, u.email);
  }

  @Roles('admin')
  @Delete('oportunidades/:id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.crm.eliminar(marcaId, id);
  }

  @Post('oportunidades/:id/actividades')
  actividad(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActividadDto, @CurrentUser() u: AuthenticatedUser) {
    return this.crm.agregarActividad(marcaId, id, dto, u.email);
  }

  @Patch('actividades/:id')
  actualizarActividad(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarActividadDto) {
    return this.crm.actualizarActividad(marcaId, id, dto);
  }

  @Delete('actividades/:id')
  eliminarActividad(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.crm.eliminarActividad(marcaId, id);
  }

  @Get('agenda')
  agenda(@MarcaActual() marcaId: string, @Query('mias') mias: string | undefined, @CurrentUser() u: AuthenticatedUser) {
    return this.crm.agenda(marcaId, u.sub, mias === '1');
  }

  @Roles('admin', 'comercial', 'direccion') // dirección: solo lectura (embudo y reportes)
  @Get('reportes')
  reportes(@MarcaActual() marcaId: string, @Query('meses') meses?: string) {
    const m = Number(meses);
    return this.crm.reportes(marcaId, [3, 6, 12].includes(m) ? m : 12);
  }

  @Get('empresas')
  empresas(@MarcaActual() marcaId: string, @Query('q') q?: string) {
    return this.crm.listarEmpresas(marcaId, q?.slice(0, 100));
  }

  @Post('empresas')
  crearEmpresa(@MarcaActual() marcaId: string, @Body() dto: EmpresaDto) {
    return this.crm.crearEmpresa(marcaId, dto);
  }

  @Patch('empresas/:id')
  actualizarEmpresa(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: EmpresaDto) {
    return this.crm.actualizarEmpresa(marcaId, id, dto);
  }

  @Roles('admin')
  @Delete('empresas/:id')
  eliminarEmpresa(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.crm.eliminarEmpresa(marcaId, id);
  }

  @Get('contactos')
  contactos(@MarcaActual() marcaId: string, @Query('q') q?: string, @Query('empresaId') empresaId?: string) {
    return this.crm.listarContactos(marcaId, q?.slice(0, 100), empresaId?.slice(0, 40));
  }

  @Post('contactos')
  crearContacto(@MarcaActual() marcaId: string, @Body() dto: ContactoDto) {
    return this.crm.crearContacto(marcaId, dto);
  }

  @Patch('contactos/:id')
  actualizarContacto(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ContactoDto) {
    return this.crm.actualizarContacto(marcaId, id, dto);
  }

  @Roles('admin')
  @Delete('contactos/:id')
  eliminarContacto(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.crm.eliminarContacto(marcaId, id);
  }
}
