import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RentService } from './rent.service';
import { CreateRentDto } from './dto/createRentDto';

@Controller()
export class RentController {
  constructor(private rentService: RentService) {}
  @ApiResponse({
    status: 200,
    description: 'Success request to checking the availability of cars',
  })
  @ApiResponse({
    status: 400,
    description: 'Cant request to checking the availability of cars',
  })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'state_number', required: true })
  @ApiQuery({ name: 'start_rent', required: true })
  @ApiQuery({ name: 'end_rent', required: true })
  @Get('/autoAvailable')
  autoAvailable(
    @Query('state_number') state_number: string,
    @Query('start_rent') start_rent: string,
    @Query('end_rent') end_rent: string,
  ) {
    return this.rentService.autoAvailable({
      state_number,
      start_rent,
      end_rent,
    });
  }

  @ApiResponse({
    status: 200,
    description: 'Success request to calculation Rent',
  })
  @ApiResponse({
    status: 400,
    description: 'Cant request to calculation Rent',
  })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'start_rent', required: true })
  @ApiQuery({ name: 'end_rent', required: true })
  @Get('/calculationRent')
  calculationRent(
    @Query('start_rent') start_rent: string,
    @Query('end_rent') end_rent: string,
  ) {
    const calculationRentDto = { start_rent, end_rent };
    return this.rentService.calculationRent(calculationRentDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Success created Rent',
  })
  @ApiResponse({
    status: 400,
    description: 'Cant create Rent',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/createRent')
  createRent(@Body() createRentDto: CreateRentDto) {
    return this.rentService.createRent(createRentDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Successful receipt of the report',
  })
  @ApiResponse({
    status: 400,
    description: 'Cant receipt of the report',
  })
  @ApiQuery({ name: 'state_number', required: true })
  @ApiQuery({ name: 'month', required: true })
  @HttpCode(HttpStatus.OK)
  @Get('/reportRent')
  reportRent(
    @Query('state_number') state_number: string,
    @Query('month') month: string,
  ) {
    return this.rentService.reportRent(state_number, month);
  }
}
