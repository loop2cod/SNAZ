import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
import authRoutes from './routes/authRoutes';
import driverRoutes from './routes/driverRoutes';
import foodCategoryRoutes from './routes/foodCategoryRoutes';
import companyRoutes from './routes/companyRoutes';
import customerRoutes from './routes/customerRoutes';
import dailyOrderRoutes from './routes/dailyOrderRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import billingRoutes from './routes/billingRoutes';
import paymentRoutes from './routes/paymentRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/food-categories', foodCategoryRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/daily-orders', dailyOrderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payments', paymentRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
