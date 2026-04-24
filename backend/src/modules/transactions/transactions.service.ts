import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly repo: TransactionsRepository) {}

  async create(workspaceId: string, userId: string, dto: CreateTransactionDto) {
    this.validateTransfer(dto.type, dto.accountId, dto.destinationAccountId);
    return this.repo.create(workspaceId, {
      ...dto,
      date: new Date(dto.date),
      userId,
    });
  }

  findAll(workspaceId: string, month?: number, year?: number) {
    return this.repo.findAll(workspaceId, month, year);
  }

  async findOne(workspaceId: string, id: string) {
    const tx = await this.repo.findById(workspaceId, id);
    if (!tx) throw new NotFoundException('Transação não encontrada.');
    return tx;
  }

  async update(workspaceId: string, id: string, dto: UpdateTransactionDto) {
    if (dto.type === 'TRANSFERENCIA') {
      if (!dto.accountId) {
        throw new BadRequestException(
          'accountId é obrigatório ao alterar o tipo para TRANSFERENCIA.',
        );
      }
      this.validateTransfer(dto.type, dto.accountId, dto.destinationAccountId);
    } else if (dto.type) {
      // ENTRADA or SAIDA — no transfer-specific validation needed
    }
    const result = await this.repo.update(workspaceId, id, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
    if (result.count === 0) {
      throw new NotFoundException('Transação não encontrada.');
    }
    return this.findOne(workspaceId, id);
  }

  async remove(workspaceId: string, id: string) {
    const result = await this.repo.remove(workspaceId, id);
    if (result.count === 0) {
      throw new NotFoundException('Transação não encontrada.');
    }
    return { deleted: true };
  }

  private validateTransfer(
    type: TransactionType,
    accountId: string,
    destinationAccountId?: string,
  ) {
    if (type !== 'TRANSFERENCIA') return;
    if (!destinationAccountId) {
      throw new BadRequestException(
        'Transferência exige destinationAccountId.',
      );
    }
    if (destinationAccountId === accountId) {
      throw new BadRequestException(
        'Conta de origem e destino devem ser diferentes.',
      );
    }
  }
}
