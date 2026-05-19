import mongoose from 'mongoose';
import Expense from './models/Expense.js';

const listDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    const expenses = await Expense.find({});
    console.log('Expenses in DB:', JSON.stringify(expenses, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

listDB();
