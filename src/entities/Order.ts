import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryColumn()
  orderId: string;

  @Column()
  nbProducts: number;
}
