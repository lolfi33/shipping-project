import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Order } from 'src/entities/Order';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export interface StockProductDto {
  productId: string;
  nbProducts: number;
}

@Injectable()
export class StockService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async getOrderProducts(orderId: string): Promise<Order[]> {
    try {
      const order = await this.ordersRepository.findOne({ where: { orderId } });

      if (!order) {
        console.warn(`⚠️ La commande ${orderId} n'existe pas.`);
        return [];
      }

      console.log(`📦 Récupération des produits pour la commande ${orderId}`);
      return [order]; // Retourne la commande trouvée sous forme de tableau
    } catch (error) {
      console.error(
        `❌ Erreur lors de la récupération des produits pour la commande ${orderId}`,
        error,
      );
      return [];
    }
  }

  async removeStock(productId: string, nbProducts: number): Promise<boolean> {
    console.log(
      `Demande de suppression de ${nbProducts} unités du produit ${productId}`,
    );

    /* Bouchon - Décommenter cette section si besoin pour tester sans microservice stock
    const stockMock = {
      'prod-123': 3,
      'prod-456': 10,
    };
    if (stockMock[productId] && stockMock[productId] >= nbProducts) {
      console.log(`Stock suffisant pour ${productId}, suppression simulée.`);
      return true;
    } else {
      console.warn(`Stock insuffisant pour ${productId}`);
      return false;
    }
    */
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `http://donoma.ddns.net/api/api/stock/${productId}/movement`,
          {
            productId,
            nbProducts,
            status: 'Removal',
          },
        ),
      );
      return response.status === 204;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression du stock pour ${productId}`,
        error,
      );
      return false;
    }
  }
}
