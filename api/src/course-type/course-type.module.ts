import { Module } from '@nestjs/common';
import { CourseTypeService } from './course-type.service';
import { CourseTypeController } from './course-type.controller';

@Module({
  controllers: [CourseTypeController],
  providers: [CourseTypeService],
  exports: [CourseTypeService],
})
export class CourseTypeModule {}
