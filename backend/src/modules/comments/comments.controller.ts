import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard, EmailVerifiedGuard)
  create(
    @Param('postId') postId: string,
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, user.uid, dto);
  }

  @Get()
  findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Put(':commentId')
  @UseGuards(AuthGuard)
  update(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(commentId, postId, user.uid, dto);
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  remove(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.commentsService.remove(commentId, postId, user.uid);
  }
}
