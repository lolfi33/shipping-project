import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ShippingController } from './controller/shipping.controller';
import { ShippingService } from './service/shipping.service';
import { StockService } from './service/stock.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rendre ConfigModule accessible globalement
    }),
    HttpModule,
  ],
  controllers: [ShippingController],
  providers: [ShippingService, StockService],
})
export class AppModule {}
