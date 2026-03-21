import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { TransactionsRepository } from './transactions.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionStatus, TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private usersRepository: UsersRepository,
    private transactionsRepository: TransactionsRepository,
    private prisma: PrismaService,
  ) {}

  async deposit(userId: string, amount: any) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const newBalance = user.balance.plus(amount);

    await this.prisma.$transaction([
      this.usersRepository.updateBalance(userId, newBalance),
      this.transactionsRepository.createDeposit(userId, amount),
    ]);

    return { message: 'Depósito realizado com sucesso' };
  }

  async transfer(senderId: string, receiverId: string, amount: number) {
    if (senderId === receiverId) {
      throw new BadRequestException('Não pode transferir para si mesmo');
    }

    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    if (!sender) {
      throw new BadRequestException('Usuário remetente não encontrado');
    }

    const amountDecimal = new Decimal(amount);

    if (sender.balance.lessThan(amountDecimal)) {
      throw new BadRequestException('Saldo insuficiente');
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new BadRequestException('Usuário destino não encontrado');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: senderId },
        data: {
          balance: sender.balance.minus(amountDecimal),
        },
      }),
      this.prisma.user.update({
        where: { id: receiverId },
        data: {
          balance: receiver.balance.plus(amountDecimal),
        },
      }),
      this.prisma.transaction.create({
        data: {
          senderId,
          receiverId,
          amount: amountDecimal,
          type: TransactionType.TRANSFER,
          status: TransactionStatus.COMPLETED,
        },
      }),
    ]);

    return { message: 'Transferência realizada com sucesso' };
  }
}
