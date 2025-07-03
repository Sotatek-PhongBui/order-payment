import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_PUBLISHER',
      useFactory: async () => {
        const client = createClient();
        client.on('error', (err: unknown) => {
          if (err instanceof Error) {
            console.error('Redis Client Error:', err.message);
          } else {
            console.error('Redis Client Error:', err);
          }
        });
        await client.connect();
        return client;
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: async () => {
        const client = createClient();
        client.on('error', (err: unknown) => {
          if (err instanceof Error) {
            console.error('Redis Client Error:', err.message);
          } else {
            console.error('Redis Client Error:', err);
          }
        });
        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS_PUBLISHER', 'REDIS_SUBSCRIBER'],
})
export class RedisModule {}
