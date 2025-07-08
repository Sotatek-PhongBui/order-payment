import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseconfig } from './config/database.config';
import { validate } from './config/env.validation';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { ExceptionFilter } from './exception-filter/exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseconfig,
    }),
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: TransformInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: ExceptionFilter,
    },
  ],
})
export class AppModule {}
