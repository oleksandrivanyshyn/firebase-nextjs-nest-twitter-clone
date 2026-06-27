import { IsIn } from 'class-validator';

export class ReactDto {
  @IsIn(['like', 'dislike'])
  type: 'like' | 'dislike';
}
