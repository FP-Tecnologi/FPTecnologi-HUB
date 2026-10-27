import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { PublicTicketsController, TicketsController } from './tickets.controller.js';
import { MailModule } from '../mail/mail.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';
import { TicketsRolGuard } from './tickets-rol.guard.js';

@Module({
  imports: [MailModule, UploadsModule],
  controllers: [TicketsController, PublicTicketsController],
  providers: [TicketsService, TicketsRolGuard],
  exports: [TicketsService],
})
export class TicketsModule {}
