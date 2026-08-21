import mongoose from 'mongoose';
import { DB_NAME } from '../../constants.js';

export const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/${DB_NAME}`;

    const connectionInstance = await mongoose.connect(mongoUri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    console.log(
      `MongoDB connected — HOST: ${connectionInstance.connection.host} | DB: ${DB_NAME}`
    );
  } catch (error) {
    console.error('Failed to connect DB:', error.message);
    process.exit(1);
  }
};