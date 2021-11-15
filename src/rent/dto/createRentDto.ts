import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRentDto {
  @ApiProperty()
  @IsNotEmpty()
  auto_id: string;

  @ApiProperty()
  @IsNotEmpty()
  state_number: string;

  @ApiProperty()
  @IsNotEmpty()
  rent_start: string;

  @ApiProperty()
  @IsNotEmpty()
  rent_end: string;
}
