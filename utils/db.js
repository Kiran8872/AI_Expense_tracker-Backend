import mongoose from 'mongoose';

let cachedDb = null;

export const connectToDatabase = async () => {
  if (cachedDb) {
    console.log('Using cached database connection');
    return Promise.resolve(cachedDb);
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expensetracker';
  
  console.log('Establishing new database connection');
  const connection = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  
  cachedDb = connection;
  return cachedDb;
};
