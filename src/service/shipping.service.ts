import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private pendingOrders: any[] = [];
  private totalPendingQuantity = 0;
  private readonly threshold = 5;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async addShippingRequest(shippingRequest: any): Promise<void> {
    this.pendingOrders.push(shippingRequest);
    this.totalPendingQuantity += shippingRequest.quantity;
    this.logger.log(
      `Nouvelle commande ajoutée. Quantité en attente : ${this.totalPendingQuantity}`,
    );

    if (this.totalPendingQuantity >= this.threshold) {
      this.logger.log(
        `Seuil de ${this.threshold} atteint. Traitement des commandes...`,
      );
      await this.processPendingOrders();
    }
  }

  private async processPendingOrders(): Promise<void> {
    const mockMode = this.configService.get<boolean>('MOCK_ORDER_SERVICE');
    const orderServiceUrl =
      this.configService.get<string>('ORDER_SERVICE_URL') ||
      'http://order-service';

    if (mockMode) {
      this.logger.log(
        'Mode MOCK activé : simulation de traitement des commandes',
      );
      for (const order of this.pendingOrders) {
        this.logger.log(
          `(MOCK) Commande ${order.orderId} traitée avec succès.`,
        );
      }
    } else {
      for (const order of this.pendingOrders) {
        const url = `${orderServiceUrl}/api/order/${order.orderId}`;
        const updateData = { status: 'Processed' };

        try {
          await lastValueFrom(this.httpService.patch(url, updateData));
          this.logger.log(`Commande ${order.orderId} traitée avec succès.`);
        } catch (error) {
          this.logger.error(
            `Erreur lors du traitement de la commande ${order.orderId}: ${error.message}`,
          );
        }
      }
    }

    this.pendingOrders = [];
    this.totalPendingQuantity = 0;
  }
}
