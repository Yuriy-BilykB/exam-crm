import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TokenService, AuthTokens } from '../token/token.service';
import { hashToken } from '../token/token-hash';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '../common/enums';
import { LoginDto, SetPasswordDto } from './dto/auth.dto';
import { UserResponse } from 'src/user/dto/user.dto';

export type LoginResult = AuthTokens & {
  user: UserResponse;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<(UserResponse & { password: string }) | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }
    if (!user.password) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    if (user.isBanned) {
      throw new UnauthorizedException('User is banned');
    }
    if (!user.isActive && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('User is not activated');
    }
    return { ...user, password: user.password };
  }

  async login({ email, password }: LoginDto): Promise<LoginResult> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const updatedUser = await this.userService.touchLastLogin(user.id);
    const tokens = await this.tokenService.createSession(
      updatedUser,
      user.password,
    );
    return { ...tokens, user: updatedUser };
  }

  async refreshTokens(refreshToken: string | undefined): Promise<LoginResult> {
    return this.tokenService.rotateSession(refreshToken);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    await this.tokenService.revokeSession(refreshToken);
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('Session no longer valid');
    return user;
  }

  async setPassword({
    token,
    password,
  }: SetPasswordDto): Promise<{ message: string }> {
    const { tokenType, userId } = this.tokenService.verifyActionToken(token);
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const { count } = await tx.activationToken.deleteMany({
        where: {
          token: hashToken(token),
          type: tokenType,
          userId,
          expiresAt: { gt: new Date() },
        },
      });
      if (count !== 1) {
        throw new UnauthorizedException('Token expired or already used');
      }
      await tx.session.deleteMany({ where: { userId } });
      await tx.activationToken.deleteMany({ where: { userId } });
      await tx.user.update({
        where: { id: userId },
        data: {
          password: passwordHash,
          ...(tokenType === 'activate' && { isActive: true }),
        },
      });
    });
    return {
      message:
        tokenType === 'activate' ? 'Account activated' : 'Password updated',
    };
  }
}
