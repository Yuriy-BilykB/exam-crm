import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User, UserRole } from '../user/user.entity';
import { LoginDto } from './dto/auth.dto';

export type TokenType = 'activate' | 'recovery';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string): Promise<Omit<User, 'password'> | null> {
    const trimmedEmail = email?.trim();
    const trimmedPassword = plainPassword?.trim();
    console.log(trimmedEmail, trimmedPassword);
    if (!trimmedEmail || !trimmedPassword) return null;
    const user = await this.userService.findByEmail(trimmedEmail);
    if (!user || !user.password) return null;
    if (user.isBanned) throw new UnauthorizedException('User is banned');
    if (!user.isActive && user.role !== UserRole.ADMIN) throw new UnauthorizedException('User is not activated');
    const ok = await bcrypt.compare(trimmedPassword, user.password);
    if (!ok) return null;
    return this.userService.toSafeUser(user);
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);
    return { access_token, user };
  }

  async getProfile(userId: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.userService.findOne(userId);
    return user ? this.userService.toSafeUser(user) : null;
  }

  /** Generate short-lived token for activate or recovery (30 min) */
  generateActionToken(userId: number, tokenType: TokenType): string {
    return this.jwtService.sign(
      { token_type: tokenType, user_id: userId },
      { expiresIn: '30m' },
    );
  }

  /** Verify action token and return payload */
  verifyActionToken(token: string): { token_type: TokenType; user_id: number } {
    try {
      const payload = this.jwtService.verify<{ token_type: TokenType; user_id: number }>(token);
      if (!payload.token_type || !payload.user_id) throw new BadRequestException('Invalid token');
      if (payload.token_type !== 'activate' && payload.token_type !== 'recovery') {
        throw new BadRequestException('Invalid token type');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Token expired or invalid');
    }
  }

  /** Set password from activate/recovery token */
  async setPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { token_type, user_id } = this.verifyActionToken(token);
    const user = await this.userService.findOne(user_id);
    if (!user) throw new BadRequestException('User not found');
    await this.userService.update(user_id, {
      password: newPassword,
      ...(token_type === 'activate' ? { isActive: true } : {}),
    });
    return { message: token_type === 'activate' ? 'Account activated' : 'Password updated' };
  }
}
