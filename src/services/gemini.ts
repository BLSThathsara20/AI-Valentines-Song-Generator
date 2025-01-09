import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MAX_LYRICS_CHARS = 900;

export async function generateValentineLyrics(
  idea: string, 
  type: 'romantic' | 'friendship' | 'nature' | 'inspiration'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Write song lyrics based on this idea: "${idea}"
      Style: ${type}
      Requirements:
      - Keep it under 900 characters
      - Make it romantic and Valentine's themed
      - Include at least one verse and one chorus
      - Keep it family-friendly
      - Make it emotional and meaningful`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Ensure the response doesn't exceed the limit
    return text.slice(0, MAX_LYRICS_CHARS);
  } catch (error) {
    console.error('Error generating lyrics:', error);
    throw new Error('Failed to generate lyrics. Please try again.');
  }
} 