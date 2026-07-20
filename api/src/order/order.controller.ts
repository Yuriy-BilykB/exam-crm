import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { OrderService } from './order.service';
import { UpdateOrderDto, OrderListQueryDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('export')
  async exportOrders(
    @Query() query: OrderListQueryDto,
    @Req() req: Request & { user: { id: string } },
    @Res() res: Response,
  ) {
    const buffer = await this.orderService.exportExcel(query, req.user.id);
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Get()
  getOrders(
    @Query() query: OrderListQueryDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.orderService.getOrders(query, req.user.id);
  }

  @Get(':id')
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrder(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.orderService.update(id, dto, req.user.id);
  }
}
