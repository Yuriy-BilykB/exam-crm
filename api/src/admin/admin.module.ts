import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { MailModule } from '../mail/mail.module';
import { AdminController } from './admin.controller';
import { AdminManagersController } from './admin-managers.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UserModule, TokenModule, MailModule],
  controllers: [AdminController, AdminManagersController],
  providers: [AdminService],
})
export class AdminModule {}
