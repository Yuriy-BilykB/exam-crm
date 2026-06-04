import { UserRole } from '../user.entity';

export class CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
}

/** For admin creating a manager (no password - will be set via activation) */
export class CreateManagerDto {
  email: string;
  name?: string;
}

export class UpdateUserDto {
  name?: string;
  password?: string;
  isActive?: boolean;
  isBanned?: boolean;
}
