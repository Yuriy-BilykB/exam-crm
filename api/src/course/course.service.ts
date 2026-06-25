import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { Course } from '../generated/prisma/client';

// Frontend expects `{ id, code }`; we also expose name/type/format for richer UIs.
function toDto(c: Course) {
  return { id: c.id, code: c.name, name: c.name, type: c.type, format: c.format };
}

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const courses = await this.prisma.course.findMany({ orderBy: { id: 'asc' } });
    return courses.map(toDto);
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    return course ? toDto(course) : null;
  }
}
