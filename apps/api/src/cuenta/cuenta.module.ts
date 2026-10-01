import { Module } from '@nestjs/common';
import { CuentaService } from './cuenta.service.js';
import { CuentaController } from './cuenta.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({ imports: [MailModule], controllers: [CuentaController], providers: [CuentaService] })
export class CuentaModule {}
