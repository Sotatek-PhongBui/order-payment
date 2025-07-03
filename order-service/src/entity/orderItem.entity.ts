import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Production } from './production.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;
  @ManyToOne(() => Production, (product) => product.items, {
    onDelete: 'CASCADE',
  })
  production: Production;
  @Column({ type: 'int' })
  quantity: number;
}
