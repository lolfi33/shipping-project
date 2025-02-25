import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export interface StockProductDto {
  productId: string;
  nbProducts: number;
}

@Injectable()
export class StockService {
  constructor(private readonly httpService: HttpService) {}

  async getOrderProducts(orderId: string): Promise<StockProductDto[]> {
    /* Bouchon - Décommenter cette section si besoin pour tester sans microservice stock
    const mockOrders = {
      '123': [
        { productId: 'prod-123', nbProducts: 2 },
        { productId: 'prod-456', nbProducts: 1 },
      ],
    };
    if (!mockOrders[orderId]) {
      console.warn(`La commande ${orderId} n'existe pas`);
      return []; // Retourne une liste vide si la commande n'existe pas
    }

    console.log(`Récupération des produits pour la commande ${orderId}`);
    return mockOrders[orderId];
    */
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `http://donoma.ddns.net/api/api/orders/${orderId}`,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des produits pour la commande ${orderId}`,
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
