import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: DecodedIdToken, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.uid, dto);
  }

  @Get()
  findAll(
    @Query('limit') limit = '10',
    @Query('startAfter') startAfter?: string,
    @Query('q') q?: string,
    @Query('sort') sort?: 'top' | 'new',
    @Query('userId') userId?: string,
  ) {
    const parsedLimit = Math.min(Math.max(1, Number(limit) || 10), 50);
    return this.postsService.findAll(
      parsedLimit,
      startAfter,
      q,
      sort === 'new' ? 'new' : 'top',
      userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.uid, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: DecodedIdToken) {
    return this.postsService.remove(id, user.uid);
  }
}
