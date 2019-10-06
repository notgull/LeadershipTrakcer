// BSD LICENSE - c John Nunley and Larson Rivera

// sql statements
import { Pool } from 'pg';
import * as path from 'path';

const config = require(path.join(process.cwd(), 'config.json'));

const pool = new Pool({
  user: config.postgres_username,
  password: config.postgres_password,
  host: config.postgres_host,
  database: config.postgres_database,
});

export async function query(sql: string, args: any): Promise<any> {
  return pool.query(sql, args);
}
