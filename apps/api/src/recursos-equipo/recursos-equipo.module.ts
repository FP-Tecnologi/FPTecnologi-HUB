import { Module } from '@nestjs/common';
import { RecursosEquipoController } from './recursos-equipo.controller.js';
import { RecursosEquipoService } from './recursos-equipo.service.js';

@Module({ controllers: [RecursosEquipoController], providers: [RecursosEquipoService] })
export class RecursosEquipoModule {}
