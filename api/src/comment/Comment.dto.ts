import { IsString, Matches } from 'class-validator';

export class AddCommentDto {
  @IsString()
  @Matches(/\S/, { message: 'Comment can`t be null' })
  comment!: string;
}
