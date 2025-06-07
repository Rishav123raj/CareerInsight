
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Attempt to load .env from src/.env as a fallback if it exists there.
// Next.js automatically loads .env files from the project root.
// This explicit load is primarily for robustness if the key was placed in src/.env
// and to ensure it's loaded before Genkit initializes in server-side contexts.
const srcEnvPath = path.resolve(process.cwd(), 'src', '.env');
if (fs.existsSync(srcEnvPath)) {
  dotenvConfig({ path: srcEnvPath });
  console.log(`Attempted to load environment variables from ${srcEnvPath}`);
} else {
  // If src/.env doesn't exist, we rely on Next.js's default root .env loading.
  console.log('src/.env not found. Relying on Next.js default .env loading (ensure .env is in project root).');
}

const apiKey = process.env.GOOGLE_API_KEY;
const placeholderKey = "YOUR_GEMINI_API_KEY_PLEASE_REPLACE_ME"; // Keep your placeholder or use a generic one

if (!apiKey || apiKey === placeholderKey || apiKey === "AIzaSyAuDRBC0TSTJI1juTAsFfkhinKC8XWPOXg_NEEDS_REPLACEMENT") { // Added a generic placeholder check too
  let message = '\n🔴 CRITICAL ERROR: GOOGLE_API_KEY environment variable is not correctly configured or is a placeholder.\n';
  if (!apiKey) {
    message += 'It appears to be MISSING entirely from the environment variables available to the server.\n';
  } else if (apiKey === placeholderKey || apiKey === "AIzaSyAuDRBC0TSTJI1juTAsFfkhinKC8XWPOXg_NEEDS_REPLACEMENT") {
    message += `It is currently set to a default placeholder value: "${apiKey}".\n`;
  }
  message += 'AI-powered features (Employability Score, Recommendations, Pathways) WILL NOT WORK until this is resolved.\n\n';
  message += 'Troubleshooting Steps:\n';
  message += '1. Ensure you have a file named ".env" in the ROOT directory of your project (same level as package.json).\n';
  message += '2. Inside ".env", make sure you have the line: GOOGLE_API_KEY=YOUR_ACTUAL_API_KEY (replace with your real, valid key).\n';
  message += '   If you believe "AIzaSyAuDRBC0TSTJI1juTAsFfkhinKC8XWPOXg" is your key, ensure it\'s correctly set without typos and is valid for the Gemini API.\n';
  message += '3. VERY IMPORTANT: Restart your Next.js development server (npm run dev) after creating or modifying the .env file.\n';
  console.error(message); // Use console.error for critical issues
  // Consider throwing an error here to prevent the app from starting with a broken AI config,
  // though for now, a strong console error is provided.
  // throw new Error("CRITICAL: GOOGLE_API_KEY is not configured correctly. AI features will fail.");
} else {
  console.log("🟢 GOOGLE_API_KEY found in environment. Genkit will attempt to use it.");
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: apiKey }), // Explicitly pass the API key
  ],
  model: 'googleai/gemini-2.0-flash',
});
