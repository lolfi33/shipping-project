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
      const orders = await this.ordersRepository.find({ where: { orderId } });

      if (!orders || orders.length === 0) {
        console.warn(`⚠️ La commande ${orderId} n'existe pas.`);
        return [];
      }

      console.log(`📦 Récupération des produits pour la commande ${orderId}`);

      return orders; // Retourne directement la liste des objets `Order`
    } catch (error) {
      console.error(
        `❌ Erreur lors de la récupération des produits pour la commande ${orderId}`,
        error,
      );
      return [];
    }
  }

  async checkStockAvailability(
    productId: string,
    nbProducts: number,
  ): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`http://donoma.ddns.net/api/stock/${productId}`),
      );

      const availableStock = response.data.quantity;
      console.log(`📦 Stock disponible pour ${productId}: ${availableStock}`);
      return availableStock >= nbProducts;
    } catch (error) {
      console.error(
        `❌ Erreur lors de la vérification du stock pour ${productId}`,
        error,
      );
      return false;
    }
  }

  async removeStock(productId: string, nbProducts: number): Promise<boolean> {
    console.log(
      `🚨 Suppression de ${nbProducts} unités du produit ${productId}`,
    );
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `http://donoma.ddns.net/api/stock/${productId}/movement`,
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
        `❌ Erreur lors de la suppression du stock pour ${productId}`,
        error,
      );
      return false;
    }
  }
}
