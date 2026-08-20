import express from 'express';
import { authRoutes } from './src/routes/auth.routes.js';
import { uploadRoutes } from './src/routes/upload.routes.js';
import { farmerRequestRoutes } from './src/routes/farmerRequest.routes.js';
import { productRoutes } from './src/routes/product.route.js';
import { orderRoutes } from './src/routes/order.routes.js';
import { adminRoutes } from './src/routes/admin.routes.js';
import { superAdminRoutes } from './src/routes/superAdmin.route.js';
import { cartRoutes } from './src/routes/cart.routes.js';
import { buyerProfileRoutes } from './src/routes/buyerProfile.routes.js';
import farmerRoutes from './src/routes/farmer.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { errorHandler } from './src/middlewares/error.middleware.js';
import { setupSwagger } from './src/docs/swagger.setup.js';

const app = express();

// Cookie parser with secret for signed cookies (cart sessions)
const cookieSecret =
  process.env.COOKIE_SECRET ||
  process.env.REFRESH_TOKEN_SECRET ||
  'default-cookie-secret';
app.use(cookieParser(cookieSecret));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          'data:',
          'validator.swagger.io',
          'res.cloudinary.com',
        ],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(cors(corsOptions));

setupSwagger(app);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/farmer-request', farmerRequestRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/buyer', buyerProfileRoutes);

app.use(errorHandler);

export default app;
