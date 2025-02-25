import { Module } from '@nestjs/common';
import { ShippingController } from './controller/shipping.controller';
import { StockService } from './service/stock.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ShippingController],
  providers: [StockService],
})
export class AppModule {}
