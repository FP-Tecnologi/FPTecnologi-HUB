import { Module } from '@nestjs/common';
import { EnviosService } from './envios.service.js';
import { EnviosController, PublicAgenciasController, PublicEnviosController } from './envios.controller.js';
import { ShalomApiProvider } from './shalom-api.provider.js';

@Module({
  controllers: [EnviosController, PublicAgenciasController, PublicEnviosController],
  providers: [EnviosService, ShalomApiProvider],
  exports: [EnviosService],
})
export class EnviosModule {}
