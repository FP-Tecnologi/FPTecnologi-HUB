import { Module } from '@nestjs/common';
import { RecursosService } from './recursos.service.js';
import { PublicRecursosController, RecursosController } from './recursos.controller.js';
import { CuentaModule } from '../cuenta/cuenta.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';

@Module({
  imports: [CuentaModule, UploadsModule],
  controllers: [RecursosController, PublicRecursosController],
  providers: [RecursosService],
})
export class RecursosModule {}
