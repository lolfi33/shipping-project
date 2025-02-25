import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ShippingService } from '../service/shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('ping')
  ping() {
    return 'pong';
  }
  @Post()
  @HttpCode(204)
  async createShipping(@Body() shippingRequest: any): Promise<void> {
    // Validation minimale
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
