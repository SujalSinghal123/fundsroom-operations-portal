import { Router } from 'express';
import { pool } from '../config/db';
import { verifyRole } from '../middleware/auth';

const router = Router();

// GET /products
router.get('/', verifyRole(['Admin', 'Sales', 'Warehouse', 'Accounts']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json({ success: true, products: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /products/movements (Stock movement logs)
router.get('/movements', verifyRole(['Admin', 'Warehouse']), async (req, res) => {
  try {
    const query = `
      SELECT sm.*, p.product_name, p.sku, u.name as created_by_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.created_by = u.id
      ORDER BY sm.created_at DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, movements: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
