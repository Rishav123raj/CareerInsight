
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Check for the API key at startup.
// The googleAI() plugin might use GOOGLE_API_KEY or GEMINI_API_KEY or a specific key passed in its options.
// We'll check for GOOGLE_API_KEY as it's commonly used.
if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === "YOUR_GEMINI_API_KEY_PLEASE_REPLACE_ME") {
  console.warn(
    '\n🟡 WARNING: GOOGLE_API_KEY environment variable is not properly configured or is a placeholder.\n' +
    'Genkit AI features relying on Google AI models may not work correctly.\n' +
    'Please ensure GOOGLE_API_KEY is set in your .env file with a valid API key.\n'
  );
}

export const ai = genkit({
  plugins: [googleAI()], // If your key is named differently, e.g., GEMINI_API_KEY, you might need to configure it here: googleAI({apiKey: process.env.GEMINI_API_KEY})
  model: 'googleai/gemini-2.0-flash',
});
