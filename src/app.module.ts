import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ShippingController } from './controller/shipping.controller';
import { ShippingService } from './service/shipping.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Optionnel : rend ConfigModule accessible globalement
    }),
    HttpModule,
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
})
export class AppModule {}
