import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { CreateUserDto, CreateManagerDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('User with this email already exists');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({ ...dto, password: hashed });
    return this.userRepository.save(user);
  }

  /** Create manager (inactive, no password until activation) */
  async createManager(dto: CreateManagerDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('User with this email already exists');
    const placeholderHash = await bcrypt.hash(Math.random().toString(36), 10);
    const user = this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: placeholderHash,
      role: UserRole.MANAGER,
      isActive: false,
    });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { id: 'DESC' } });
  }

  async findManagersPaginated(page: number, limit: number): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      where: { role: UserRole.MANAGER },
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, dto: UpdateUserDto): Promise<User | null> {
    if (dto.password) {
      (dto as Record<string, unknown>).password = await bcrypt.hash(dto.password, 10);
    }
    await this.userRepository.update(id, dto as Partial<User>);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  /** Exclude password from user for response */
  toSafeUser(user: User): Omit<User, 'password'> {
    const { password: _, ...rest } = user;
    return rest;
  }
}
