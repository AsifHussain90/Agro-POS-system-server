import express from 'express';
import { authRoutes } from './src/routes/auth.routes.js';
import { uploadRoutes } from './src/routes/upload.routes.js';
import { farmerRequestRoutes } from './src/routes/farmerRequest.routes.js';
import { productRoutes } from './src/routes/product.routes.js';  
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { errorHandler } from './src/middlewares/error.middleware.js';
import { setupSwagger } from './src/docs/swagger.setup.js';
import farmerRoutes from './src/routes/farmer.route.js';

const app = express();

dotenv.config();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

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
        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
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

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/farmer-request', farmerRequestRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/products', productRoutes);  

app.use(errorHandler);

export default app;