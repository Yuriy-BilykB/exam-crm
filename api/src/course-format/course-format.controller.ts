import { Controller, Get, UseGuards } from '@nestjs/common';
import { CourseFormatService } from './course-format.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('course-formats')
@UseGuards(JwtAuthGuard)
export class CourseFormatController {
  constructor(private readonly service: CourseFormatService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
