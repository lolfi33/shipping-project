import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ShippingController } from './controller/shipping.controller';
import { ShippingService } from './service/shipping.service';
import { StockService } from './service/stock.service';
import { Order } from './entities/Order';
import 'dotenv/config'; // Assure le chargement des variables d'environnement

console.log('📌 DATABASE_URL:', process.env.DATABASE_URL);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rendre ConfigModule accessible globalement
    }),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Order], // Utilise directement l'entité Order
      synchronize: true,
      extra: {
        ssl: {
          rejectUnauthorized: false, // 🔥 Active SSL pour Render
        },
      },
    }),
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [ShippingController],
  providers: [ShippingService, StockService],
})
export class AppModule {}
