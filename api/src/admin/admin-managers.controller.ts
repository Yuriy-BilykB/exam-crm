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
import { UserRole } from '../common/enums';
import { CreateManagerDto } from '../user/dto/user.dto';

@Controller('admin/managers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminManagersController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() dto: CreateManagerDto) {
    return this.adminService.createManager(dto);
  }

  @Get()
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getManagersPaginated(page, limit);
  }

  @Get(':id/stats')
  stats(@Param('id') id: string) {
    return this.adminService.getManagerStats(id);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.adminService.activateManager(id);
  }

  @Post(':id/recovery')
  recovery(@Param('id') id: string) {
    return this.adminService.recoveryPassword(id);
  }

  @Post(':id/ban')
  ban(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Post(':id/unban')
  unban(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }
}
