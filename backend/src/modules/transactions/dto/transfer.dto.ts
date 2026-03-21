import { IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({ example: 'uuid-do-usuario' })
  @IsUUID()
  toUserId: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  amount: number;
}
