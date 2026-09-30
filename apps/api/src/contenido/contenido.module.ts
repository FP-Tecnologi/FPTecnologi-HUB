import { Module } from '@nestjs/common';
import { ContenidoService } from './contenido.service.js';
import { ContenidoController, PublicContenidoController } from './contenido.controller.js';

@Module({
  controllers: [ContenidoController, PublicContenidoController],
  providers: [ContenidoService],
})
export class ContenidoModule {}
