import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { agenciasCercanas, agenciasDeProvincia, provinciasConAgencias, type AgenciaShalom } from './agencias-shalom.js';
import { EnviosService } from './envios.service.js';
import { ActualizarTarifaDto, CrearTarifaDto } from './envios.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';

/** Dashboard → Ecommerce → Envíos: tarifario por departamento. */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'ventas')
@Controller('envios/tarifas')
export class EnviosController {
  constructor(private readonly envios: EnviosService) {}

  @Get()
  tarifas(@MarcaActual() marcaId: string) {
    return this.envios.tarifas(marcaId);
  }

  @Post()
  crear(@MarcaActual() marcaId: string, @Body() dto: CrearTarifaDto) {
    return this.envios.crear(marcaId, dto);
  }

  @Patch(':id')
  actualizar(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: ActualizarTarifaDto) {
    return this.envios.actualizar(marcaId, id, dto);
  }

  @Delete(':id')
  eliminar(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.envios.eliminar(marcaId, id);
  }
}

/** Checkout público: departamentos con envío, costo, plazo y agencias. */
@Public()
@Controller('public/envios')
export class PublicEnviosController {
  constructor(private readonly envios: EnviosService) {}

  @Get('tarifas')
  tarifas(@Query('marcaId') marcaId: string) {
    if (!marcaId) throw new BadRequestException('Falta marcaId');
    return this.envios.tarifasPublicas(marcaId);
  }
}

/** Datos de agencia que se exponen al checkout (sin el id interno de lat/lng nulos). */
const publica = (a: AgenciaShalom & { distanciaKm?: number }) => ({
  id: a.id,
  departamento: a.departamento,
  provincia: a.provincia,
  zona: a.zona,
  direccion: a.direccion,
  telefono: a.telefono,
  horario: a.horario,
  lat: a.lat,
  lng: a.lng,
  ...(a.distanciaKm !== undefined ? { distanciaKm: a.distanciaKm } : {}),
});

/** Directorio de agencias Shalom para elegir dónde recoger (público, sin marcaId: es información de Shalom). */
@Public()
@Controller('public/envios/agencias')
export class PublicAgenciasController {
  @Get('provincias')
  provincias(@Query('departamento') departamento: string) {
    if (!departamento) throw new BadRequestException('Falta departamento');
    return provinciasConAgencias(departamento);
  }

  @Get()
  porProvincia(@Query('departamento') departamento: string, @Query('provincia') provincia: string) {
    if (!departamento || !provincia) throw new BadRequestException('Falta departamento o provincia');
    return agenciasDeProvincia(departamento, provincia).map(publica);
  }

  /** Las más cercanas a la ubicación del cliente (lat/lng del navegador o del mapa), opcionalmente dentro de un departamento. */
  @Get('cercanas')
  cercanas(@Query('lat') lat: string, @Query('lng') lng: string, @Query('departamento') departamento?: string, @Query('departamentos') departamentos?: string) {
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln) || Math.abs(la) > 90 || Math.abs(ln) > 180) {
      throw new BadRequestException('Ubicación inválida');
    }
    // `departamentos` (lista separada por comas) limita la búsqueda a los departamentos con envío activo.
    const lista = departamentos ? departamentos.split(',').map((d) => d.trim()).filter(Boolean).slice(0, 30) : undefined;
    return agenciasCercanas(la, ln, 5, lista?.length ? lista : departamento || undefined).map(publica);
  }
}
