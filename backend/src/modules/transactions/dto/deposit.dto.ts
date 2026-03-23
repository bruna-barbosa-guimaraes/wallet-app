import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class DepositDto {
  @ApiProperty({ example: '100.00' })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'O valor deve ser um número válido com até 2 casas decimais',
  })
  amount: string;
}
