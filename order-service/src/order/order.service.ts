import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Order } from '../entity/order.entity';
import { Repository, UpdateResult, DataSource } from 'typeorm';
import { CreateOrderDto, QueryOrderDto } from '../order/order.dto';
import { OrderStatus } from '../entity/orderStatus.enum';
import { RedisClientType } from 'redis';
import { OrderItem } from 'src/entity/orderItem.entity';
import { Production } from 'src/entity/production.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly orderRepository: Repository<Order>;
  private readonly productRepository: Repository<Production>;
  private readonly orderItemRepository: Repository<OrderItem>;
  constructor(
    @Inject('REDIS_PUBLISHER')
    private readonly redisPublisher: RedisClientType,
    @Inject('REDIS_SUBSCRIBER')
    private readonly redisSubscriber: RedisClientType,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
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
      this.configService.get('PAYMENT_VERIFIED', 'payment.verified'),
      async (message) => {
        console.log(`Payment verified at ${new Date().toISOString()}`, message);
        interface PaymentVerifiedMessage {
          id: string;
          status: string;
        }
        const { id, status } = JSON.parse(message) as PaymentVerifiedMessage;
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
      cancelled: number;
      deliveried: number;
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

    const [cancel, deliveried] = await Promise.all([
      this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } }),
      this.orderRepository.count({ where: { status: OrderStatus.DELIVERIED } }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(query.page),
        limit: take,
        totalPages: Math.ceil(total / take),
        cancelled: cancel,
        deliveried: deliveried,
      },
    };
  }

  async getOrderById(id: string): Promise<Order> {
    console.log('Order by id', id);
    const order = await this.orderRepository.findOne({
      where: { id: id },
      relations: ['items', 'items.production'],
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async createOrder(order: CreateOrderDto): Promise<Order> {
    console.log('Order created', order);
    const newOrder = await this.orderRepository.save({ userId: order.userId });

    //add order items
    const items: OrderItem[] = [];
    for (const item of order.items) {
      items.push({
        order: newOrder,
        production: { id: item.productId },
        quantity: item.quantity,
      } as OrderItem);
    }
    await this.orderItemRepository.save(items);

    this.redisPublisher
      .publish(
        this.configService.get('ORDER_CREATED', 'order.created'),
        JSON.stringify({ id: newOrder.id, status: newOrder.status }),
      )
      .catch((err) => {
        this.logger.error(`Error publishing order created: ${err}`);
      });
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
