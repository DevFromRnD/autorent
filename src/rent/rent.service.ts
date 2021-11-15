import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRentDto } from './dto/createRentDto';
import { DatabaseService } from '../services/database/database.service';

@Injectable()
export class RentService {
  constructor(private databaseService: DatabaseService) {}
  async autoAvailable({ state_number, start_rent, end_rent }) {
    try {
      const dateCorrect = await RentService.isDateCorrect(start_rent, end_rent);
      if (!dateCorrect) {
        throw new BadRequestException('Incorrect rental period');
      }
      const autoAvailable = await this.isAutoAvailable(
        state_number,
        start_rent,
        end_rent,
      );

      return { autoAvailable };
    } catch (error) {
      throw new BadRequestException(
        'Cant request to checking the availability of cars',
        error.message,
      );
    }
  }

  async calculationRent({ start_rent, end_rent }) {
    try {
      const dateCorrect = await RentService.isDateCorrect(start_rent, end_rent);
      if (!dateCorrect) {
        throw new BadRequestException('Incorrect rental period');
      }
      const rentDays = Math.round(
        (Date.parse(end_rent) - Date.parse(start_rent) + RentService.msInDay) /
          RentService.msInDay,
      );
      let sum = 0;
      const base_tariff = 1000;
      for (let i = 1; i <= rentDays; i++) {
        if (i >= 18 && i <= 30) sum += base_tariff - (base_tariff * 15) / 100;
        if (i >= 10 && i <= 17) sum += base_tariff - (base_tariff * 10) / 100;
        if (i >= 5 && i <= 9) sum += base_tariff - (base_tariff * 5) / 100;
        if (i <= 4) sum += base_tariff;
      }
      return sum;
    } catch (error) {
      throw new BadRequestException(
        'Cant request to checking the availability of cars',
        error.message,
      );
    }
  }

  async createRent(createRentDto: CreateRentDto) {
    try {
      const { auto_id, state_number, rent_start, rent_end } = createRentDto;
      const dateCorrect = await RentService.isDateCorrect(rent_start, rent_end);
      if (!dateCorrect) {
        throw new BadRequestException('Incorrect rental period');
      }
      const autoAvailable = await this.isAutoAvailable(
        state_number,
        rent_start,
        rent_end,
      );
      if (!dateCorrect || !autoAvailable) {
        throw new BadRequestException(
          'Try to choose a different rental period',
        );
      }
      const dateStartRent = new Date(rent_start);
      const dateEndRent = new Date(rent_end);
      const rental_session = await this.databaseService.pool.query(
        'INSERT INTO rental_session (auto_id, state_number, rental_start, rental_end) ' +
          'VALUES ($1, $2, $3, $4) RETURNING id;',
        [auto_id, state_number, dateStartRent, dateEndRent],
      );
      const rental_session_id = rental_session.rows[0].id;
      return {
        rental_session_id,
      };
    } catch (error) {
      throw new BadRequestException(
        'Cant request to create Rent',
        error.message,
      );
    }
  }

  async reportRent(state_number, month) {
    try {
      const rental_sessions = await this.databaseService.pool.query(
        'SELECT rental_start as "start", rental_end as "end" FROM rental_session ' +
          'WHERE state_number = $1 AND ' +
          "date_part('month', date_trunc('month', rental_start)) = $2 OR " +
          "date_part('month', date_trunc('month', rental_end)) = $2 " +
          'ORDER BY rental_start;',
        [state_number, month],
      );
      let daysInRent = 0;
      for (let i = 0; i < rental_sessions.rows.length; i++) {
        const { start, end } = rental_sessions.rows[i];
        const dayInMonth = new Date(0, month, 0).getDate();
        const monthStart = start.getMonth() + 1;
        const monthEnd = end.getMonth() + 1;
        const dayStart = start.getDate();
        const dayEnd = end.getDate();

        if (monthStart == monthEnd) {
          daysInRent += dayEnd - dayStart + 1;
        }
        if (monthStart != month) {
          daysInRent += dayEnd;
        }
        if (monthEnd != month) {
          daysInRent += dayInMonth - dayStart + 1;
        }
      }
      return {
        state_number,
        daysInRent,
      };
    } catch (error) {
      throw new BadRequestException(
        'Cant receipt of the report',
        error.message,
      );
    }
  }

  private async isAutoAvailable(state_number, start_rent, end_rent) {
    const maintenancePeriod = new Date(Date.parse(start_rent) - 259200000);
    const rentalSessions = await this.databaseService.pool.query(
      'SELECT * FROM rental_session WHERE ' +
        'state_number = $1 AND ' +
        '(rental_start BETWEEN $2 AND $3 OR ' +
        'rental_end BETWEEN $4 AND $3 OR ' +
        '(rental_start <= $2 AND rental_end >= $3));',
      [state_number, start_rent, end_rent, maintenancePeriod],
    );
    return !rentalSessions.rows.length;
  }

  private static async isDateCorrect(start_rent, end_rent) {
    const rent_start_day = new Date(start_rent).getDay();
    const rent_end_day = new Date(end_rent).getDay();
    const rentDays = Math.round(
      (Date.parse(end_rent) - Date.parse(start_rent) + RentService.msInDay) /
        RentService.msInDay,
    );
    return (
      rent_start_day != 6 &&
      rent_start_day != 0 &&
      rent_end_day != 6 &&
      rent_end_day != 0 &&
      rentDays >= 1 &&
      rentDays <= 30
    );
  }
  private static msInDay = 86400000;
}
