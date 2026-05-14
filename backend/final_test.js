import dotenv from 'dotenv';
dotenv.config({ override: true });

const apiKey = process.env.GROQ_API_KEY;
console.log('API Key:', apiKey);

async function testFetch() {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say Hello' }]
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testFetch();
