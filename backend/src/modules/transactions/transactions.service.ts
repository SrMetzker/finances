import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

const SYSTEM_TRANSFER_CATEGORY_NAME = 'Transferência (sistema)';
const SYSTEM_TRANSFER_CATEGORY_ICON = 'refresh-cw';
const SYSTEM_TRANSFER_CATEGORY_COLOR = '#64748B';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly repo: TransactionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(workspaceId: string, userId: string, dto: CreateTransactionDto) {
    this.validateTransfer(dto.type, dto.accountId, dto.destinationAccountId);

    const categoryId = await this.resolveCategoryIdForCreate(workspaceId, dto);

    return this.repo.create(workspaceId, {
      ...dto,
      date: new Date(dto.date),
      categoryId,
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
    const current = await this.findOne(workspaceId, id);
    const nextType = dto.type ?? current.type;
    const nextAccountId = dto.accountId ?? current.accountId;
    const nextDestinationAccountId =
      dto.destinationAccountId ?? current.destinationAccountId ?? undefined;

    if (nextType === 'TRANSFERENCIA') {
      this.validateTransfer(nextType, nextAccountId, nextDestinationAccountId);
    }

    const categoryId = await this.resolveCategoryIdForUpdate(
      workspaceId,
      dto,
      current.type,
      current.categoryId,
    );

    const result = await this.repo.update(workspaceId, id, {
      ...dto,
      categoryId,
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

  private async resolveCategoryIdForCreate(
    workspaceId: string,
    dto: CreateTransactionDto,
  ) {
    if (dto.type === 'TRANSFERENCIA') {
      return this.getOrCreateInternalTransferCategoryId(workspaceId);
    }

    if (!dto.categoryId) {
      throw new BadRequestException(
        'categoryId é obrigatório para transações de entrada e saída.',
      );
    }

    return dto.categoryId;
  }

  private async resolveCategoryIdForUpdate(
    workspaceId: string,
    dto: UpdateTransactionDto,
    currentType: TransactionType,
    currentCategoryId: string,
  ) {
    const nextType = dto.type ?? currentType;

    if (nextType === 'TRANSFERENCIA') {
      return this.getOrCreateInternalTransferCategoryId(workspaceId);
    }

    if (dto.categoryId) {
      return dto.categoryId;
    }

    if (currentType !== 'TRANSFERENCIA') {
      return currentCategoryId;
    }

    throw new BadRequestException(
      'categoryId é obrigatório ao converter transferência para entrada ou saída.',
    );
  }

  private async getOrCreateInternalTransferCategoryId(workspaceId: string) {
    const existing = await this.prisma.category.findFirst({
      where: {
        workspaceId,
        type: 'TRANSFERENCIA',
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    const created = await this.prisma.category.create({
      data: {
        workspaceId,
        name: SYSTEM_TRANSFER_CATEGORY_NAME,
        type: 'TRANSFERENCIA',
        icon: SYSTEM_TRANSFER_CATEGORY_ICON,
        color: SYSTEM_TRANSFER_CATEGORY_COLOR,
      },
      select: { id: true },
    });

    return created.id;
  }
}
