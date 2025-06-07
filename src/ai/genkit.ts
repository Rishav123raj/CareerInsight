
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
  // Calling dotenvConfig() here without a path would attempt to load .env from CWD (project root),
  // which Next.js should already handle.
  console.log('src/.env not found. Relying on Next.js default .env loading (ensure .env is in project root).');
}

const apiKey = process.env.GOOGLE_API_KEY;
const placeholderKey = "YOUR_GEMINI_API_KEY_PLEASE_REPLACE_ME";

if (!apiKey || apiKey === placeholderKey) {
  let message = '\n🟡 CRITICAL WARNING: GOOGLE_API_KEY environment variable is not correctly configured.\n';
  if (!apiKey) {
    message += 'It appears to be MISSING entirely from the environment variables available to the server.\n';
  } else if (apiKey === placeholderKey) {
    message += `It is currently set to the default placeholder value: "${placeholderKey}".\n`;
  }
  message += 'AI-powered features (Employability Score, Recommendations, Pathways) WILL NOT WORK until this is resolved.\n\n';
  message += 'Troubleshooting Steps:\n';
  message += '1. Ensure you have a file named ".env" in the ROOT directory of your project (same level as package.json).\n';
  message += '2. Inside ".env", make sure you have the line: GOOGLE_API_KEY=YOUR_ACTUAL_API_KEY (replace with your real key).\n';
  message += '   The key you mentioned using is "AIzaSyAuDRBC0TSTJI1juTAsFfkhinKC8XWPOXg". If this is your valid key, ensure it\'s correctly set.\n';
  message += '3. VERY IMPORTANT: Restart your Next.js development server (npm run dev) after creating or modifying the .env file.\n';
  message += '4. If you previously had a file at "src/.env", consider moving its contents to the root ".env" file and deleting "src/.env" to avoid confusion.\n';
  console.warn(message);
} else {
  console.log("🟢 GOOGLE_API_KEY found in environment. Genkit will attempt to use it.");
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: apiKey }), // Explicitly pass the API key
  ],
  model: 'googleai/gemini-2.0-flash', // Keeping existing model, can be updated later if needed
});

