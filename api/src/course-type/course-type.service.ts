import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseType } from './course-type.entity';

@Injectable()
export class CourseTypeService {
  constructor(
    @InjectRepository(CourseType)
    private readonly repo: Repository<CourseType>,
  ) {}

  async findAll(): Promise<CourseType[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }
}
