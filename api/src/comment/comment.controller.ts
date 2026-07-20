import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':orderId/comments')
  getComments(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.commentService.findCommentsByOrder(orderId);
  }

  @Post(':orderId/comments')
  addComment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { comment: string },
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.commentService.addComment({
      orderId,
      userId: req.user.id,
      text: body.comment ?? '',
    });
  }
}
