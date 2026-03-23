import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  createDeposit(userId: string, amount: any) {
    return this.prisma.transaction.create({
      data: {
        type: TransactionType.DEPOSIT,
        amount,
        receiverId: userId,
        status: TransactionStatus.COMPLETED,
      },
    });
  }

  createTransfer(fromUserId: string, toUserId: string, amount: any) {
    return this.prisma.transaction.create({
      data: {
        type: TransactionType.TRANSFER,
        amount,
        senderId: fromUserId,
        receiverId: toUserId,
        status: TransactionStatus.COMPLETED,
      },
    });
  }

  createReversal(originalId: string, data: any) {
    return this.prisma.transaction.create({
      data: {
        ...data,
        type: TransactionType.REVERSAL,
        originalTransactionId: originalId,
        status: TransactionStatus.COMPLETED,
      },
    });
  }

  findById(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
    });
  }
}
