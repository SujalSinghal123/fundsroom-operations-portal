import { Router } from 'express';
import bcrypt from 'bcryptjs';
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
      user: {
        id: 1,
        name,
        email,
        role
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/seed-database', async (req: any, res: any) => {
  try {
    // 1. Create Tables if not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE,
        category VARCHAR(100),
        stock INT DEFAULT 0,
        min_threshold INT DEFAULT 5
      );

      CREATE TABLE IF NOT EXISTS challans (
        id SERIAL PRIMARY KEY,
        challan_number VARCHAR(100),
        customer_name VARCHAR(255),
        total_qty INT,
        status VARCHAR(50) DEFAULT 'Delivered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Insert Customers
    await pool.query(`
      INSERT INTO customers (name, email, phone, address) VALUES
      ('Apex Logistics Pvt Ltd', 'contact@apexlogistics.in', '+91 9876543210', 'Warehouse Complex, Sector 18, Gurugram'),
      ('Reliance Retail Hub', 'operations@relianceretail.com', '+91 9811223344', 'Logistics Park, Navi Mumbai'),
      ('BlueDart Supply Chain', 'support@bluedart.com', '+91 9723456789', 'Airport Cargo Road, New Delhi'),
      ('Tata Steel Distribution', 'dispatch@tatasteel.com', '+91 9934567890', 'Industrial Area, Jamshedpur')
      ON CONFLICT DO NOTHING;
    `);

    // 3. Insert Products / Inventory
    await pool.query(`
      INSERT INTO products (name, sku, category, stock, min_threshold) VALUES
      ('Heavy Duty Pallet Racks', 'PAL-RCK-01', 'Storage', 45, 10),
      ('Hydraulic Hand Pallet Truck 2.5T', 'HPT-2500', 'Machinery', 12, 3),
      ('Industrial Barcode Scanner X-200', 'SCN-BC-200', 'Electronics', 35, 8),
      ('Corrugated Packaging Box 7-Ply', 'BOX-7PLY-50', 'Packaging', 1200, 200),
      ('Thermal Shipping Label Roll (1000)', 'LBL-TH-1000', 'Consumables', 85, 20),
      ('Automated Roller Conveyor 10m', 'RC-CONV-10M', 'Automation', 4, 2)
      ON CONFLICT DO NOTHING;
    `);

    // 4. Insert Challan Records
    await pool.query(`
      INSERT INTO challans (challan_number, customer_name, total_qty, status) VALUES
      ('CH-2026-001', 'Apex Logistics Pvt Ltd', 15, 'Delivered'),
      ('CH-2026-002', 'Reliance Retail Hub', 50, 'In Transit'),
      ('CH-2026-003', 'BlueDart Supply Chain', 25, 'Dispatched'),
      ('CH-2026-004', 'Tata Steel Distribution', 100, 'Delivered')
      ON CONFLICT DO NOTHING;
    `);

    return res.send(`
      <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h1 style="color: #10B981;">Database Seeded Successfully!</h1>
        <p>Customers, Inventory Products, and Challan records added to Neon Cloud DB.</p>
        <a href="https://fundsroom-operations-portal-three.vercel.app" style="display: inline-block; padding: 10px 20px; background: #6366F1; color: white; border-radius: 6px; text-decoration: none;">Go to Portal</a>
      </div>
    `);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
export default router;
