import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRole } from '../common/enums';

// Intentionally fixed credentials required by this educational project's assignment.
// The reviewer uses this account to check the deployed project with the provided database.
const adminEmail = 'admin@gmail.com';
const adminPassword = 'admin';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    const existing = await this.userService.findByEmail(adminEmail);
    if (existing) {
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
