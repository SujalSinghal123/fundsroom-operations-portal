import { Router } from 'express';
import pool from '../config/db';
import { authenticateJWT, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles('Admin', 'Sales'), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { customer_id, items, status = 'Draft' } = req.body;
    // items: [{ product_id, quantity }]

    if (!customer_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer and items are required' });
    }

    await client.query('BEGIN');

    // 1. Fetch and verify customer
    const custRes = await client.query('SELECT * FROM customers WHERE id = $1', [customer_id]);
    if (custRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    const customer = custRes.rows[0];

    // 2. Auto-generate Challan number (Format: CH-YYYYMMDD-XXXX)
    const countRes = await client.query('SELECT COUNT(*) FROM challans');
    const seq = String(parseInt(countRes.rows[0].count, 10) + 1).padStart(4, '0');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const challanNumber = `CH-${dateStr}-${seq}`;

    // 3. Process products & validate inventory
    let totalQty = 0;
    const resolvedItems = [];

    for (const item of items) {
      const prodRes = await client.query(
        'SELECT id, product_name, sku, unit_price, current_stock FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );
      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: `Product ${item.product_id} not found` });
      }

      const prod = prodRes.rows[0];
      if (status === 'Confirmed' && prod.current_stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${prod.product_name}. Available: ${prod.current_stock}, Requested: ${item.quantity}`
        });
      }

      totalQty += item.quantity;
      resolvedItems.push({ ...prod, quantity: item.quantity });
    }

    // 4. Insert Challan Header
    const challanRes = await client.query(
      `INSERT INTO challans (challan_number, customer_id, customer_snapshot, total_quantity, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [challanNumber, customer_id, JSON.stringify(customer), totalQty, status, req.user?.id]
    );
    const newChallan = challanRes.rows[0];

    // 5. Insert Items & apply stock deduction if Confirmed
    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO challan_items (challan_id, product_id, product_name, sku, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newChallan.id, item.id, item.product_name, item.sku, item.unit_price, item.quantity]
      );

      if (status === 'Confirmed') {
        await client.query(
          'UPDATE products SET current_stock = current_stock - $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.id]
        );

        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
           VALUES ($1, $2, 'OUT', $3, $4)`,
          [item.id, item.quantity, `Sales Challan confirmed: ${challanNumber}`, req.user?.id]
        );
      }
    }

    await client.query('COMMIT');
    return res.status(201).json({ success: true, data: newChallan });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

export default router;
