import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Trim } from '../../common/decorators/trim.decorator';
import {
  CourseValues,
  CourseFormatValues,
  CourseTypeValues,
  OrderStatusValues,
} from '../../common/enums';

export class OrderListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  @IsOptional()
  @IsIn([
    'id',
    'name',
    'surname',
    'email',
    'phone',
    'age',
    'course',
    'courseFormat',
    'courseType',
    'status',
    'manager',
    'group',
    'sum',
    'alreadyPaid',
    'createdAt',
  ])
  sortBy = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  my_orders = false;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(OrderStatusValues)
  status?: string;

  @IsOptional()
  @IsIn(CourseValues)
  course?: string;

  @IsOptional()
  @IsIn(CourseFormatValues)
  format?: string;

  @IsOptional()
  @IsIn(CourseTypeValues)
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  manager_id?: string;

  @IsOptional()
  @IsString()
  group_id?: string;
}

export class UpdateOrderDto {
  @Trim() @IsOptional() @IsString() name?: string | null;
  @Trim() @IsOptional() @IsString() surname?: string | null;
  @Trim() @IsOptional() @IsString() email?: string | null;
  @Trim() @IsOptional() @IsString() phone?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() age?: number | null;

  @IsOptional() @IsIn(CourseValues) course?: string | null;
  @IsOptional() @IsIn(CourseFormatValues) courseFormat?: string | null;
  @IsOptional() @IsIn(CourseTypeValues) courseType?: string | null;
  @IsOptional() @IsIn(OrderStatusValues) status?: string | null;

  @IsOptional() @IsString() groupId?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() sum?: number | null;
  @IsOptional() @Type(() => Number) @IsInt() alreadyPaid?: number | null;
  @Trim() @IsOptional() @IsString() utm?: string | null;
  @Trim() @IsOptional() @IsString() message?: string | null;
}
