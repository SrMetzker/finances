import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class WorkspaceMiddleware implements NestMiddleware {
  use(req: AuthRequest, _res: Response, next: NextFunction) {
    const workspaceId = req.header('x-workspace-id');
    if (workspaceId) {
      req.workspaceId = workspaceId;
    }
    next();
  }
}
