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
      user: { id: 1, name, email, role }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/seed-database', async (req: any, res: any) => {
  try {
    // 1. Fetch exact columns and data types for customers
    const custColsRes = await pool.query(`
      SELECT column_name, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name != 'id';
    `);
    const cCols = custColsRes.rows;

    const clientRows = [
      { name: 'Vikram Patel', biz: 'Patel Logistics' },
      { name: 'Rajesh Sharma', biz: 'Sharma Enterprises' },
      { name: 'Apex Logistics', biz: 'Apex Logistics Pvt Ltd' },
      { name: 'Reliance Hub', biz: 'Reliance Retail Hub' }
    ];

    for (const c of clientRows) {
      const colsToInsert: string[] = [];
      const values: any[] = [];

      cCols.forEach((colObj: any) => {
        const col = colObj.column_name;
        const type = colObj.udt_name;

        // Skip enum columns or give them a standard enum value if not null
        if (type.includes('enum')) {
          return;
        }

        colsToInsert.push(col);

        if (col.includes('customer_name') || col === 'name') {
          values.push(c.name);
        } else if (col.includes('business_name') || col.includes('company_name')) {
          values.push(c.biz);
        } else if (col.includes('phone')) {
          values.push('+91 9876543210');
        } else if (col.includes('email')) {
          values.push('contact@enterprise.com');
        } else if (col.includes('address')) {
          values.push('Industrial Area Phase 1');
        } else {
          values.push('Active');
        }
      });

      if (colsToInsert.length > 0) {
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        await pool.query(
          `INSERT INTO customers (${colsToInsert.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`,
          values
        );
      }
    }

    // 2. Set exact 30 Units for Warehouse in products
    const prodColsRes = await pool.query(`
      SELECT column_name, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name != 'id';
    `);
    const pCols = prodColsRes.rows;

    if (pCols.length > 0) {
      await pool.query(`DELETE FROM products;`);

      const productsData = [
        { name: 'Heavy Duty Pallet Racks', qty: 15 },
        { name: 'Hydraulic Pallet Truck 2.5T', qty: 10 },
        { name: 'Barcode Scanner Wireless', qty: 5 }
      ];

      for (const p of productsData) {
        const pColsToInsert: string[] = [];
        const pValues: any[] = [];

        pCols.forEach((colObj: any) => {
          const col = colObj.column_name;
          const type = colObj.udt_name;

          if (type.includes('enum')) return;

          pColsToInsert.push(col);
          if (['stock', 'quantity', 'units', 'available_stock', 'current_stock'].includes(col)) {
            pValues.push(p.qty);
          } else if (['name', 'product_name', 'title', 'item_name'].includes(col)) {
            pValues.push(p.name);
          } else if (col === 'sku') {
            pValues.push('SKU-' + Math.floor(1000 + Math.random() * 9000));
          } else {
            pValues.push('General');
          }
        });

        const pPlaceholders = pValues.map((_, i) => `$${i + 1}`).join(', ');
        await pool.query(
          `INSERT INTO products (${pColsToInsert.join(', ')}) VALUES (${pPlaceholders}) ON CONFLICT DO NOTHING;`,
          pValues
        );
      }
    }

    return res.send(`
      <div style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #0f172a; color: white; min-height: 100vh;">
        <h1 style="color: #10B981; font-size: 28px;">Database Seeded Successfully!</h1>
        <p style="color: #94a3b8; font-size: 16px;">Vikram Patel, Rajesh Sharma, and 30 Warehouse units are live.</p>
        <a href="https://fundsroom-operations-portal-three.vercel.app" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #6366F1; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Open Fundsroom Portal</a>
      </div>
    `);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
