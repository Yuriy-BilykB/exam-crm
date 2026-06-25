import { Module } from '@nestjs/common';
import { CourseFormatService } from './course-format.service';
import { CourseFormatController } from './course-format.controller';

@Module({
  controllers: [CourseFormatController],
  providers: [CourseFormatService],
  exports: [CourseFormatService],
})
export class CourseFormatModule {}
