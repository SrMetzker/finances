import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    if (!req.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }
    if (!req.workspaceId) {
      throw new ForbiddenException(
        'Workspace não informado. Envie o header x-workspace-id.',
      );
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.sub,
          workspaceId: req.workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Acesso negado a este workspace.');
    }

    return true;
  }
}
