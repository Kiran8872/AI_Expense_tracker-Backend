import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: false
  },
  merchant: {
    type: String,
    required: true,
    default: 'Unknown Merchant'
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  items: [{
    description: String,
    price: Number,
    quantity: Number
  }],
  category: {
    type: String,
    required: true,
    default: 'Uncategorized'
  },
  tax: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    default: 'Unknown'
  },
  rawText: {
    type: String,
    required: false
  },
  aiSummary: {
    type: String,
    required: false
  }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
