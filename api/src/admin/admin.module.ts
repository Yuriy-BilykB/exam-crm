import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { Order } from '../order/order.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UserModule, AuthModule, TypeOrmModule.forFeature([Order])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
