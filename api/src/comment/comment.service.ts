import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { OrderService } from '../order/order.service';
import { StatusService } from '../status/status.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly orderService: OrderService,
    private readonly statusService: StatusService,
  ) {}

  async addComment(orderId: number, userId: number, commentText: string): Promise<Comment> {
    const order = await this.orderService.findOne(orderId);
    if (order.managerId != null && order.managerId !== userId) {
      throw new ForbiddenException('You can only comment on orders without manager or assigned to you');
    }
    const statusInWork = await this.statusService.findByName('In work');
    const statusNew = await this.statusService.findByName('New');
    const shouldSetInWork =
      statusInWork &&
      (order.statusId == null || order.statusId === statusNew?.id);
    if (shouldSetInWork && statusInWork) {
      await this.orderService.update(orderId, { status_id: statusInWork.id, manager_id: userId }, userId);
    } else if (!order.managerId) {
      await this.orderService.update(orderId, { manager_id: userId }, userId);
    }
    const comment = this.commentRepository.create({
      orderId,
      userId,
      comment: commentText,
    });
    return this.commentRepository.save(comment);
  }

  async findByOrder(orderId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { orderId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}
