import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from './status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly repo: Repository<Status>,
  ) {}

  async findAll(): Promise<Status[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findByName(name: string): Promise<Status | null> {
    return this.repo.findOne({ where: { name } });
  }
}
