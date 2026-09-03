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
    // 1. Detect Customer table column
    const custColsRes = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'customers';
    `);
    const custCols = custColsRes.rows.map((r: any) => r.column_name);

    let custNameCol = 'name';
    if (custCols.includes('customer_name')) custNameCol = 'customer_name';
    else if (custCols.includes('company_name')) custNameCol = 'company_name';
    else if (custCols.includes('title')) custNameCol = 'title';

    if (custCols.length > 0) {
      await pool.query(`
        INSERT INTO customers (${custNameCol}) VALUES 
        ('Apex Logistics Pvt Ltd'),
        ('Reliance Retail Hub'),
        ('BlueDart Supply Chain'),
        ('Tata Steel Distribution')
        ON CONFLICT DO NOTHING;
      `);
    }

    // 2. Detect Product table columns & set total 30 units
    const prodColsRes = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'products';
    `);
    const prodCols = prodColsRes.rows.map((r: any) => r.column_name);

    if (prodCols.length > 0) {
      let pNameCol = prodCols.includes('product_name') ? 'product_name' : (prodCols.includes('title') ? 'title' : 'name');
      let pQtyCol = prodCols.includes('quantity') ? 'quantity' : (prodCols.includes('units') ? 'units' : 'stock');

      await pool.query(`DELETE FROM products;`);
      await pool.query(`
        INSERT INTO products (${pNameCol}, ${pQtyCol}) VALUES 
        ('Heavy Duty Pallet Racks', 15),
        ('Hydraulic Hand Pallet Truck 2.5T', 10),
        ('Industrial Barcode Scanner X-200', 5);
      `);
    }

    return res.send(`
      <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h1 style="color: #10B981;">Database Seeded Successfully!</h1>
        <p>Customers added & Warehouse physical units updated to 30.</p>
        <a href="https://fundsroom-operations-portal-three.vercel.app" style="display: inline-block; padding: 10px 20px; background: #6366F1; color: white; border-radius: 6px; text-decoration: none;">Open Portal</a>
      </div>
    `);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
