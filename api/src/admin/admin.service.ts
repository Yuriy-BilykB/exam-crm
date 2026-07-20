import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { PrismaService } from '../database/prisma.service';
// Email sending temporarily disabled.
// import { MailService } from '../mail/mail.service';
import { CreateManagerDto, UserResponse } from '../user/dto/user.dto';
import { UserRole } from '../common/enums';
import { AppConfigService } from '../config/app-config.service';
import type { Prisma } from '../generated/prisma/client';

type ActivateManagerResponse = { link: string; emailSent: boolean };

type ManagerStatsResponse = { statusName: string; count: number };

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    // Email sending temporarily disabled.
    // private readonly mailService: MailService,
  ) {}

  async createManager(dto: CreateManagerDto) {
    return await this.userService.createManager(dto);
  }

  async getManagers(
    page: number,
    limit: number,
  ): Promise<{ data: UserResponse[]; total: number }> {
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

  getActivationLink(
    userId: string,
    tokenType: 'activate' | 'recovery',
  ): string {
    const baseUrl = this.config.frontendUrl;
    const token = this.tokenService.generateActionToken(userId, tokenType);
    return `${baseUrl.replace(/\/$/, '')}/${tokenType}/${token}`;
  }

  async activateManager(userId: string): Promise<ActivateManagerResponse> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.MANAGER) {
      throw new NotFoundException('Not a manager');
    }
    const link = this.getActivationLink(userId, 'activate');
    // Email sending temporarily disabled — the link is copied to clipboard on the client.
    // const emailSent = await this.mailService.sendActionLink(
    //   user.email,
    //   link,
    //   'activate',
    // );
    const emailSent = false;
    return { link, emailSent };
  }

  async recoveryPassword(userId: string): Promise<ActivateManagerResponse> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    const link = this.getActivationLink(userId, 'recovery');
    // Email sending temporarily disabled — the link is copied to clipboard on the client.
    // const emailSent = await this.mailService.sendActionLink(
    //   user.email,
    //   link,
    //   'recovery',
    // );
    const emailSent = false;
    return { link, emailSent };
  }

  async banManager(userId: string) {
    return await this.userService.update(userId, { isBanned: true });
  }

  async unbanManager(userId: string) {
    return await this.userService.update(userId, { isBanned: false });
  }

  private async managerStatsByStatus(
    where?: Prisma.OrderWhereInput,
  ): Promise<ManagerStatsResponse[]> {
    const grouped = await this.prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });
    return grouped.map((group) => ({
      statusName: group.status ?? 'No status',
      count: group._count._all,
    }));
  }

  getManagerStatsByStatus() {
    return this.managerStatsByStatus();
  }

  getManagerStats(managerId: string) {
    return this.managerStatsByStatus({ managerId });
  }
}
