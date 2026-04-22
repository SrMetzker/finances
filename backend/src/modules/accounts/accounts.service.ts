import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  create(workspaceId: string, dto: CreateAccountDto) {
    return this.accountsRepository.create(workspaceId, dto);
  }

  findAll(workspaceId: string) {
    return this.accountsRepository.balanceSummary(workspaceId);
  }

  async findOne(workspaceId: string, id: string) {
    const account = await this.accountsRepository.findById(workspaceId, id);
    if (!account) throw new NotFoundException('Conta não encontrada.');
    return account;
  }

  async update(workspaceId: string, id: string, dto: UpdateAccountDto) {
    const result = await this.accountsRepository.update(workspaceId, id, dto);
    if (result.count === 0) throw new NotFoundException('Conta não encontrada.');
    return this.findOne(workspaceId, id);
  }

  async remove(workspaceId: string, id: string) {
    const result = await this.accountsRepository.remove(workspaceId, id);
    if (result.count === 0) throw new NotFoundException('Conta não encontrada.');
    return { deleted: true };
  }
}
