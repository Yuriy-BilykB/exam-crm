import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { CourseFormatModule } from './course-format/course-format.module';
import { CourseTypeModule } from './course-type/course-type.module';
import { StatusModule } from './status/status.module';
import { GroupModule } from './group/group.module';
import { OrderModule } from './order/order.module';
import { CommentModule } from './comment/comment.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SeedModule,
    AuthModule,
    UserModule,
    CourseModule,
    CourseFormatModule,
    CourseTypeModule,
    StatusModule,
    GroupModule,
    OrderModule,
    CommentModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
