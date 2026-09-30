import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { CreateChatAsesorDto, UpdateChatAsesorDto } from './dto/asesor.dto.js';
import { CrearConversacionDto, EstadoConversacionDto, MensajeAsesorDto, MensajePublicoDto } from './dto/mensaje.dto.js';
import { MarcaRolGuard } from '../common/guards/marca-rol.guard.js';
import { MarcaActual } from '../common/decorators/marca-actual.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

/**
 * Dashboard: bandeja de conversaciones del asistente virtual (leer, tomar,
 * responder, cerrar) y perfiles de asesores de WhatsApp. Solo admin y
 * asesores de la marca activa.
 */
@UseGuards(MarcaRolGuard)
@Roles('admin', 'asesores')
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('asesores')
  asesores(@MarcaActual() marcaId: string) {
    return this.chat.listAsesores(marcaId);
  }

  @Post('asesores')
  crearAsesor(@MarcaActual() marcaId: string, @Body() dto: CreateChatAsesorDto) {
    return this.chat.createAsesor(marcaId, dto);
  }

  @Patch('asesores/:id')
  editarAsesor(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: UpdateChatAsesorDto) {
    return this.chat.updateAsesor(marcaId, id, dto);
  }

  @Delete('asesores/:id')
  borrarAsesor(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.chat.deleteAsesor(marcaId, id);
  }

  @Get('conversaciones')
  conversaciones(@MarcaActual() marcaId: string, @Query('estado') estado?: string) {
    return this.chat.listConversaciones(marcaId, estado);
  }

  @Get('conversaciones/:id')
  conversacion(@MarcaActual() marcaId: string, @Param('id') id: string) {
    return this.chat.getConversacion(marcaId, id);
  }

  @Post('conversaciones/:id/tomar')
  tomar(@MarcaActual() marcaId: string, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.chat.tomar(marcaId, id, user.sub);
  }

  @Patch('conversaciones/:id/estado')
  estado(@MarcaActual() marcaId: string, @Param('id') id: string, @Body() dto: EstadoConversacionDto) {
    return this.chat.cambiarEstado(marcaId, id, dto.estado);
  }

  @Post('conversaciones/:id/mensajes')
  responder(
    @MarcaActual() marcaId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MensajeAsesorDto,
  ) {
    return this.chat.responder(marcaId, id, user.sub, dto.texto);
  }
}

/**
 * Web pública (sin login): el widget crea su conversación, guarda mensajes
 * y consulta si un asesor respondió. El acceso a cada conversación se
 * valida con el `token` secreto que solo tiene el navegador del visitante.
 */
@Public()
@Controller('public/chat')
export class PublicChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('asesores')
  async asesores(@Query('marcaId') marcaId: string) {
    const rows = await this.chat.listAsesores(marcaId, true);
    return rows.map(({ id, nombre, area, telefono, whatsapp, fotoUrl }) => ({ id, nombre, area, telefono, whatsapp, fotoUrl }));
  }

  @Post('conversaciones')
  crear(@Query('marcaId') marcaId: string, @Body() dto: CrearConversacionDto) {
    return this.chat.crearPublica(marcaId, dto.paginaOrigen);
  }

  @Post('conversaciones/:id/mensajes')
  mensaje(@Query('marcaId') marcaId: string, @Param('id') id: string, @Body() dto: MensajePublicoDto) {
    return this.chat.mensajePublico(marcaId, id, dto);
  }

  @Get('conversaciones/:id')
  estado(
    @Query('marcaId') marcaId: string,
    @Param('id') id: string,
    @Query('token') token: string,
    @Query('desde') desde?: string,
    @Query('foto') foto?: string,
  ) {
    return this.chat.estadoPublico(marcaId, id, token, desde, foto === '1');
  }
}
