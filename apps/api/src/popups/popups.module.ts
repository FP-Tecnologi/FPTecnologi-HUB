import { Module } from '@nestjs/common';
import { PopupsService } from './popups.service.js';
import { PopupsController, PublicPopupsController } from './popups.controller.js';

@Module({ controllers: [PopupsController, PublicPopupsController], providers: [PopupsService] })
export class PopupsModule {}
