import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  text: string;
}
