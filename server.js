import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import app from './app.js';

dotenv.config();

(async () => {
  try {
    await connectDB();

    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exitCode = 1;
  }
})();
