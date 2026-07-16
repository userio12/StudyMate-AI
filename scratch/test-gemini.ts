import OpenAI from 'openai';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../apps/backend/.env') });

async function testGemini() {
  const geminiClient = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });

  console.log('Testing Gemini Vision API...');
  try {
    // 1x1 transparent pixel base64
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    const response = await geminiClient.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract text' },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }
      ]
    });
    console.log('Gemini success:', response.choices[0]?.message?.content);
  } catch (error: any) {
    console.error('Gemini error:', error.message);
  }
}

testGemini();
