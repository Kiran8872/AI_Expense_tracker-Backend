import Expense from '../models/Expense.js';
import { analyzeReceiptImage } from '../utils/geminiHelper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload image and analyze with Gemini
export const uploadExpense = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided. Please upload an image.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const imagePath = req.file.path;
    const mimeType = req.file.mimetype;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Analyze with Gemini
    const { extractedData, rawText } = await analyzeReceiptImage(imagePath, mimeType, apiKey);

    if (!extractedData) {
       return res.status(500).json({ error: 'Failed to extract data from image.' });
    }

    // Duplicate receipt detection
    const duplicateExpense = await Expense.findOne({
      merchant: extractedData.merchant,
      amount: extractedData.amount,
      date: {
        $gte: new Date(extractedData.date).setHours(0, 0, 0, 0),
        $lte: new Date(extractedData.date).setHours(23, 59, 59, 999)
      }
    });

    if (duplicateExpense) {
      return res.status(409).json({ 
        error: 'Duplicate Receipt Detected', 
        details: 'An expense from this merchant with the exact same amount and date already exists.' 
      });
    }

    // Save to database
    const newExpense = new Expense({
      imageUrl,
      merchant: extractedData.merchant || 'Unknown Merchant',
      amount: extractedData.amount || 0,
      date: extractedData.date ? new Date(extractedData.date) : Date.now(),
      items: extractedData.items || [],
      category: extractedData.category || 'Uncategorized',
      tax: extractedData.tax || 0,
      paymentMethod: extractedData.paymentMethod || 'Unknown',
      aiSummary: extractedData.aiSummary || '',
      rawText: rawText || ''
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);

  } catch (error) {
    console.error('Error in uploadExpense:', error);
    if (error.status === 400) {
      console.error('Gemini API Error Status Text:', error.statusText);
      console.error('Gemini API Error Details:', JSON.stringify(error, null, 2));
    }
    res.status(500).json({ error: 'An error occurred while processing the expense.', details: error.message });
  }
};

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const { search, category, startDate, endDate, minAmount, maxAmount } = req.query;
    
    let query = {};
    
    if (search) {
      query.merchant = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = Number(minAmount);
      if (maxAmount !== undefined) query.amount.$lte = Number(maxAmount);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

// Get single expense
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expense' });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedExpense) return res.status(404).json({ error: 'Expense not found' });
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Error updating expense' });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    
    // Optionally delete the associated image file (non-blocking)
    if (expense.imageUrl) {
      try {
        // imageUrl is stored as '/uploads/filename' — resolve relative to project root
        const relativePath = expense.imageUrl.startsWith('/')
          ? expense.imageUrl.slice(1)
          : expense.imageUrl;
        const filePath = path.join(__dirname, '..', relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileErr) {
        console.warn('Could not delete image file:', fileErr.message);
      }
    }
    
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Error deleting expense', details: error.message });
  }
};
