import { Module } from '@nestjs/common';
import { EnviosService } from './envios.service.js';
import { EnviosController, PublicEnviosController } from './envios.controller.js';

@Module({
  controllers: [EnviosController, PublicEnviosController],
  providers: [EnviosService],
  exports: [EnviosService],
})
export class EnviosModule {}
