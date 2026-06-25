import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @IsOptional()
  @IsIn([
    'id',
    'name',
    'surname',
    'email',
    'phone',
    'age',
    'course',
    'course_format',
    'course_type',
    'status',
    'manager',
    'group',
    'sum',
    'already_paid',
    'created_at',
  ])
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  my_orders?: boolean = false;

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
  @IsString()
  status_id?: string;

  @IsOptional()
  @IsString()
  course_id?: string;

  @IsOptional()
  @IsString()
  format_id?: string;

  @IsOptional()
  @IsString()
  type_id?: string;

  @IsOptional()
  @IsString()
  manager_id?: string;

  @IsOptional()
  @IsString()
  group_id?: string;
}

export class UpdateOrderDto {
  // Client fields
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() surname?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @Type(() => Number) @IsInt() age?: number;

  // Application fields. course/manager/group ids are real cuid strings;
  // status_id is a synthetic reference id (see common/reference.ts).
  @IsOptional() @IsString() course_id?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() status_id?: number;
  @IsOptional() @IsString() manager_id?: string | null;
  @IsOptional() @IsString() group_id?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() sum?: number;
  @IsOptional() @Type(() => Number) @IsInt() already_paid?: number;
  @IsOptional() @IsString() utm?: string;
  @IsOptional() @IsString() message?: string;
}
