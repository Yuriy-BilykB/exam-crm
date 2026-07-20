import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CreateManagerDto, PaginationDto } from '../user/dto/user.dto';

@Controller('admin/managers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminManagersController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  createManager(@Body() dto: CreateManagerDto) {
    return this.adminService.createManager(dto);
  }

  @Get()
  managers(@Query() { page, limit }: PaginationDto) {
    return this.adminService.getManagers(page, limit);
  }

  @Get(':id/stats')
  managerStats(@Param('id') id: string) {
    return this.adminService.getManagerStats(id);
  }

  @Post(':id/activate')
  activateManager(@Param('id') id: string) {
    return this.adminService.activateManager(id);
  }

  @Post(':id/recovery')
  recoveryManagerPassword(@Param('id') id: string) {
    return this.adminService.recoveryPassword(id);
  }

  @Post(':id/ban')
  banManager(@Param('id') id: string) {
    return this.adminService.banManager(id);
  }

  @Post(':id/unban')
  unbanManager(@Param('id') id: string) {
    return this.adminService.unbanManager(id);
  }
}
