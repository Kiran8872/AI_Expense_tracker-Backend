import fs from 'fs';

const uploadFile = async () => {
  const fileData = Buffer.from('dummy image data');
  const blob = new Blob([fileData], { type: 'image/png' });
  const formData = new FormData();
  formData.append('image', blob, 'dummy.png');
  
  try {
    const response = await fetch('https://ai-expense-tracker-backend-tau.vercel.app/api/expenses/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.text();
    console.log('STATUS:', response.status);
    console.log('BODY:', result);
  } catch (err) {
    console.error(err);
  }
};

uploadFile();
