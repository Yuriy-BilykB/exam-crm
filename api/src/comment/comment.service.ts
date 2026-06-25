import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApplicationStatus } from '../common/enums';
import type { Prisma } from '../generated/prisma/client';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async addComment(applicationId: string, userId: string, text: string) {
    const app = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundException('Order not found');
    if (app.managerId != null && app.managerId !== userId) {
      throw new ForbiddenException(
        'You can only comment on orders without a manager or assigned to you',
      );
    }

    // First touch by a manager: claim the order and move New -> In work.
    const data: Prisma.ApplicationUpdateInput = {};
    if (app.managerId == null) data.manager = { connect: { id: userId } };
    if (app.status === ApplicationStatus.New) data.status = ApplicationStatus.InWork;
    if (Object.keys(data).length) {
      await this.prisma.application.update({ where: { id: applicationId }, data });
    }

    const comment = await this.prisma.comment.create({
      data: { applicationId, userId, text },
    });
    return {
      id: comment.id,
      orderId: comment.applicationId,
      userId: comment.userId,
      comment: comment.text,
      createdAt: comment.createdAt,
    };
  }

  async findByOrder(applicationId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { applicationId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map((c) => ({
      id: c.id,
      orderId: c.applicationId,
      userId: c.userId,
      comment: c.text,
      createdAt: c.createdAt,
      user: c.user ? { id: c.user.id, name: c.user.name, email: c.user.email } : undefined,
    }));
  }
}
