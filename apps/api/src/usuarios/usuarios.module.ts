import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosGlobalController } from './usuarios-global.controller.js';
import { UsuariosGlobalService } from './usuarios-global.service.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';

@Module({
  controllers: [UsuariosController, UsuariosGlobalController],
  providers: [UsuariosService, UsuariosGlobalService, SuperAdminGuard],
  exports: [UsuariosService],
})
export class UsuariosModule {}
