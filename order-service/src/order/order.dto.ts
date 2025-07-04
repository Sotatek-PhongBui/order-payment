/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/entity/orderStatus.enum';

export class OrderItemDto {
  @IsUUID()
  productId: string;

  // @IsUUID()
  // orderId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'User Id is required.' })
  @IsString()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[] = []; // default empty array
}

export class QueryOrderDto {
  @IsOptional()
  @IsIn(['created', 'confirmed', 'cancelled', 'deliveried', 'all'])
  status?: OrderStatus | 'all';

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'sortOrder must be ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC';
}
