import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';

export interface StockProductDto {
  productId: string;
  quantity: number;
}

@Injectable()
export class StockService {
  async getOrderProducts(orderId: string): Promise<StockProductDto[]> {
    const mockOrders = {
      '123': [
        { productId: 'prod-123', quantity: 2 },
        { productId: 'prod-456', quantity: 1 },
      ],
    };
    if (!mockOrders[orderId]) {
      console.warn(`La commande ${orderId} n'existe pas`);
      return []; // Retourne une liste vide si la commande n'existe pas
    }

    console.log(`Récupération des produits pour la commande ${orderId}`);
    return mockOrders[orderId];
  }

  async removeStock(productId: string, quantity: number): Promise<boolean> {
    console.log(
      `Simuler la suppression de ${quantity} unités du produit ${productId}`,
    );
    // Bouchon temporaire pour tester sans dépendance au microservice stock
    const stockMock = {
      'prod-123': 3,
      'prod-456': 10,
    };

    if (stockMock[productId] && stockMock[productId] >= quantity) {
      console.log(`Stock suffisant pour ${productId}, suppression simulée.`);
      return true;
    } else {
      console.warn(`Stock insuffisant pour ${productId}`);
      return false;
    }

    /*
    // Code réel à réactiver une fois le microservice stock fonctionnel
    try {
      const response = await this.httpService.post(
        `$urlServeur/api/stock/${productId}/movement`,
        {
          productId,
          quantity,
          status: StockMovementType.Removal,
        }
      ).toPromise();
      return response.status === 204;
    } catch (error) {
      return false;
    }
    */
  }
}
