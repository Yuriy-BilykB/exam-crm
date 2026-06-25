import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':orderId/comments')
  getComments(@Param('orderId') orderId: string) {
    return this.commentService.findByOrder(orderId);
  }

  @Post(':orderId/comments')
  addComment(
    @Param('orderId') orderId: string,
    @Body() body: { comment: string },
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.commentService.addComment(orderId, req.user.id, body.comment ?? '');
  }
}
