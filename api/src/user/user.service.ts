import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '../common/enums';
import type { User } from '../generated/prisma/client';
import { CreateUserDto, CreateManagerDto, UpdateUserDto } from './dto/user.dto';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
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

  /** Create manager (inactive, no usable password until activation) */
  async createManager(dto: CreateManagerDto): Promise<User> {
    const user = await this.findByEmail(dto.email);
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        surname: dto.surname,
        role: UserRole.MANAGER,
        isActive: false,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { id: 'desc' } });
  }

  async findManagersPaginated(
    page: number,
    limit: number,
  ): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { role: UserRole.MANAGER },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where: { role: UserRole.MANAGER } }),
    ]);
    return { data, total };
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  /** Exclude password from a user for responses */
  toSafeUser(user: User): SafeUser {
    const { password: _password, ...rest } = user;
    return rest;
  }
}
