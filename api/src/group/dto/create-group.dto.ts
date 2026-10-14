import { IsString, Matches, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator';

export class CreateGroupDto {
  @Trim()
  @IsString()
  @Matches(/\S/, { message: 'name must not be empty' })
  @MaxLength(100)
  name: string;
}
