import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Add more specific prompt templates with safer language
const PROMPT_TEMPLATES = {
  romantic: (theme: string) => `Create wholesome, family-friendly song lyrics about: ${theme}...`,
  friendship: (theme: string) => `Create cheerful friendship-themed lyrics about: ${theme}...`,
  nature: (theme: string) => `Create nature-inspired lyrics about: ${theme}...`,
  inspiration: (theme: string) => `Create motivational lyrics about: ${theme}...`
};

export async function generateValentineLyrics(
  prompt: string,
  promptType: 'romantic' | 'friendship' | 'nature' | 'inspiration' = 'romantic'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      // Updated safety settings with correct enum values
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT" as HarmCategory,
          threshold: "BLOCK_MEDIUM_AND_ABOVE" as HarmBlockThreshold
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH" as HarmCategory,
          threshold: "BLOCK_MEDIUM_AND_ABOVE" as HarmBlockThreshold
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as HarmCategory,
          threshold: "BLOCK_MEDIUM_AND_ABOVE" as HarmBlockThreshold
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT" as HarmCategory,
          threshold: "BLOCK_MEDIUM_AND_ABOVE" as HarmBlockThreshold
        }
      ]
    });

    const template = PROMPT_TEMPLATES[promptType];
    const result = await model.generateContent(template(prompt));
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating lyrics:', error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
      throw new Error('Please try a different topic. Keep it family-friendly!');
    }
    throw new Error('Failed to generate lyrics. Please try again.');
  }
} 