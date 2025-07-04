import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '../entity/order.entity';
import { Repository, UpdateResult, DataSource } from 'typeorm';
import { CreateOrderDto, QueryOrderDto } from '../order/order.dto';
import { OrderStatus } from '../entity/orderStatus.enum';
import { RedisClientType } from 'redis';
import { OrderItem } from 'src/entity/orderItem.entity';
import { Production } from 'src/entity/production.entity';

@Injectable()
export class OrderService {
  private readonly orderRepository: Repository<Order>;
  private readonly productRepository: Repository<Production>;
  private readonly orderItemRepository: Repository<OrderItem>;
  constructor(
    @Inject('REDIS_PUBLISHER')
    private readonly redisPublisher: RedisClientType,
    @Inject('REDIS_SUBSCRIBER')
    private readonly redisSubscriber: RedisClientType,
    private readonly dataSource: DataSource,
  ) {
    this.orderRepository = this.dataSource.getRepository(Order);
    this.productRepository = this.dataSource.getRepository(Production);
    this.orderItemRepository = this.dataSource.getRepository(OrderItem);
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onModuleInit() {
    await this.redisSubscriber.subscribe(
      'payment.verified',
      async (message) => {
        console.log(`Payment verified at ${new Date().toISOString()}`, message);
        interface Order {
          id: string;
          status: string;
        }
        const { id, status } = JSON.parse(message) as Order;
        const order = await this.orderRepository.findOneBy({ id });
        if (!order) {
          throw new NotFoundException(`Order with id ${id} not found`);
        }
        if (order.status === OrderStatus.CANCELLED) {
          return;
        }
        if (status === 'confirmed') {
          await this.orderRepository.update(id, {
            status: OrderStatus.CONFIRMED,
          });
          await this.deliveryOrder(id);
        } else {
          await this.orderRepository.update(id, {
            status: OrderStatus.CANCELLED,
          });
        }
      },
    );
  }
  async getOrders(query: QueryOrderDto): Promise<{
    data: Order[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const take: number = query.limit ?? 10;
    const skip: number = ((query.page ?? 1) - 1) * take;

    const where: Partial<{ status: OrderStatus }> = {};
    if (query.status === 'all') {
      query.status = undefined;
    }
    if (query.status) {
      where.status = query.status;
    }

    const allowedSortFields = ['createdAt', 'status', 'userId'];
    query.sortBy = query.sortBy ?? 'createdAt';
    const orderField = allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      take,
      skip,
      order: {
        [orderField]: query.sortOrder,
      },
    });

    return {
      data,
      meta: {
        total,
        page: Number(query.page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
  async createOrder(order: CreateOrderDto): Promise<Order> {
    console.log('Order created', order);
    const newOrder = this.orderRepository.create({
      userId: order.userId,
      items: [], // hoặc không gán items
    });
    await this.orderRepository.save(newOrder);

    const items: OrderItem[] = [];
    for (const item of order.items) {
      const product = await this.productRepository.findOneByOrFail({
        id: item.productId,
      });
      items.push({
        order: newOrder,
        production: product,
        quantity: item.quantity,
      } as OrderItem);
    }
    await this.orderItemRepository.save(items);
    newOrder.items = items;
    // const newOrder: Order = await this.orderRepository.save({
    //   userId: order.userId,
    //   items: order.items.map((item) => ({
    //     // order: { id: newOrder.id },
    //     production: { id: item.productId },
    //     quantity: item.quantity,
    //   })),
    // });

    await this.redisPublisher.publish(
      'order.created',
      JSON.stringify({ id: newOrder.id, status: newOrder.status }),
    );
    return newOrder;
  }

  async cancelOrder(id: string): Promise<UpdateResult> {
    console.log('Order cancelled', id);
    return await this.orderRepository.update(id, {
      status: OrderStatus.CANCELLED,
    });
  }

  async checkOrderStatus(id: string): Promise<OrderStatus> {
    console.log('Order status checked', id);
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order.status;
  }

  async deliveryOrder(id: string): Promise<UpdateResult> {
    await this.delay(60000);
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    if (order.status === OrderStatus.CANCELLED) {
      return { affected: 0 } as UpdateResult;
    }
    console.log(`Order delivered at ${new Date().toISOString()}`, id);
    return await this.orderRepository.update(id, {
      status: OrderStatus.DELIVERIED,
    });
  }
}
