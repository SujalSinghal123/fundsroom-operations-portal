import { Router } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

router.get('/', async (req, res) => {
  try {
    const q = `
      SELECT sc.*, c.customer_name, c.business_name, c.gst_number, c.email as customer_email
      FROM sales_challans sc
      JOIN customers c ON sc.customer_id = c.id
      ORDER BY sc.id DESC
    `;
    const result = await pool.query(q);
    res.json({ success: true, challans: result.rows });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, status, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Select at least one product' });
    }

    await client.query('BEGIN');

    // Get an existing valid user ID to satisfy the foreign key constraint
    const uRes = await client.query('SELECT id FROM users LIMIT 1');
    const validUserId = uRes.rows.length > 0 ? uRes.rows[0].id : 1;

    let totalQty = 0;
    const snapshots: any[] = [];

    for (const item of items) {
      const prodRes = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.product_id]);
      if (prodRes.rows.length === 0) throw new Error(`Product not found`);

      const prod = prodRes.rows[0];
      const qty = Number(item.quantity);

      if (status === 'Confirmed' && prod.current_stock < qty) {
        throw new Error(`Insufficient stock for ${prod.product_name}. Available: ${prod.current_stock}`);
      }

      if (status === 'Confirmed') {
        await client.query('UPDATE products SET current_stock = current_stock - $1 WHERE id = $2', [qty, prod.id]);
        await client.query(
          `INSERT INTO inventory_movements (product_id, quantity_changed, movement_type, reason, created_by)
           VALUES ($1, $2, 'OUT', 'Challan Dispatch Order', $3)`,
          [prod.id, qty, validUserId]
        );
      }

      totalQty += qty;
      snapshots.push({
        product_id: prod.id,
        product_name: prod.product_name,
        sku: prod.sku,
        unit_price: prod.unit_price,
        quantity: qty
      });
    }

    const challanNumber = `CH-${Date.now().toString().slice(-6)}`;

    const challanInsert = await client.query(
      `INSERT INTO sales_challans (challan_number, customer_id, total_quantity, status, items_snapshot, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [challanNumber, customer_id, totalQty, status, JSON.stringify(snapshots), validUserId]
    );

    await client.query('COMMIT');
    res.json({ success: true, challan: challanInsert.rows[0] });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

export default router;
