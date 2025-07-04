import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class AppService {
  constructor(
    @Inject('REDIS_PUBLISHER') private readonly redisPublisher: RedisClientType,
    @Inject('REDIS_SUBSCRIBER')
    private readonly redisSubscriber: RedisClientType,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async onModuleInit() {
    await this.redisSubscriber.subscribe('order.created', async (message) => {
      console.log(
        `order created at ${new Date().toISOString()}`,
        JSON.parse(message),
      );
      interface Order {
        id: string;
        status: string;
      }
      const order = JSON.parse(message) as Order;
      await this.delay(Math.random() * 60000);
      const result = Math.random() > 0.5 ? 'confirmed' : 'declined';
      order.status = result;
      console.log(`payment verified at ${new Date().toISOString()}}`, order);
      await this.redisPublisher.publish(
        'payment.verified',
        JSON.stringify(order),
      );
    });
  }
}
