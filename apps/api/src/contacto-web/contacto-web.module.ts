import { Module } from '@nestjs/common';
import { ContactoWebService } from './contacto-web.service.js';
import { ContactoWebController, PublicContactoWebController } from './contacto-web.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [ContactoWebController, PublicContactoWebController],
  providers: [ContactoWebService],
})
export class ContactoWebModule {}
