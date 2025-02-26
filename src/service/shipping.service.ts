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
import { StockService } from './stock.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  // Vous pouvez décider de ne plus utiliser ces attributs en fonction de vos besoins.
  private pendingOrders: any[] = [];
  private totalPendingQuantity = 0;
  private readonly threshold = 5;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly stockService: StockService, // ✅ Injecter StockService
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async addShippingRequest(shippingRequest: any): Promise<void> {
    // Vous pouvez continuer à accumuler temporairement des commandes
    // ou utiliser directement la méthode "create" pour les persister en base.
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
      // Optionnel : réinitialisation si vous continuez à utiliser ces accumulations locales
      this.pendingOrders = [];
      this.totalPendingQuantity = 0;
    }
  }

  /**
   * Récupère les commandes non traitées dans la base de données,
   * vérifie si les produits sont en stock, envoie une notification
   * au microservice commande pour indiquer que la commande est traitée,
   * et met à jour la commande en base.
   */
  private async processPendingOrders(): Promise<void> {
    // 1️⃣ Récupération des commandes en base
    const pendingOrdersFromDB = await this.ordersRepository.find();

    // URL du microservice commande
    const orderServiceUrl =
      this.configService.get<string>('ORDER_SERVICE_URL') ||
      'http://microsrvcommande-5d7aa803.koyeb.app';

    for (const order of pendingOrdersFromDB) {
      console.log(`🔍 Vérification du stock pour la commande ${order.orderId}`);

      // 2️⃣ Vérifier si tous les produits de la commande sont en stock
      const isStockAvailable = await this.stockService.checkStockAvailability(
        order.orderId,
        order.nbProducts,
      );

      if (isStockAvailable) {
        console.log(
          `✅ Stock disponible pour la commande ${order.orderId}, traitement...`,
        );

        const url = `${orderServiceUrl}/api/order/${order.orderId}`;
        const updateData = { status: 'Processed' };

        try {
          // 3️⃣ Notification au microservice commande
          await lastValueFrom(this.httpService.patch(url, updateData));
          this.logger.log(`📦 Commande ${order.orderId} traitée avec succès.`);

          await this.ordersRepository.save(order);
        } catch (error) {
          this.logger.error(
            `❌ Erreur lors du traitement de la commande ${order.orderId}: ${error.message}`,
          );
        }
      } else {
        console.warn(
          `❌ Stock insuffisant pour la commande ${order.orderId}, suppression.`,
        );
        await this.ordersRepository.delete(order.orderId);
      }
    }
  }

  async create(shippingRequest: ShippingRequestDto): Promise<Order> {
    console.log('Création de la demande de livraison :', shippingRequest);
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
