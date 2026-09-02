import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addColumn() {
  try {
    await pool.query(`ALTER TABLE sales_challans ADD COLUMN IF NOT EXISTS items_snapshot JSONB DEFAULT '[]'::jsonb;`);
    console.log("ITEMS_SNAPSHOT COLUMN ADDED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
addColumn();
