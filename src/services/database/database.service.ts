import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
  pool = new Pool({
    user: 'macbookpro',
    password: 'root',
    host: 'localhost',
    port: 5432,
    database: 'rent',
  });
}
