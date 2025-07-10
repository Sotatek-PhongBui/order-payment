import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_PUBLISHER',
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const client = createClient({ url: redisUrl });
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
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get<string>('REDIS_URL');
        const client = createClient({ url: redis });
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
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_PUBLISHER', 'REDIS_SUBSCRIBER'],
})
export class RedisModule {}
