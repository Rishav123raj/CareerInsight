
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Explicitly load .env from project root first if present.
// Next.js handles this automatically, but this ensures dotenv is used consistently
// if there's any loading order ambiguity with other manual dotenv loads.
// However, typically, you'd rely solely on Next.js's built-in .env loading.
// For this specific debugging, let's be very explicit.

const rootEnvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(rootEnvPath)) {
  console.log(`Attempting to load environment variables from project root .env: ${rootEnvPath}`);
  dotenvConfig({ path: rootEnvPath, override: true }); // override: true ensures this takes precedence if called multiple times
} else {
  console.log(`Project root .env file not found at: ${rootEnvPath}. Relying on Next.js default .env loading or other .env files.`);
}

// Then, check for src/.env as a potential secondary or specific override location (less common for root config)
const srcEnvPath = path.resolve(process.cwd(), 'src', '.env');
if (fs.existsSync(srcEnvPath)) {
  console.log(`Attempting to load environment variables from src/.env: ${srcEnvPath}`);
  dotenvConfig({ path: srcEnvPath, override: true }); // override: true ensures this applies if src/.env has different values
}

console.log("Environment variable GOOGLE_API_KEY at the point of access in genkit.ts:", process.env.GOOGLE_API_KEY);

const apiKey = process.env.GOOGLE_API_KEY;
const placeholderKey = "YOUR_GEMINI_API_KEY_PLEASE_REPLACE_ME";
const placeholderKey2 = "AIzaSyAuDRBC0TSTJI1juTAsFfkhinKC8XWPOXg_NEEDS_REPLACEMENT"; // Another common placeholder

let criticalErrorMessage = "";

if (!apiKey) {
  criticalErrorMessage = '\n🔴 CRITICAL ERROR: GOOGLE_API_KEY environment variable is MISSING or UNDEFINED.\n';
} else if (apiKey === placeholderKey || apiKey === placeholderKey2) {
  criticalErrorMessage = `\n🔴 CRITICAL ERROR: GOOGLE_API_KEY is set to a PLACEHOLDER value: "${apiKey}".\n`;
}

if (criticalErrorMessage) {
  criticalErrorMessage += 'AI-powered features (Employability Score, Recommendations, Pathways) WILL NOT WORK until this is resolved.\n\n';
  criticalErrorMessage += 'Troubleshooting Steps:\n';
  criticalErrorMessage += '1. Ensure you have a file named ".env" in the ROOT directory of your project (same level as package.json).\n';
  criticalErrorMessage += '2. Inside this root ".env" file, make sure you have the line: GOOGLE_API_KEY=YOUR_ACTUAL_API_KEY (replace with your real, valid key).\n';
  criticalErrorMessage += '   - Do NOT use quotes around your API key unless the key itself contains quotes.\n';
  criticalErrorMessage += '   - Ensure there are no leading/trailing spaces.\n';
  criticalErrorMessage += '3. If you also have a "src/.env" file, ensure it either also contains the correct GOOGLE_API_KEY or remove the key from "src/.env" to avoid conflicts, letting the root ".env" be the source of truth.\n';
  criticalErrorMessage += '4. VERY IMPORTANT: Restart your Next.js development server (e.g., `npm run dev`) after creating or modifying any .env file.\n';
  console.error(criticalErrorMessage);
  // Forcing an error here might be too disruptive for startup, but the console error should be prominent.
  // throw new Error("CRITICAL: GOOGLE_API_KEY is not configured correctly. AI features will fail.");
} else {
  console.log("🟢 GOOGLE_API_KEY found in environment and is not a known placeholder. Genkit will attempt to use it:", apiKey ? apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4) : "undefined");
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: apiKey }), // Explicitly pass the API key
  ],
  // model: 'googleai/gemini-2.0-flash', // Consider updating to 'gemini-1.5-flash-latest' or similar if issues persist beyond API key
});
