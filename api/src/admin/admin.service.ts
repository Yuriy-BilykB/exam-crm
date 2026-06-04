import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';
import { CreateManagerDto } from '../user/dto/user.dto';
import { UserRole } from '../user/user.entity';

const DEFAULT_ACTIVATION_BASE_URL = 'http://localhost:3001';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createManager(dto: CreateManagerDto) {
    const user = await this.userService.createManager(dto);
    return this.userService.toSafeUser(user);
  }

  async getManagersPaginated(page: number, limit: number) {
    const { data, total } = await this.userService.findManagersPaginated(page, limit);
    return {
      data: data.map((u) => this.userService.toSafeUser(u)),
      total,
    };
  }

  getActivationLink(userId: number, tokenType: 'activate' | 'recovery'): string {
    const baseUrl = process.env.FRONTEND_URL || process.env.ACTIVATION_BASE_URL || DEFAULT_ACTIVATION_BASE_URL;
    const token = this.authService.generateActionToken(userId, tokenType);
    return `${baseUrl.replace(/\/$/, '')}/${tokenType}/${token}`;
  }

  async activateManager(userId: number): Promise<{ link: string }> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== UserRole.MANAGER) throw new NotFoundException('Not a manager');
    const link = this.getActivationLink(userId, 'activate');
    return { link };
  }

  async recoveryPassword(userId: number): Promise<{ link: string }> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    const link = this.getActivationLink(userId, 'recovery');
    return { link };
  }

  async banUser(userId: number) {
    const user = await this.userService.update(userId, { isBanned: true });
    return user ? this.userService.toSafeUser(user) : null;
  }

  async unbanUser(userId: number) {
    const user = await this.userService.update(userId, { isBanned: false });
    return user ? this.userService.toSafeUser(user) : null;
  }

  /** Stats: count orders by status (all orders) */
  async getStatsByStatus(): Promise<{ statusName: string; count: number }[]> {
    const raw = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.status', 'status')
      .select('status.name', 'statusName')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('status.id')
      .addGroupBy('status.name')
      .getRawMany();
    return raw.map((r) => ({ statusName: r.statusName ?? 'No status', count: Number(r.count) }));
  }

  /** Stats for one manager: orders count by status */
  async getManagerStats(managerId: number): Promise<{ statusName: string; count: number }[]> {
    const raw = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.status', 'status')
      .where('order.manager_id = :managerId', { managerId })
      .select('status.name', 'statusName')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('status.id')
      .addGroupBy('status.name')
      .getRawMany();
    return raw.map((r) => ({ statusName: r.statusName ?? 'No status', count: Number(r.count) }));
  }
}
