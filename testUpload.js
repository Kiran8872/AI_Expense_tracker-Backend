import fs from 'fs';

const uploadFile = async () => {
  const filePath = './uploads/image-1779094757916-866067391.png';
  const fileData = fs.readFileSync(filePath);
  
  const blob = new Blob([fileData], { type: 'image/png' });
  const formData = new FormData();
  formData.append('image', blob, 'image.png');
  
  try {
    const response = await fetch('http://localhost:5000/api/expenses/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.text();
    console.log(response.status, result);
  } catch (err) {
    console.error(err);
  }
};

uploadFile();
