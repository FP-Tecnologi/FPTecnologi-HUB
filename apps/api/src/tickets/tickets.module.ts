import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { PublicTicketsController, TicketsController } from './tickets.controller.js';
import { MailModule } from '../mail/mail.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';

@Module({
  imports: [MailModule, UploadsModule],
  controllers: [TicketsController, PublicTicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
