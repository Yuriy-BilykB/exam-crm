import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { OrderModule } from './order/order.module';
import { CommentModule } from './comment/comment.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    SeedModule,
    AuthModule,
    UserModule,
    GroupModule,
    OrderModule,
    CommentModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
