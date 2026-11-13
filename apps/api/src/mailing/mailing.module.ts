import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service.js';
import { MailingController } from './mailing.controller.js';

@Module({ controllers: [MailingController], providers: [MailingService] })
export class MailingModule {}
