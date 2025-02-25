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

@Controller('shipping')
export class ShippingController {
  constructor(
    private readonly stockService: StockService,
    private readonly shippingService: ShippingService,
  ) {}

  @Get('ping')
  ping() {
    return 'pong';
  }

  @Post(':orderId')
  async shipOrder(@Param('orderId') orderId: string) {
    const orderProducts = await this.stockService.getOrderProducts(orderId);
    if (orderProducts.length === 0) {
      throw new BadRequestException(`La commande ${orderId} n'existe pas.`);
    }

    for (const product of orderProducts) {
      const success = await this.stockService.removeStock(
        product.productId,
        product.quantity,
      );
      if (!success) {
        throw new BadRequestException(
          `Stock insuffisant pour le produit ${product.productId}.`,
        );
      }
    }
    return { message: `Produits de la commande ${orderId} supprimé des stock` };
  }

  @Post()
  @HttpCode(204)
  async createShipping(@Body() shippingRequest: any): Promise<void> {
    if (
      !shippingRequest.orderId ||
      typeof shippingRequest.quantity !== 'number'
    ) {
      throw new BadRequestException(
        'Payload invalide : orderId requis et quantity doit être un nombre.',
      );
    }
    await this.shippingService.addShippingRequest(shippingRequest);
  }
}
