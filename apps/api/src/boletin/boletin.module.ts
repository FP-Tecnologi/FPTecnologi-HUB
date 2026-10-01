import { Module } from '@nestjs/common';
import { BoletinService } from './boletin.service.js';
import { BoletinController, PublicBoletinController } from './boletin.controller.js';

@Module({
  controllers: [BoletinController, PublicBoletinController],
  providers: [BoletinService],
})
export class BoletinModule {}
