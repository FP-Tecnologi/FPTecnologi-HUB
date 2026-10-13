import { Module } from '@nestjs/common';
import { UploadsModule } from '../uploads/uploads.module.js';
import { FolletosService } from './folletos.service.js';
import { FolletosController, PublicFolletosController } from './folletos.controller.js';

@Module({ imports: [UploadsModule], controllers: [FolletosController, PublicFolletosController], providers: [FolletosService] })
export class FolletosModule {}
