import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { Prisma } from '../generated/prisma/client';

type AddCommentParams = {
  orderId: number;
  userId: string;
  text: string;
};

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async addComment({ orderId, userId, text }: AddCommentParams) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.managerId != null && order.managerId !== userId) {
      throw new ForbiddenException(
        'You can only comment on orders without a manager or assigned to you',
      );
    }

    const data: Prisma.OrderUpdateInput = {};
    if (order.managerId == null) data.manager = { connect: { id: userId } };
    if (order.status == null || order.status === 'New') data.status = 'In work';
    if (Object.keys(data).length) {
      await this.prisma.order.update({ where: { id: orderId }, data });
    }

    return this.prisma.comment.create({
      data: { orderId, userId, text },
      select: {
        id: true,
        orderId: true,
        userId: true,
        text: true,
        createdAt: true,
      },
    });
  }

  async findCommentsByOrder(orderId: number) {
    return this.prisma.comment.findMany({
      where: { orderId },
      select: {
        id: true,
        orderId: true,
        userId: true,
        text: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
