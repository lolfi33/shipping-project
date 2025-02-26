import {
  Controller,
  Get,
  Post,
  Param,
  BadRequestException,
  Body,
  HttpCode,
} from '@nestjs/common';
import { StockService } from '../service/stock.service';
import { ShippingService } from '../service/shipping.service';
import { Order } from 'src/entities/Order';
import { ShippingRequestDto } from 'src/dto/ShippingRequestDto';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('shipping')
export class ShippingController {
  constructor(
    private readonly stockService: StockService,
    private readonly shippingService: ShippingService,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  @Get('ping')
  ping() {
    return 'pong';
  }

  @Post(':orderId')
  async shipOrder(@Param('orderId') orderId: string) {
    const orderProducts: Order[] =
      await this.stockService.getOrderProducts(orderId);

    if (orderProducts.length === 0) {
      throw new BadRequestException(`❌ La commande ${orderId} n'existe pas.`);
    }

    const productsToKeep: Order[] = [];
    const productsToRemove: Order[] = [];

    for (const order of orderProducts) {
      const isAvailable = await this.stockService.checkStockAvailability(
        order.orderId,
        order.nbProducts,
      );

      if (isAvailable) {
        console.log(
          `✅ Stock suffisant pour ${order.orderId}, produit conservé.`,
        );
        productsToKeep.push(order);
      } else {
        console.log(`❌ Stock insuffisant pour ${order.orderId}, suppression.`);
        await this.stockService.removeStock(order.orderId, order.nbProducts);
        productsToRemove.push(order);
      }
    }

    // Supprimer les produits qui ne sont pas en stock
    if (productsToRemove.length > 0) {
      await this.ordersRepository.delete(
        productsToRemove.map((p) => p.orderId),
      );
      console.log(`🚮 Produits supprimés de la commande ${orderId}`);
    }

    return {
      message: `Commande ${orderId} mise à jour. ${productsToKeep.length} produit(s) conservé(s), ${productsToRemove.length} supprimé(s).`,
    };
  }

  @Post()
  @HttpCode(204)
  async createShipping(@Body() shippingRequest: any): Promise<void> {
    if (
      !shippingRequest.orderId ||
      typeof shippingRequest.nbProducts !== 'number'
    ) {
      throw new BadRequestException(
        'Payload invalide : orderId requis et nbProducts doit être un nombre.',
      );
    }
    await this.shippingService.addShippingRequest(shippingRequest);
  }

  @Post()
  public async addOrder(@Body() order: ShippingRequestDto): Promise<Order> {
    return this.shippingService.create(order);
  }

  @Get() // Ajouter cette méthode
  public async getAllOrders(): Promise<Order[]> {
    return this.shippingService.findAll();
  }
}
