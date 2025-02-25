import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ShippingRequestDto } from 'src/dto/ShippingRequestDto';
import { Order } from 'src/entities/Order';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private pendingOrders: any[] = [];
  private totalPendingQuantity = 0;
  private readonly threshold = 5;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async addShippingRequest(shippingRequest: any): Promise<void> {
    this.pendingOrders.push(shippingRequest);
    this.totalPendingQuantity += shippingRequest.nbProducts;
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

  async create(shippingRequest: ShippingRequestDto): Promise<Order> {
    try {
      const order = this.ordersRepository.create(shippingRequest);
      return this.ordersRepository.save(order);
    } catch (error) {
      console.error(
        'Erreur lors de la création de la demande de livraison :',
        error,
      );
      throw new InternalServerErrorException(
        'Impossible de créer la demande de livraison.',
      );
    }
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find();
  }
}
