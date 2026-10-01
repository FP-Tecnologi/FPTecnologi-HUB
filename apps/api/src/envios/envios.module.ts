import { Module } from '@nestjs/common';
import { EnviosService } from './envios.service.js';
import { EnviosController, PublicAgenciasController, PublicEnviosController } from './envios.controller.js';

@Module({
  controllers: [EnviosController, PublicEnviosController, PublicAgenciasController],
  providers: [EnviosService],
  exports: [EnviosService],
})
export class EnviosModule {}
