import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateManagerDto } from '../user/dto/user.dto';
import { UserRole } from '../common/enums';
import { statusRef } from '../common/reference';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async createManager(dto: CreateManagerDto) {
    const user = await this.userService.createManager(dto);
    return this.userService.toSafeUser(user);
  }

  async getManagersPaginated(page: number, limit: number) {
    const { data, total } = await this.userService.findManagersPaginated(
      page,
      limit,
    );
    return {
      data: data.map((u) => this.userService.toSafeUser(u)),
      total,
    };
  }

  getActivationLink(
    userId: string,
    tokenType: 'activate' | 'recovery',
  ): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const token = this.tokenService.generateActionToken(userId, tokenType);
    return `${baseUrl.replace(/\/$/, '')}/${tokenType}/${token}`;
  }

  async activateManager(
    userId: string,
  ): Promise<{ link: string; emailSent: boolean }> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.MANAGER) {
      throw new NotFoundException('Not a manager');
    }
    const link = this.getActivationLink(userId, 'activate');
    const emailSent = await this.mailService.sendActionLink(
      user.email,
      link,
      'activate',
    );
    return { link, emailSent };
  }

  async recoveryPassword(
    userId: string,
  ): Promise<{ link: string; emailSent: boolean }> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    const link = this.getActivationLink(userId, 'recovery');
    const emailSent = await this.mailService.sendActionLink(
      user.email,
      link,
      'recovery',
    );
    return { link, emailSent };
  }

  async banUser(userId: string) {
    const user = await this.userService.update(userId, { isBanned: true });
    return user ? this.userService.toSafeUser(user) : null;
  }

  async unbanUser(userId: string) {
    const user = await this.userService.update(userId, { isBanned: false });
    return user ? this.userService.toSafeUser(user) : null;
  }

  /** Stats: count all applications grouped by status */
  async getStatsByStatus(): Promise<{ statusName: string; count: number }[]> {
    const grouped = await this.prisma.application.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return grouped.map((g) => ({
      statusName: statusRef(g.status)?.name ?? 'No status',
      count: g._count._all,
    }));
  }

  /** Stats for one manager: applications count by status */
  async getManagerStats(
    managerId: string,
  ): Promise<{ statusName: string; count: number }[]> {
    const grouped = await this.prisma.application.groupBy({
      by: ['status'],
      where: { managerId },
      _count: { _all: true },
    });
    return grouped.map((g) => ({
      statusName: statusRef(g.status)?.name ?? 'No status',
      count: g._count._all,
    }));
  }
}
