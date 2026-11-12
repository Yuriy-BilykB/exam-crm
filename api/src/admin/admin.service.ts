import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { PrismaService } from '../database/prisma.service';
import { CreateManagerDto } from '../user/dto/user.dto';
import { OrderStatusValues, UserRole } from '../common/enums';
import { AppConfigService } from '../config/app-config.service';
import type { Prisma } from '../generated/prisma/client';
import { ManagerStatsResponse, ResponseDtoManagers } from './dto/response.dto';

type ActionLinkResponse = { link: string };

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async createManager(dto: CreateManagerDto) {
    return await this.userService.createManager(dto);
  }

  async getManagers(page: number, limit: number): Promise<ResponseDtoManagers> {
    const where: Prisma.UserWhereInput = {
      role: { in: [UserRole.MANAGER, UserRole.ADMIN] },
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const managerIds = data.map(({ id }) => id);
    const grouped = managerIds.length
      ? await this.prisma.order.groupBy({
          by: ['managerId', 'status'],
          where: { managerId: { in: managerIds } },
          _count: { _all: true },
        })
      : [];

    const statsByManager = new Map<string, Map<string, number>>(
      managerIds.map((id) => [
        id,
        new Map(OrderStatusValues.map((status) => [status, 0])),
      ]),
    );
    for (const group of grouped) {
      if (!group.managerId) continue;
      const counts = statsByManager.get(group.managerId);
      if (!counts) continue;
      const statusName = group.status ?? 'New';
      counts.set(statusName, (counts.get(statusName) ?? 0) + group._count._all);
    }

    return {
      data: data.map((manager) => ({
        ...manager,
        stats: OrderStatusValues.map((statusName) => ({
          statusName,
          count: statsByManager.get(manager.id)?.get(statusName) ?? 0,
        })),
      })),
      total,
    };
  }

  async getActivationLink(
    userId: string,
    tokenType: 'activate' | 'recovery',
  ): Promise<string> {
    const baseUrl = this.config.frontendUrl;
    const token = await this.tokenService.generateActionToken(
      userId,
      tokenType,
    );
    return `${baseUrl.replace(/\/$/, '')}/${tokenType}/${token}`;
  }

  async activateManager(userId: string): Promise<ActionLinkResponse> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.MANAGER) {
      throw new NotFoundException('Not a manager');
    }
    const link = await this.getActivationLink(userId, 'activate');
    return { link };
  }

  async recoveryPassword(userId: string): Promise<ActionLinkResponse> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    const link = await this.getActivationLink(userId, 'recovery');
    return { link };
  }

  async banManager(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new ForbiddenException('You can`t block yourself');
    }
    return await this.userService.update(userId, { isBanned: true });
  }

  async unbanManager(userId: string) {
    return await this.userService.update(userId, { isBanned: false });
  }

  async getManagerStatsByStatus(): Promise<ManagerStatsResponse[]> {
    const grouped = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const counts = new Map<string, number>(
      OrderStatusValues.map((status) => [status, 0]),
    );
    for (const group of grouped) {
      const statusName = group.status ?? 'New';
      counts.set(statusName, (counts.get(statusName) ?? 0) + group._count._all);
    }
    return OrderStatusValues.map((statusName) => ({
      statusName,
      count: counts.get(statusName) ?? 0,
    }));
  }
}
