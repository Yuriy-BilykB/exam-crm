import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseFormat } from './course-format.entity';
import { CourseFormatService } from './course-format.service';
import { CourseFormatController } from './course-format.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseFormat])],
  controllers: [CourseFormatController],
  providers: [CourseFormatService],
  exports: [CourseFormatService],
})
export class CourseFormatModule {}
