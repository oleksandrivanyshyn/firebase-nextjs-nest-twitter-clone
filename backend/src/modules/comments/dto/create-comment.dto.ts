import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  text: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}
