import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PostsService } from '../posts/posts.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postsService: PostsService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: DecodedIdToken) {
    return this.userService.getProfile(user.uid);
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.userService.getProfile(id);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  updateProfile(
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(user.uid, dto);
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  deleteAccount(@CurrentUser() user: DecodedIdToken) {
    return this.userService.deleteAccount(user.uid);
  }

  @Get(':id/posts')
  getUserPosts(
    @Param('id') id: string,
    @Query('limit') limit = '20',
    @Query('startAfter') startAfter?: string,
  ) {
    return this.postsService.findByUser(id, Number(limit), startAfter);
  }
}
