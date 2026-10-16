import { Module } from '@nestjs/common';
import { SoporteController } from './soporte.controller.js';
import { SoporteService } from './soporte.service.js';
import { MailModule } from '../mail/mail.module.js';
import { SuperAdminGuard } from '../common/guards/super-admin.guard.js';

@Module({
  imports: [MailModule],
  controllers: [SoporteController],
  providers: [SoporteService, SuperAdminGuard],
})
export class SoporteModule {}
