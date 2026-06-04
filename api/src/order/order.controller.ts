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
import type { Response } from 'express';
import { OrderService } from './order.service';
import { UpdateOrderDto, OrderListQueryDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('export')
  async export(
    @Query() query: OrderListQueryDto,
    @Req() req: Request & { user: { id: number } },
    @Res() res: Response,
  ) {
    const buffer = await this.orderService.exportExcel(query, req.user.id);
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }

  @Get()
  async findAll(@Query() query: OrderListQueryDto, @Req() req: Request & { user: { id: number } }) {
    return this.orderService.findAll(query, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.orderService.update(id, dto, req.user.id);
  }
}
