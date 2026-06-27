import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactDto } from './dto/react.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller('posts/:postId')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('react')
  @UseGuards(AuthGuard)
  react(
    @Param('postId') postId: string,
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: ReactDto,
  ) {
    return this.reactionsService.react(postId, user.uid, dto);
  }

  @Get('my-reaction')
  @UseGuards(AuthGuard)
  getMyReaction(
    @Param('postId') postId: string,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.reactionsService.getUserReaction(postId, user.uid);
  }
}
