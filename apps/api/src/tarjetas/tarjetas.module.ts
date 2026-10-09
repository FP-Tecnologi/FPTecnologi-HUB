import { Module } from '@nestjs/common';
import { TarjetasService } from './tarjetas.service.js';
import { PublicTarjetasController, TarjetasController } from './tarjetas.controller.js';

@Module({ controllers: [TarjetasController, PublicTarjetasController], providers: [TarjetasService] })
export class TarjetasModule {}
