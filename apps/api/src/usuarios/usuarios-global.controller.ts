import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UsuariosGlobalService } from './usuarios-global.service.js';
import { ActividadService } from '../actividad/actividad.service.js';
import { AuthService } from '../auth/auth.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

class ActivoDto { @IsBoolean() activo!: boolean; @IsOptional() @IsString() codigo?: string }
class EditarDto {
  @IsOptional() @IsString() @MaxLength(120) nombre?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(80) cargo?: string;
  @IsOptional() @IsString() @MaxLength(30) telefono?: string;
  @IsOptional() @IsString() @MaxLength(20) dni?: string;
  @IsOptional() @IsString() codigo?: string;
}
class CrearUsuarioDto {
  @IsEmail() email!: string;
  @IsOptional() @IsString() @MaxLength(120) nombre?: string;
  @IsOptional() @IsString() @MaxLength(80) cargo?: string;
  @IsOptional() @IsString() @MaxLength(30) telefono?: string;
  @IsOptional() @IsString() @MaxLength(20) dni?: string;
  @IsOptional() @IsString() marcaId?: string;
  @IsOptional() @IsString() rolId?: string;
  @IsOptional() @IsBoolean() superAdmin?: boolean;
  @IsOptional() @IsString() codigo?: string;
  @IsIn(['invitacion', 'password']) acceso!: 'invitacion' | 'password';
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsBoolean() enviarCambio?: boolean;
}
class CodigoDto { @IsOptional() @IsString() codigo?: string }
class SuperAdminDto { @IsBoolean() superAdmin!: boolean; @IsOptional() @IsString() codigo?: string }
class PasswordDto { @IsString() @MinLength(8) password!: string; @IsOptional() @IsString() codigo?: string }
class AsignacionDto { @IsString() marcaId!: string; @IsString() rolId!: string }

/** Administración global: todos los usuarios de todas las marcas. Solo super admin (admin de todas las marcas). */
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('usuarios/global')
export class UsuariosGlobalController {
  constructor(private readonly global: UsuariosGlobalService, private readonly actividad: ActividadService, private readonly auth: AuthService) {}

  private log(user: AuthenticatedUser, accion: string, detalle: string, marcaId?: string) {
    void this.actividad.registrar({ usuarioId: user.sub, email: user.email, accion, detalle, marcaId });
  }

  @Get()
  listar(@Query('q') q?: string, @Query('marcaId') marcaId?: string, @Query('rolId') rolId?: string) {
    return this.global.listar({ q, marcaId, rolId });
  }

  @Patch(':id/activo')
  activo(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: ActivoDto) {
    if (id === user.sub) throw new BadRequestException('No puedes desactivar tu propia cuenta');
    return this.global.activar(user.sub, id, dto.activo, dto.codigo).then((r) => { this.log(user, dto.activo ? 'cuenta_activada' : 'cuenta_desactivada', `Usuario ${id}`); return r; });
  }

  @Post(':id/asignaciones')
  asignar(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: AsignacionDto) {
    return this.global.asignar(id, dto.marcaId, dto.rolId).then((r) => { this.log(user, 'rol_asignado', `Usuario ${id} · rol ${dto.rolId}`, dto.marcaId); return r; });
  }

  @Delete(':id/asignaciones/:marcaId/:rolId')
  quitar(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Param('marcaId') marcaId: string, @Param('rolId') rolId: string) {
    return this.global.quitar(user.sub, id, marcaId, rolId).then((r) => { this.log(user, 'rol_quitado', `Usuario ${id} · rol ${rolId}`, marcaId); return r; });
  }

  @Post()
  crear(@CurrentUser() user: AuthenticatedUser, @Body() dto: CrearUsuarioDto) {
    return this.global.crearUsuario(user.sub, user.email, dto).then((r) => { this.log(user, dto.superAdmin ? 'super_admin_creado' : 'usuario_creado', `${r.email} · ${dto.acceso === 'invitacion' ? 'invitación' : 'contraseña definida'}`, dto.marcaId); return r; });
  }

  /** Inicia la verificación de una acción sensible: pide el código de la app autenticadora o envía uno al correo. */
  @Post('verificacion')
  verificacion(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.solicitarConfirmacion(user.sub);
  }

  @Patch(':id')
  editar(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: EditarDto) {
    const { codigo, ...datos } = dto;
    return this.global.editar(user.sub, id, datos, codigo).then((r) => { this.log(user, 'usuario_editado', `Usuario ${id}`); return r; });
  }

  @Post(':id/eliminar')
  eliminar(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CodigoDto) {
    return this.global.eliminar(user.sub, id, dto.codigo).then((r) => { this.log(user, 'usuario_eliminado', `Usuario ${id}`); return r; });
  }

  @Patch(':id/super-admin')
  superAdmin(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: SuperAdminDto) {
    return this.global.superAdmin(user.sub, id, dto.superAdmin, dto.codigo).then((r) => { this.log(user, dto.superAdmin ? 'super_admin_asignado' : 'super_admin_quitado', `Usuario ${id}`); return r; });
  }

  @Post(':id/reset-password')
  resetPassword(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.global.enviarResetPassword(id).then((r) => { this.log(user, 'correo_restablecer_password', r.email); return r; });
  }

  @Post(':id/password')
  password(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: PasswordDto) {
    return this.global.cambiarPassword(user.sub, id, dto.password, dto.codigo).then((r) => { this.log(user, 'password_cambiada_por_admin', `Usuario ${id}`); return r; });
  }

  @Post(':id/2fa/reset')
  reset2fa(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CodigoDto) {
    return this.global.reset2fa(user.sub, id, dto.codigo).then((r) => { this.log(user, '2fa_restablecido', `Usuario ${id}`); return r; });
  }

  @Post(':id/sesiones/cerrar')
  cerrarSesiones(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.global.cerrarSesiones(id).then((r) => { this.log(user, 'sesiones_cerradas', `Usuario ${id}`); return r; });
  }
}
