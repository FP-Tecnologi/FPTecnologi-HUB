import { Module } from '@nestjs/common';
import { CrmService } from './crm.service.js';
import { CrmController } from './crm.controller.js';
import { CrmGlobalController } from './crm-global.controller.js';

@Module({ controllers: [CrmController, CrmGlobalController], providers: [CrmService], exports: [CrmService] })
export class CrmModule {}
