import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from '../../common/guards/workspace-access.guard';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.workspacesService.listByUser(user.sub);
  }

  @Post()
  create(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(dto, user.sub);
  }

  @Post('invite')
  @UseGuards(WorkspaceAccessGuard)
  invite(
    @WorkspaceId() workspaceId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.workspacesService.inviteUser(workspaceId, dto);
  }
}
