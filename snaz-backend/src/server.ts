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
  origin: process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
import driverRoutes from './routes/driverRoutes';
import foodCategoryRoutes from './routes/foodCategoryRoutes';
import customerRoutes from './routes/customerRoutes';
import dailyOrderRoutes from './routes/dailyOrderRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

app.use('/api/drivers', driverRoutes);
app.use('/api/food-categories', foodCategoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/daily-orders', dailyOrderRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;