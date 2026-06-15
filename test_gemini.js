import dotenv from 'dotenv';

dotenv.config();

async function testNative() {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('Testing native Gemini API with key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say hello' }]
        }]
      })
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response JSON:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error fetching:', err);
  }
}

testNative();
