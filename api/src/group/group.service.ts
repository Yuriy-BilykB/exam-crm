import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { Group } from '../generated/prisma/client';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Group[]> {
    return this.prisma.group.findMany({ orderBy: { name: 'asc' } });
  }

  async create(name: string): Promise<Group> {
    const existing = await this.prisma.group.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictException('Group with this name already exists');
    }
    return this.prisma.group.create({ data: { name } });
  }
}
