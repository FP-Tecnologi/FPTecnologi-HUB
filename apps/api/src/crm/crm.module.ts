import { Module } from '@nestjs/common';
import { CrmService } from './crm.service.js';
import { CrmController } from './crm.controller.js';

@Module({ controllers: [CrmController], providers: [CrmService], exports: [CrmService] })
export class CrmModule {}
