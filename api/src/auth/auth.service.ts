import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService, SafeUser } from '../user/user.service';
import { TokenService, AuthTokens } from '../token/token.service';
import { UserRole } from '../common/enums';
import { LoginDto, SetPasswordDto } from './dto/auth.dto';

export type LoginResult = AuthTokens & {
  user: SafeUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email, password): Promise<SafeUser | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }
    if (user.isBanned) {
      throw new UnauthorizedException('User is banned');
    }
    if (!user.isActive && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('User is not activated');
    }
    if (!user.password) {
      // account has no password set yet (invited, not activated)
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return this.userService.toSafeUser(user);
  }

  async login({ email, password }: LoginDto): Promise<LoginResult> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokens = this.tokenService.generateAuthTokens(user);
    return { ...tokens, user };
  }

  /** Verify a refresh token (from cookie) and issue a fresh token pair */
  async refreshTokens(refreshToken: string | undefined): Promise<LoginResult> {
    const { userId } = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userService.findOne(userId);
    if (!user || user.isBanned) {
      throw new UnauthorizedException('User no longer allowed');
    }
    const tokens = this.tokenService.generateAuthTokens(user);
    return { ...tokens, user };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('Session no longer valid');
    return user;
  }

  /** Set password from activate/recovery token */
  async setPassword({
    token,
    password: newPassword,
  }: SetPasswordDto): Promise<{ message: string }> {
    const { tokenType, userId } = this.tokenService.verifyActionToken(token);
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.userService.update(userId, {
      password: newPassword,
      ...(tokenType === 'activate' ? { isActive: true } : {}),
    });
    return {
      message:
        tokenType === 'activate' ? 'Account activated' : 'Password updated',
    };
  }
}
