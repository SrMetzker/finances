import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('E-mail já cadastrado.');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
    });

    await this.workspacesService.create(
      {
        name: dto.workspaceName?.trim() || `Financas de ${dto.name.trim()}`,
      },
      user.id,
    );

    return this.buildToken(user.id, user.email, user.name, user.avatarUrl);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas.');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas.');
    return this.buildToken(user.id, user.email, user.name, user.avatarUrl);
  }

  private async buildToken(
    userId: string,
    email: string,
    name: string,
    avatarUrl?: string | null,
  ) {
    const accessToken = await this.jwtService.signAsync({ sub: userId, email });

    // Buscar primeiro workspace do usuário
    const workspaces = await this.workspacesService.listByUser(userId);
    const defaultWorkspace = workspaces[0];

    return {
      accessToken,
      user: {
        id: userId,
        email,
        name,
        avatarUrl: avatarUrl ?? null,
      },
      workspace: defaultWorkspace || null,
    };
  }
}
