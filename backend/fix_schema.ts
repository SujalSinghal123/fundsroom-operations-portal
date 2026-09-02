import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixSchema() {
  try {
    await pool.query(`
      ALTER TABLE sales_challans ALTER COLUMN created_by TYPE VARCHAR(100) USING created_by::varchar;
      ALTER TABLE inventory_movements ALTER COLUMN created_by TYPE VARCHAR(100) USING created_by::varchar;
      ALTER TABLE sales_challans ADD COLUMN IF NOT EXISTS items_snapshot JSONB DEFAULT '[]'::jsonb;
    `);
    console.log("DATABASE SCHEMA PERMANENTLY FIXED!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixSchema();
