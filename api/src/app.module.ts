import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST') || 'localhost',
        port: parseInt(configService.get('DB_PORT') || '3306', 10),
        username: configService.get('DB_USERNAME') || 'root',
        password: configService.get('DB_PASSWORD') || '',
        database: configService.get('DB_DATABASE') || configService.get('DB_NAME') || 'crm_db',
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
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
