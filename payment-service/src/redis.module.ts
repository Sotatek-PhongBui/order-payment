import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_PUBLISHER',
      useFactory: async () => {
        const client = createClient();
        client.on('error', (err) => {
          if (err instanceof Error) {
            console.error('Redis publisher Error:', err.message);
          } else {
            console.error('Redis publisher Error:', err);
          }
        });
        await client.connect();
        console.log('Connected to Redis');
        return client;
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: async () => {
        const client = createClient();
        client.on('error', (err) =>
          console.error('Redis Subscriber Error:', err),
        );
        await client.connect();
        console.log('Redis Subscriber Connected');
        return client;
      },
    },
  ],
  exports: ['REDIS_PUBLISHER', 'REDIS_SUBSCRIBER'],
})
export class RedisModule {}
