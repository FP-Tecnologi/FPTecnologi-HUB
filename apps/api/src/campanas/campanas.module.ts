import { Module } from '@nestjs/common';
import { CampanasService } from './campanas.service.js';
import { CampanasController } from './campanas.controller.js';

@Module({ controllers: [CampanasController], providers: [CampanasService] })
export class CampanasModule {}
