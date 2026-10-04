import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service.js';
import { PublicUploadsController, UploadsController } from './uploads.controller.js';

@Module({ controllers: [UploadsController, PublicUploadsController], providers: [UploadsService], exports: [UploadsService] })
export class UploadsModule {}
