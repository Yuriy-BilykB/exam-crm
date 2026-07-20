import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TokenService, AuthTokens } from '../token/token.service';
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
  ) {}

  async validateUser(email, password): Promise<UserResponse | null> {
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
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  async login({ email, password }: LoginDto): Promise<LoginResult> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const updatedUser = await this.userService.touchLastLogin(user.id);
    const tokens = this.tokenService.generateAuthTokens(updatedUser);
    return { ...tokens, user: updatedUser };
  }

  async refreshTokens(refreshToken: string | undefined): Promise<LoginResult> {
    const { userId } = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userService.findOne(userId);
    if (!user || user.isBanned) {
      throw new UnauthorizedException('User no longer allowed');
    }
    const tokens = this.tokenService.generateAuthTokens(user);
    return { ...tokens, user };
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
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.userService.update(userId, {
      password,
      ...(tokenType === 'activate' && { isActive: true }),
    });
    return {
      message:
        tokenType === 'activate' ? 'Account activated' : 'Password updated',
    };
  }
}
