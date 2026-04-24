import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  create(data: { name: string; email: string; password: string }) {
    return this.usersRepository.create(data);
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  async getPublicProfile(userId: string) {
    const found = await this.usersRepository.findById(userId);
    if (!found) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      id: found.id,
      name: found.name,
      email: found.email,
      avatarUrl: found.avatarUrl,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const current = await this.usersRepository.findById(userId);
    if (!current) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const payload: {
      name?: string;
      avatarUrl?: string | null;
    } = {};

    if (dto.name !== undefined) {
      payload.name = dto.name.trim();
    }

    if (dto.avatarUrl !== undefined) {
      payload.avatarUrl = dto.avatarUrl.trim() || null;
    }

    const updated = await this.usersRepository.updateProfile(userId, payload);

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      avatarUrl: updated.avatarUrl,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const current = await this.usersRepository.findById(userId);
    if (!current) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      current.password,
    );
    if (!isCurrentValid) {
      throw new BadRequestException('Senha atual inválida.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da atual.',
      );
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.updatePassword(userId, hashed);
    return { updated: true };
  }

  async resetData(userId: string) {
    const current = await this.usersRepository.findById(userId);
    if (!current) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.usersRepository.clearWorkspaceFinancialDataByUser(userId);
    return { reset: true };
  }

  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    const current = await this.usersRepository.findById(userId);
    if (!current) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      current.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Senha inválida para excluir conta.');
    }

    await this.usersRepository.deleteAccount(userId);
    return { deleted: true };
  }
}
