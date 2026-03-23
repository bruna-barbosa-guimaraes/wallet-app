import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionStatus, TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async deposit(userId: string, amount: string) {
    const amountDecimal = new Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new BadRequestException('O valor deve ser maior que zero');
    }

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      const newBalance = user.balance.plus(amountDecimal);

      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      });

      await tx.transaction.create({
        data: {
          receiverId: userId,
          amount: amountDecimal,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
        },
      });
    });

    return { message: 'Depósito realizado com sucesso' };
  }

  async transfer(senderId: string, receiverId: string, amount: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Não pode transferir para si mesmo');
    }

    const amountDecimal = new Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new BadRequestException('O valor deve ser maior que zero');
    }

    await this.prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({
        where: { id: senderId },
      });

      if (!sender) {
        throw new BadRequestException('Usuário remetente não encontrado');
      }

      if (sender.balance.lessThan(amountDecimal)) {
        throw new BadRequestException('Saldo insuficiente');
      }

      const receiver = await tx.user.findUnique({
        where: { id: receiverId },
      });

      if (!receiver) {
        throw new BadRequestException('Usuário destino não encontrado');
      }

      await tx.user.update({
        where: { id: senderId },
        data: {
          balance: sender.balance.minus(amountDecimal),
        },
      });

      await tx.user.update({
        where: { id: receiverId },
        data: {
          balance: receiver.balance.plus(amountDecimal),
        },
      });

      await tx.transaction.create({
        data: {
          senderId,
          receiverId,
          amount: amountDecimal,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
        },
      });
    });

    return { message: 'Transferência realizada com sucesso' };
  }

  async reverse(transactionId: string) {
    await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new BadRequestException('Transação não encontrada');
      }

      if (transaction.status === TransactionStatus.REVERSED) {
        throw new BadRequestException('Transação já foi revertida');
      }

      if (transaction.type === TransactionType.TRANSFER) {
        if (!transaction.senderId || !transaction.receiverId) {
          throw new BadRequestException('Dados da transação inválidos');
        }

        await tx.user.update({
          where: { id: transaction.senderId },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        });

        await tx.user.update({
          where: { id: transaction.receiverId },
          data: {
            balance: {
              decrement: transaction.amount,
            },
          },
        });
      }

      if (transaction.type === TransactionType.DEPOSIT) {
        if (!transaction.receiverId) {
          throw new BadRequestException('Dados da transação inválidos');
        }

        await tx.user.update({
          where: { id: transaction.receiverId },
          data: {
            balance: {
              decrement: transaction.amount,
            },
          },
        });
      }

      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.REVERSED,
        },
      });
    });

    return {
      message: 'Transação revertida com sucesso',
    };
  }
}
