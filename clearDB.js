import mongoose from 'mongoose';
import Expense from './models/Expense.js';

const clearDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    await Expense.deleteMany({});
    console.log('Database cleared successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

clearDB();
