import { Module } from '@nestjs/common';
import { ContactoWebService } from './contacto-web.service.js';
import { ContactoWebController, PublicContactoWebController } from './contacto-web.controller.js';
import { MailModule } from '../mail/mail.module.js';
import { CrmModule } from '../crm/crm.module.js';

@Module({
  imports: [MailModule, CrmModule],
  controllers: [ContactoWebController, PublicContactoWebController],
  providers: [ContactoWebService],
})
export class ContactoWebModule {}
