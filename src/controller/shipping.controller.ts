import {
  Controller,
  Get,
  Post,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { StockService } from '../service/stock.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly stockService: StockService) {}

  @Get('ping')
  ping() {
    return 'pong';
  }

  @Post('shipping/:orderId')
  async shipOrder(@Param('orderId') orderId: string) {
    const orderProducts = await this.stockService.getOrderProducts(orderId);
    for (const product of orderProducts) {
      const success = await this.stockService.removeStock(
        product.productId,
        product.quantity,
      );
      if (!success) {
        throw new BadRequestException(
          `Stock insuffisant pour le produit ${product.productId}`,
        );
      }
    }
    return { message: `Commande ${orderId} expédiée` };
  }
}
