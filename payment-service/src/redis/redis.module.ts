import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_PUBLISHER',
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get<string>('REDIS_URL');
        const client = createClient({ url: redis });
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
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get<string>('REDIS_URL');
        const client = createClient({ url: redis });
        client.on('error', (err) =>
          console.error('Redis Subscriber Error:', err),
        );
        await client.connect();
        console.log('Redis Subscriber Connected');
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_PUBLISHER', 'REDIS_SUBSCRIBER'],
})
export class RedisModule {}
