import { Controller, Get, UseGuards } from '@nestjs/common';
import { CourseTypeService } from './course-type.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('course-types')
@UseGuards(JwtAuthGuard)
export class CourseTypeController {
  constructor(private readonly service: CourseTypeService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
