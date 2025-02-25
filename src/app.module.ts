import { Module } from '@nestjs/common';
import { ShippingController } from './controller/shipping.controller';

@Module({
  controllers: [ShippingController],
})
export class AppModule {}
