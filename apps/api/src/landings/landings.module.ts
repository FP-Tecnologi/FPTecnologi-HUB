import { Module } from '@nestjs/common';
import { LandingsService } from './landings.service.js';
import { LandingsController, PublicLandingsController } from './landings.controller.js';

@Module({
  controllers: [LandingsController, PublicLandingsController],
  providers: [LandingsService],
})
export class LandingsModule {}
