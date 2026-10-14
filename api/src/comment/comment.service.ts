import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

type AddCommentParams = {
  orderId: number;
  userId: string;
  text: string;
};

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async addComment({ orderId, userId, text }: AddCommentParams) {
    return this.prisma.$transaction(async (tx) => {
      const claim = await tx.order.updateMany({
        where: { id: orderId, managerId: null },
        data: { managerId: userId },
      });
      if (claim.count === 0) {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          select: { managerId: true },
        });
        if (!order) throw new NotFoundException('Order not found');
        if (order.managerId !== userId) {
          throw new ForbiddenException(
            'You can only comment on orders without a manager or assigned to you',
          );
        }
      }

      await tx.order.updateMany({
        where: {
          id: orderId,
          managerId: userId,
          OR: [{ status: null }, { status: 'New' }],
        },
        data: { status: 'In work' },
      });

      return tx.comment.create({
        data: { orderId, userId, text },
        select: {
          id: true,
          orderId: true,
          userId: true,
          text: true,
          createdAt: true,
        },
      });
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
