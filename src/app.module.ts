import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RentModule } from './rent/rent.module';
import { DatabaseModule } from './services/database/database.module';

@Module({
  imports: [DatabaseModule, RentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
