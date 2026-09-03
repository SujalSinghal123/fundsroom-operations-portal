import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

router.post('/login', async (req: any, res: any) => {
  try {
    const { email } = req.body;
    let role = 'sales';
    let name = 'Sales Executive';

    if (email && email.includes('admin')) {
      role = 'admin';
      name = 'Admin User';
    } else if (email && email.includes('warehouse')) {
      role = 'warehouse';
      name = 'Warehouse Manager';
    }

    const token = jwt.sign(
      { id: 1, name, email, role },
      process.env.JWT_SECRET || 'supersecret_fundsroom_jwt_key_2026',
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: { id: 1, name, email, role }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/seed-database', async (req: any, res: any) => {
  try {
    // 1. Ensure clean customers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255),
        business_name VARCHAR(255),
        name VARCHAR(255),
        phone VARCHAR(50) DEFAULT '+91 9876543210',
        email VARCHAR(255) DEFAULT 'contact@client.com',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Clean old & insert target records
    await pool.query(`DELETE FROM customers;`);
    await pool.query(`
      INSERT INTO customers (customer_name, business_name, name, phone, email) VALUES
      ('Vikram Patel', 'Patel Logistics', 'Vikram Patel', '+91 9811223344', 'vikram@patellogistics.com'),
      ('Rajesh Sharma', 'Sharma Enterprises', 'Rajesh Sharma', '+91 9876543210', 'rajesh@sharma.in'),
      ('Apex Logistics', 'Apex Logistics Pvt Ltd', 'Apex Logistics', '+91 9723456789', 'contact@apex.in'),
      ('Reliance Hub', 'Reliance Retail Hub', 'Reliance Hub', '+91 9934567890', 'ops@reliancehub.com');
    `);

    // 2. Ensure clean products table with 30 units
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        product_name VARCHAR(255),
        sku VARCHAR(100),
        stock INT DEFAULT 0,
        quantity INT DEFAULT 0,
        units INT DEFAULT 0,
        min_threshold INT DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`DELETE FROM products;`);
    await pool.query(`
      INSERT INTO products (name, product_name, sku, stock, quantity, units, min_threshold) VALUES
      ('Heavy Duty Pallet Racks', 'Heavy Duty Pallet Racks', 'PAL-01', 15, 15, 15, 5),
      ('Hydraulic Forklift Pallet Truck 2.5T', 'Hydraulic Forklift Pallet Truck 2.5T', 'HPT-02', 10, 10, 10, 3),
      ('Barcode Scanner Pro Wireless', 'Barcode Scanner Pro Wireless', 'SCN-03', 5, 5, 5, 5);
    `);

    // 3. Ensure challans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS challans (
        id SERIAL PRIMARY KEY,
        challan_number VARCHAR(100),
        customer_name VARCHAR(255),
        total_qty INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return res.send(`
      <div style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #0f172a; color: white; min-height: 100vh;">
        <h1 style="color: #10B981; font-size: 28px;">Database Synchronized Successfully!</h1>
        <p style="color: #94a3b8; font-size: 16px;">Vikram Patel, Rajesh Sharma, and 30 Warehouse Stock units are live in PostgreSQL.</p>
        <a href="https://fundsroom-operations-portal-three.vercel.app" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #6366F1; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Open Fundsroom Portal</a>
      </div>
    `);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
