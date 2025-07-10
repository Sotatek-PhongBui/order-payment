import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Order } from '../entity/order.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateOrderDto, QueryOrderDto } from '../order/order.dto';
import { OrderStatus } from '../entity/orderStatus.enum';
import { RedisClientType } from 'redis';
import { OrderItem } from 'src/entity/orderItem.entity';
import { ConfigService } from '@nestjs/config';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { orderStateMachine } from './order.machine';
import { Actor, createActor } from 'xstate';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly orderRepository: Repository<Order>;
  private readonly orderItemRepository: Repository<OrderItem>;
  private readonly orderActorMap = new Map<
    string,
    Actor<typeof orderStateMachine>
  >();
  constructor(
    @Inject('REDIS_PUBLISHER')
    private readonly redisPublisher: RedisClientType,
    @Inject('REDIS_SUBSCRIBER')
    private readonly redisSubscriber: RedisClientType,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly gateway: WebsocketGateway,
  ) {
    this.orderRepository = this.dataSource.getRepository(Order);
    this.orderItemRepository = this.dataSource.getRepository(OrderItem);
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onModuleInit() {
    await this.redisSubscriber
      .subscribe(
        this.configService.get('PAYMENT_VERIFIED', 'payment.verified'),
        (message) => {
          this.logger.log(`Payment verified: ${message}`);
          interface PaymentVerifiedMessage {
            id: string;
            status: string;
          }
          const { id, status } = JSON.parse(message) as PaymentVerifiedMessage;
          this.updateOrderStatus(id, status).catch((err) => {
            this.logger.error(`Error updating order status: ${err}`);
          });
        },
      )
      .catch((err) => {
        this.logger.error(`Error subscribing to payment verified: ${err}`);
      });
  }

  async updateOrderStatus(id: string, event: string): Promise<void> {
    const actor = this.orderActorMap.get(id);
    if (!actor) {
      throw new NotFoundException(`Order with id ${id} not found or cancelled`);
    }
    actor.send({ type: event as 'confirmed' | 'cancelled' });
    const nextState = actor.getSnapshot().value as OrderStatus;
    await this.orderRepository.update(id, { status: nextState });
    this.logger.log(`Order ${id} status updated to ${nextState}`);
    this.gateway.notifyData();
    if (nextState === OrderStatus.CANCELLED) {
      actor.stop();
      this.orderActorMap.delete(id);
      return;
    }
    await this.delay(60000);
    actor.send({ type: 'deliveried' });
    await this.orderRepository.update(id, {
      status: actor.getSnapshot().value as OrderStatus,
    });
    this.logger.log(
      `Order ${id} status updated to ${actor.getSnapshot().value as OrderStatus}`,
    );
    this.gateway.notifyData();
    actor.stop();
    this.orderActorMap.delete(id);
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

    try {
      await this.orderItemRepository.insert(items);
    } catch (err) {
      throw new Error(`Error creating order items: ${err}`);
    }

    // create order actor for state machine
    const actor = createActor(orderStateMachine, {
      input: { id: newOrder.id, status: newOrder.status },
    });
    actor.start();
    this.orderActorMap.set(newOrder.id, actor);

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

  async checkOrderStatus(id: string): Promise<OrderStatus> {
    console.log('Order status checked', id);
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order.status;
  }
}
