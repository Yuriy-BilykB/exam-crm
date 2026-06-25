import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

@Module({
  imports: [
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
