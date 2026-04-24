import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesRepository } from './workspaces.repository';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly usersService: UsersService,
  ) {}

  create(dto: CreateWorkspaceDto, userId: string) {
    return this.workspacesRepository.create(dto.name, userId);
  }

  listByUser(userId: string) {
    return this.workspacesRepository.listByUser(userId);
  }

  async update(userId: string, workspaceId: string, dto: UpdateWorkspaceDto) {
    const result = await this.workspacesRepository.updateForUser(
      userId,
      workspaceId,
      dto,
    );
    if (result.count === 0) {
      throw new NotFoundException('Workspace não encontrado.');
    }

    return this.workspacesRepository.findByIdForUser(userId, workspaceId);
  }

  async inviteUser(workspaceId: string, dto: InviteUserDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return this.workspacesRepository.addMember(workspaceId, user.id);
  }
}
