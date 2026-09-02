import { Router } from 'express';
import { pool } from '../config/db';
import { verifyRole } from '../middleware/auth';

const router = Router();

// GET /customers with search & status filter
router.get('/', verifyRole(['Admin', 'Sales', 'Accounts']), async (req, res) => {
  const { search, status } = req.query;
  try {
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (customer_name ILIKE $${params.length} OR business_name ILIKE $${params.length})`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, customers: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /customers
router.post('/', verifyRole(['Admin', 'Sales']), async (req, res) => {
  const { customer_name, business_name, mobile_number, email, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;
  const userId = (req as any).user.id;

  try {
    const result = await pool.query(
      `INSERT INTO customers (customer_name, business_name, mobile_number, email, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [customer_name, business_name, mobile_number, email, gst_number, customer_type || 'Retail', address, status || 'Lead', follow_up_date, notes, userId]
    );
    res.status(201).json({ success: true, customer: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
