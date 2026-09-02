import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import challanRoutes from './routes/challanRoutes';

dotenv.config();
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);

// Fallback direct route in case proxy strips /api
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/challans', challanRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK' }));

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));
