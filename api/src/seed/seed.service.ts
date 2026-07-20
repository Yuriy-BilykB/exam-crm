import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRole } from '../common/enums';

const adminEmail = 'admin@gmail.com';
const adminPassword = 'admin';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    const existing = await this.userService.findByEmail(adminEmail);
    if (existing) {
      await this.userService.update(existing.id, {
        password: adminPassword,
        isActive: true,
      });
      return;
    }
    const user = await this.userService.create({
      email: adminEmail,
      password: adminPassword,
      name: 'Admin',
      role: UserRole.ADMIN,
    });
    await this.userService.update(user.id, { isActive: true });
  }
}
