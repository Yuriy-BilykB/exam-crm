import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseFormat } from './course-format.entity';

@Injectable()
export class CourseFormatService {
  constructor(
    @InjectRepository(CourseFormat)
    private readonly repo: Repository<CourseFormat>,
  ) {}

  async findAll(): Promise<CourseFormat[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }
}
