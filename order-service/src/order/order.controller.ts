import { Controller, Get, Body, Param, Post, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, QueryOrderDto } from './order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getOrders(@Query() query: QueryOrderDto) {
    console.log(query);
    return this.orderService.getOrders(query);
  }
  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }
  //create order
  @Post()
  createOrder(@Body() order: CreateOrderDto) {
    return this.orderService.createOrder(order);
  }
  //cancel order
  @Post(':id/cancel')
  cancelOrder(@Param() id: string) {
    return this.orderService.cancelOrder(id);
  }
  //check order status
  @Get(':id/status')
  checkOrderStatus(@Param() id: string) {
    return this.orderService.checkOrderStatus(id);
  }
}
