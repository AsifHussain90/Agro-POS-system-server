import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import app from './app.js';

dotenv.config();

(async () => {
  try {
    await connectDB();

    const port = Number(process.env.PORT) || 5000;
    const server = app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port} [${process.env.NODE_ENV || 'development'}]`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
})();