import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// Helper function to extract JSON from markdown or generic text
const extractJSON = (text) => {
  try {
    const jsonMatch = text.match(/```(?:json)?\n?([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error("Error parsing JSON from Gemini response:", err);
    return null;
  }
};

const analyzeReceiptImage = async (imageBase64, mimeType, apiKey) => {
  try {
    if (apiKey === 'your_gemini_api_key_here') {
      console.log('Using mock Gemini API response for testing.');
      return {
        extractedData: {
          merchant: "Mocked Tech Store",
          amount: 299.99,
          date: new Date().toISOString().split('T')[0],
          items: [{ description: "Wireless Keyboard", price: 149.99, quantity: 1 }, { description: "Ergonomic Mouse", price: 150.00, quantity: 1 }],
          category: "Electronics",
          tax: 15.00,
          paymentMethod: "Credit Card",
          aiSummary: "Purchase of office peripherals."
        },
        rawText: "This is a mocked raw text extraction from the receipt."
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const imageData = imageBase64;
    
    const prompt = `
    Analyze this receipt/invoice/bill image and extract the following information.
    Format your response EXACTLY as a JSON object with the following keys. If a value is not found, use null or an appropriate default. Do not include any other text besides the JSON.

    {
      "merchant": "Name of the store or merchant",
      "amount": "Total amount as a number (e.g. 15.50)",
      "date": "Date of purchase in YYYY-MM-DD format if possible, otherwise string",
      "items": [
        {
          "description": "Item name",
          "price": "Item price as a number",
          "quantity": "Item quantity as a number"
        }
      ],
      "category": "Suggest a generic category for this expense (e.g., Groceries, Dining, Utilities, Transportation, Entertainment, Office Supplies, etc.)",
      "tax": "Tax amount as a number",
      "paymentMethod": "Payment method (e.g., Cash, Credit Card, Visa, Mastercard, etc.)",
      "aiSummary": "A brief 1-2 sentence summary of what this expense was for"
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageData
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.1,
      }
    });

    const rawText = response.text;
    const extractedData = extractJSON(rawText);

    return {
      extractedData,
      rawText
    };
  } catch (error) {
    console.error("Error in analyzeReceiptImage:", error);
    throw error;
  }
};

export { analyzeReceiptImage };
