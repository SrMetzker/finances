import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { LoginDto } from './dto/login.dto';
import { MigrateLocalUserDto } from './dto/migrate-local-user.dto';
import { RegisterDto } from './dto/register.dto';
import { SupabaseExchangeDto } from './dto/supabase-exchange.dto';
import { SupabaseAuthService } from './supabase-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
    private readonly jwtService: JwtService,
    private readonly supabaseAuthService: SupabaseAuthService,
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
      phone: dto.phone?.trim() || null,
      marketingConsent: dto.marketingConsent ?? false,
      leadSource: dto.leadSource?.trim() || null,
      leadCampaign: dto.leadCampaign?.trim() || null,
      authProvider: 'local',
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

  async exchangeSupabaseSession(dto: SupabaseExchangeDto) {
    const supabaseUser = await this.supabaseAuthService.getUserFromAccessToken(
      dto.accessToken,
    );

    const supabaseAuthId = supabaseUser.id;
    const email = supabaseUser.email?.trim().toLowerCase();

    if (!supabaseAuthId || !email) {
      throw new UnauthorizedException('Sessão Supabase sem e-mail válido.');
    }

    const displayName =
      dto.name?.trim() ||
      supabaseUser.user_metadata?.name?.trim() ||
      supabaseUser.user_metadata?.full_name?.trim() ||
      email.split('@')[0];

    const avatarUrl = supabaseUser.user_metadata?.avatar_url?.trim() || null;
    const phone = dto.phone?.trim() || supabaseUser.phone?.trim() || null;

    let localUser = await this.usersService.findBySupabaseAuthId(supabaseAuthId);
    if (!localUser) {
      localUser = await this.usersService.findByEmail(email);
    }

    if (!localUser) {
      const generatedPassword = await bcrypt.hash(randomUUID(), 10);
      localUser = await this.usersService.create({
        name: displayName,
        email,
        password: generatedPassword,
        avatarUrl,
        supabaseAuthId,
        phone,
        marketingConsent: dto.marketingConsent ?? false,
        leadSource: dto.leadSource?.trim() || null,
        leadCampaign: dto.leadCampaign?.trim() || null,
        authProvider: 'supabase',
        migratedToSupabaseAt: new Date(),
      });

      await this.workspacesService.create(
        {
          name:
            dto.workspaceName?.trim() || `Financas de ${displayName.trim()}`,
        },
        localUser.id,
      );
    } else if (!localUser.supabaseAuthId) {
      localUser = await this.usersService.linkToSupabase(localUser.id, {
        supabaseAuthId,
        phone,
        marketingConsent: dto.marketingConsent,
        leadSource: dto.leadSource?.trim() || null,
        leadCampaign: dto.leadCampaign?.trim() || null,
        authProvider: 'supabase',
        migratedToSupabaseAt: new Date(),
      });
    }

    return this.buildToken(
      localUser.id,
      localUser.email,
      localUser.name,
      localUser.avatarUrl,
    );
  }

  async migrateLocalUserToSupabase(dto: MigrateLocalUserDto) {
    const email = dto.email.trim().toLowerCase();
    const localUser = await this.usersService.findByEmail(email);
    if (!localUser) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const valid = await bcrypt.compare(dto.password, localUser.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (localUser.supabaseAuthId) {
      return this.buildToken(
        localUser.id,
        localUser.email,
        localUser.name,
        localUser.avatarUrl,
      );
    }

    let supabaseAuthId: string | null = null;
    try {
      const createdUser = await this.supabaseAuthService.createUserWithPassword({
        email,
        password: dto.password,
        name: localUser.name,
        phone: dto.phone?.trim() || localUser.phone || undefined,
      });
      supabaseAuthId = createdUser.id;
    } catch {
      const signInPayload = await this.supabaseAuthService.signInWithPassword(
        email,
        dto.password,
      );
      supabaseAuthId = signInPayload.user.id;
    }

    if (!supabaseAuthId) {
      throw new UnauthorizedException('Falha ao migrar credenciais para Supabase.');
    }

    const linkedUser = await this.usersService.linkToSupabase(localUser.id, {
      supabaseAuthId,
      phone: dto.phone?.trim() || localUser.phone || null,
      marketingConsent: dto.marketingConsent,
      leadSource: dto.leadSource?.trim() || null,
      leadCampaign: dto.leadCampaign?.trim() || null,
      authProvider: 'supabase',
      migratedToSupabaseAt: new Date(),
    });

    return this.buildToken(
      linkedUser.id,
      linkedUser.email,
      linkedUser.name,
      linkedUser.avatarUrl,
    );
  }

  private async buildToken(
    userId: string,
    email: string,
    name: string,
    avatarUrl?: string | null,
  ) {
    const accessToken = await this.jwtService.signAsync({ sub: userId, email });

    // Prioriza o último workspace utilizado pelo usuário; fallback para o mais recente.
    const user = await this.usersService.findById(userId);
    const workspaces = await this.workspacesService.listByUser(userId);
    const preferredWorkspace = user?.lastWorkspaceId
      ? workspaces.find((workspace) => workspace.id === user.lastWorkspaceId) ?? null
      : null;
    const defaultWorkspace = preferredWorkspace ?? workspaces[0] ?? null;

    return {
      accessToken,
      user: {
        id: userId,
        email,
        name,
        avatarUrl: avatarUrl ?? null,
        phone: user?.phone ?? null,
        marketingConsent: user?.marketingConsent ?? false,
        lastWorkspaceId: user?.lastWorkspaceId ?? null,
      },
      workspace: defaultWorkspace || null,
    };
  }
}
