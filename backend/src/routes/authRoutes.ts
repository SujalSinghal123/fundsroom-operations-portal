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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'User does not exist in DB' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'supersecret_fundsroom_jwt_key_2026',
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
router.get('/create-all-users', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('Password@123', 10);
    
    // Admin user
    await req.pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Admin User', 'admin@fundsweb.in', $1, 'admin') 
      ON CONFLICT (email) DO UPDATE SET password=$1, role='admin'
    `, [hash]);

    // Warehouse user
    await req.pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Warehouse Manager', 'warehouse@fundsweb.in', $1, 'warehouse') 
      ON CONFLICT (email) DO UPDATE SET password=$1, role='warehouse'
    `, [hash]);

    res.send("<h1>USERS CREATED SUCCESSFULLY! Admin & Warehouse ready.</h1>");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});
