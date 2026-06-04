import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { CreateManagerDto } from '../user/dto/user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('managers')
  createManager(@Body() dto: CreateManagerDto) {
    return this.adminService.createManager(dto);
  }

  @Get('managers')
  getManagers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getManagersPaginated(page, limit);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStatsByStatus();
  }

  @Get('managers/:id/stats')
  getManagerStats(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getManagerStats(id);
  }

  @Post('managers/:id/activate')
  activateManager(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.activateManager(id);
  }

  @Post('managers/:id/recovery')
  recoveryPassword(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.recoveryPassword(id);
  }

  @Post('managers/:id/ban')
  banUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.banUser(id);
  }

  @Post('managers/:id/unban')
  unbanUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.unbanUser(id);
  }
}