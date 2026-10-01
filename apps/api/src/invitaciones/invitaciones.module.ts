import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { InvitacionesService } from './invitaciones.service.js';
import { InvitacionesController, PublicInvitacionesController } from './invitaciones.controller.js';

@Module({
  imports: [MailModule],
  controllers: [InvitacionesController, PublicInvitacionesController],
  providers: [InvitacionesService],
})
export class InvitacionesModule {}
