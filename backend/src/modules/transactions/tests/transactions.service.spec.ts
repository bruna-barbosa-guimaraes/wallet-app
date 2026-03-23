import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionsService } from '../transactions.service';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { UsersRepository } from 'src/modules/users/users.repository';
import { TransactionsRepository } from '../transactions.repository';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: any;

  const mockUsersRepository = {
    findById: jest.fn(),
    updateBalance: jest.fn(),
  };

  const mockTransactionsRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        {
          provide: TransactionsRepository,
          useValue: mockTransactionsRepository,
        },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  // DEPOSIT

  it('deve realizar depósito com sucesso', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      balance: new Decimal(100),
    });

    await service.deposit('1', '50');

    expect(prisma.user.update).toHaveBeenCalled();
    expect(prisma.transaction.create).toHaveBeenCalled();
  });

  it('deve falhar se valor for inválido', async () => {
    await expect(service.deposit('1', '0')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve falhar se usuário não existir', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.deposit('1', '50')).rejects.toThrow(
      'Usuário não encontrado',
    );
  });

  // TRANSFER

  it('deve transferir com sucesso', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: '1',
        balance: new Decimal(100),
      })
      .mockResolvedValueOnce({
        id: '2',
        balance: new Decimal(50),
      });

    await service.transfer('1', '2', '50');
    expect(prisma.user.update).toHaveBeenCalledTimes(2);
    expect(prisma.transaction.create).toHaveBeenCalled();
  });

  it('deve falhar ao transferir para si mesmo', async () => {
    await expect(service.transfer('1', '1', '50')).rejects.toThrow(
      'Não pode transferir para si mesmo',
    );
  });

  it('deve falhar com saldo insuficiente', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      balance: new Decimal(10),
    });

    await expect(service.transfer('1', '2', '50')).rejects.toThrow(
      'Saldo insuficiente',
    );
  });

  it('deve falhar se remetente não existir', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.transfer('1', '2', '50')).rejects.toThrow(
      'Usuário remetente não encontrado',
    );
  });

  it('deve falhar se destinatário não existir', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: '1',
        balance: new Decimal(100),
      })
      .mockResolvedValueOnce(null);

    await expect(service.transfer('1', '2', '50')).rejects.toThrow(
      'Usuário destino não encontrado',
    );
  });

  // REVERSE

  it('deve falhar se a transação não existir', async () => {
    prisma.transaction.findUnique.mockResolvedValue(null);

    await expect(service.reverse('1')).rejects.toThrow(
      'Transação não encontrada',
    );
  });

  it('deve falhar se a transação já foi revertida', async () => {
    prisma.transaction.findUnique.mockResolvedValue({
      id: '1',
      status: TransactionStatus.REVERSED,
    });

    await expect(service.reverse('1')).rejects.toThrow(
      'Transação já foi revertida',
    );
  });

  it('deve reverter uma TRANSFER corretamente', async () => {
    const transaction = {
      id: '1',
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      senderId: 'user1',
      receiverId: 'user2',
      amount: new Decimal(100),
    };

    prisma.transaction.findUnique.mockResolvedValue(transaction);

    const result = await service.reverse('1');

    expect(prisma.$transaction).toHaveBeenCalled();

    expect(prisma.user.update).toHaveBeenCalledTimes(2);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user1' },
      data: { balance: { increment: new Decimal(100) } },
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user2' },
      data: { balance: { decrement: new Decimal(100) } },
    });

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { status: TransactionStatus.REVERSED },
    });

    expect(result.message).toBe('Transação revertida com sucesso');
  });

  it('deve reverter um DEPOSIT corretamente', async () => {
    const transaction = {
      id: '1',
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      receiverId: 'user1',
      amount: new Decimal(200),
    };

    prisma.transaction.findUnique.mockResolvedValue(transaction);

    await service.reverse('1');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user1' },
      data: { balance: { decrement: new Decimal(200) } },
    });

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { status: TransactionStatus.REVERSED },
    });
  });

  it('deve retornar todas as transações do usuário, ordenadas do mais recente', async () => {
    const mockTransactions = [
      {
        id: 't1',
        senderId: '1',
        toUserId: '2',
        amount: new Decimal(50),
        createdAt: new Date('2026-01-01'),
      },
      {
        id: 't2',
        senderId: '2',
        toUserId: '1',
        amount: new Decimal(100),
        createdAt: new Date('2026-02-01'),
      },
    ];

    prisma.transaction.findMany.mockResolvedValue(mockTransactions);

    const result = await service.listUserTransactions('1');

    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: { senderId: '1' },
      orderBy: { createdAt: 'desc' },
    });

    expect(result).toEqual(mockTransactions);
  });

  it('deve retornar array vazio se não houver transações', async () => {
    prisma.transaction.findMany.mockResolvedValue([]);

    const result = await service.listUserTransactions('1');

    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: { senderId: '1' },
      orderBy: { createdAt: 'desc' },
    });

    expect(result).toEqual([]);
  });
});
