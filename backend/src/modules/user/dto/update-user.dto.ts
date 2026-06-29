import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsString() @MaxLength(100) surname?: string;
  @IsOptional()
  @ValidateIf((o: UpdateUserDto) => o.photoURL !== null)
  @IsUrl()
  photoURL?: string | null;
}
