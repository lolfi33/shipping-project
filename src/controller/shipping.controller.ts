// src/shipping.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('shipping')
export class ShippingController {
  @Get('ping')
  ping() {
    return 'pong';
  }
}
