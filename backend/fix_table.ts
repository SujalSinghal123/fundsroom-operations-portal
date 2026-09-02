import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id),
        quantity_changed INT NOT NULL,
        movement_type VARCHAR(10) NOT NULL,
        reason TEXT,
        created_by VARCHAR(50) DEFAULT 'System User',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("TABLE INVENTORY_MOVEMENTS READY!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixTable();
