import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const service = new TransactionsService(mockRepo as any);

beforeEach(() => jest.clearAllMocks());

describe('TransactionsService', () => {
  it('creates an income transaction', async () => {
    mockRepo.create.mockResolvedValue({ id: 'tx1' });
    const result = await service.create('ws', 'user', {
      amount: 1000,
      type: 'ENTRADA',
      date: '2026-04-01',
      description: 'Salário',
      accountId: 'a1',
      categoryId: 'c1',
    });
    expect(result).toEqual({ id: 'tx1' });
    expect(mockRepo.create).toHaveBeenCalledWith(
      'ws',
      expect.objectContaining({ userId: 'user', type: 'ENTRADA' }),
    );
  });

  it('rejects transfer without destinationAccountId', async () => {
    await expect(
      service.create('ws', 'user', {
        amount: 100,
        type: 'TRANSFERENCIA',
        date: '2026-04-01',
        description: 'Transferência',
        accountId: 'a1',
        categoryId: 'c1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects transfer with same source and destination account', async () => {
    await expect(
      service.create('ws', 'user', {
        amount: 100,
        type: 'TRANSFERENCIA',
        date: '2026-04-01',
        description: 'Transferência',
        accountId: 'a1',
        destinationAccountId: 'a1',
        categoryId: 'c1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when transaction is not found', async () => {
    mockRepo.remove.mockResolvedValue({ count: 0 });
    await expect(service.remove('ws', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
