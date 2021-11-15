import { Module } from '@nestjs/common';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';
import { DatabaseModule } from '../services/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RentController],
  providers: [RentService],
})
export class RentModule {}
