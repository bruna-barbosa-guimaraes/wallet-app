import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post('deposit')
  @HttpCode(200)
  @ApiOperation({ summary: 'Realizar depósito na conta do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Depósito realizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação ou usuário não encontrado',
  })
  deposit(@CurrentUser() user: AuthUser, @Body() body: DepositDto) {
    return this.transactionsService.deposit(user.userId, body.amount);
  }

  @Post('transfer')
  @HttpCode(200)
  @ApiOperation({ summary: 'Transferir valor para outro usuário' })
  @ApiResponse({
    status: 200,
    description: 'Transferência realizada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação, saldo insuficiente ou usuário inválido',
  })
  transfer(@CurrentUser() user: AuthUser, @Body() body: TransferDto) {
    return this.transactionsService.transfer(
      user.userId,
      body.toUserId,
      body.amount,
    );
  }

  @Post(':id/reverse')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reverter uma transação' })
  @ApiResponse({
    status: 200,
    description: 'Transação revertida com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação ou transação não encontrada',
  })
  async reverse(@Param('id') transactionId: string) {
    return this.transactionsService.reverse(transactionId);
  }
}
