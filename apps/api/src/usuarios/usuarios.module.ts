import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosGlobalController } from './usuarios-global.controller.js';
import { UsuariosGlobalService } from './usuarios-global.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { MailModule } from '../mail/mail.module.js';
import { InvitacionesModule } from '../invitaciones/invitaciones.module.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';

@Module({
  imports: [AuthModule, MailModule, InvitacionesModule],
  controllers: [UsuariosController, UsuariosGlobalController],
  providers: [UsuariosService, UsuariosGlobalService, SuperAdminGuard],
  exports: [UsuariosService],
})
export class UsuariosModule {}
