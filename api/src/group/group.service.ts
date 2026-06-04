import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly repo: Repository<Group>,
  ) {}

  async findAll(): Promise<Group[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async create(name: string): Promise<Group> {
    const existing = await this.repo.findOne({ where: { name } });
    if (existing) throw new ConflictException('Group with this name already exists');
    const group = this.repo.create({ name });
    return this.repo.save(group);
  }
}
