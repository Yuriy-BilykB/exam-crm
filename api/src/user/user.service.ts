import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '../common/enums';
import type { User } from '../generated/prisma/client';
import {
  CreateUserDto,
  CreateManagerDto,
  UpdateUserDto,
  UserResponse,
} from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserResponse> {
    const user = await this.findByEmail(dto.email);
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });
  }

  async createManager(dto: CreateManagerDto): Promise<UserResponse> {
    const user = await this.findByEmail(dto.email);
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    return this.prisma.user.create({
      data: {
        ...dto,
        role: UserRole.MANAGER,
      },
    });
  }

  async findAll(): Promise<UserResponse[]> {
    return this.prisma.user.findMany({ orderBy: { id: 'desc' } });
  }

  async findOne(id: string): Promise<UserResponse | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      omit: { password: false },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  async touchLastLogin(id: string): Promise<UserResponse> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
