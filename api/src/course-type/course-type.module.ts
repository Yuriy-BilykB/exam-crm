import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseType } from './course-type.entity';
import { CourseTypeService } from './course-type.service';
import { CourseTypeController } from './course-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseType])],
  controllers: [CourseTypeController],
  providers: [CourseTypeService],
  exports: [CourseTypeService],
})
export class CourseTypeModule {}
