import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { PublicTicketsController, TicketsController } from './tickets.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [TicketsController, PublicTicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
