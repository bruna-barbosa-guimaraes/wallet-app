import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Post('deposit')
  deposit(@Req() req: RequestWithUser, @Body() body: DepositDto) {
    return this.service.deposit(req.user.userId, body.amount);
  }

  @Post('transfer')
  transfer(@Req() req: RequestWithUser, @Body() body: TransferDto) {
    return this.service.transfer(req.user.userId, body.toUserId, body.amount);
  }
}
