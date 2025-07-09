import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderItem } from './orderItem.entity';

@Entity()
export class Production {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.production, {
    cascade: true,
  })
  items: OrderItem[];
}
