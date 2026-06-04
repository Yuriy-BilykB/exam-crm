import { Controller, Get, Post, Param, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':orderId/comments')
  getComments(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.commentService.findByOrder(orderId);
  }

  @Post(':orderId/comments')
  addComment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { comment: string },
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.commentService.addComment(orderId, req.user.id, body.comment ?? '');
  }
}
