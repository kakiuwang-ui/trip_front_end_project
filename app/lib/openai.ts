import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.BASE_URL;

if (!apiKey) {
  // Warn on server side if key is missing, but don't crash immediately 
  // to allow build process to complete if it doesn't need the key
  console.warn('API Key (DOUBAO_API_KEY or OPENAI_API_KEY) is not defined in environment variables');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key', // Prevent crash on initialization
  baseURL: baseURL,
});
