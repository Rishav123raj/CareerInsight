
'use server';

import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// Define the path for the local users JSON file
const USERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');
const DATA_DIR_PATH = path.join(process.cwd(), 'src', 'data');

interface LocalUser {
  id: string;
  name: string;
  email: string;
  password?: string; // Hashed password
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: { id: string; name: string; email: string };
}

// Helper function to ensure the data directory and users.json file exist
async function ensureUsersFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR_PATH, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      console.error('Failed to create data directory:', error);
      throw new Error('Server setup error: Could not create data directory.');
    }
  }

  try {
    await fs.access(USERS_FILE_PATH);
  } catch (error) {
    // File doesn't exist, create it with an empty array
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify([]), 'utf-8');
    console.log('Created users.json file.');
  }
}

// Helper function to read users from the JSON file
async function readUsers(): Promise<LocalUser[]> {
  await ensureUsersFile();
  try {
    const data = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as LocalUser[];
  } catch (error) {
    console.error('Error reading users file:', error);
    // If file is corrupt or empty, treat as empty list and try to recover by overwriting later
    return [];
  }
}

// Helper function to write users to the JSON file
async function writeUsers(users: LocalUser[]): Promise<void> {
  await ensureUsersFile();
  try {
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users file:', error);
    throw new Error('Failed to save user data.');
  }
}

export async function signUpUser(formData: FormData): Promise<AuthResponse> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { success: false, message: 'All fields are required.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  try {
    console.log("Attempting to sign up user with local storage...");
    const users = await readUsers();

    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    const newUser: LocalUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    };

    users.push(newUser);
    await writeUsers(users);
    console.log("New user saved successfully to local store:", newUser.email);

    return {
      success: true,
      message: 'User registered successfully!',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    };
  } catch (error: any) {
    console.error('🔴 Sign up error in server action (local storage):');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    let userMessage = 'An unexpected error occurred during sign up. Please try again.';
    if (error.message.includes('Failed to save user data') || error.message.includes('Could not create data directory')) {
        userMessage = 'Server error saving user information. Please try again later.';
    }
    
    return { success: false, message: userMessage };
  }
}

export async function signInUser(formData: FormData): Promise<AuthResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  try {
    console.log("Attempting to sign in user with local storage...");
    const users = await readUsers();

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (!user.password) {
        console.error("User account incomplete - password field missing from local store for:", email);
        return { success: false, message: 'User account incomplete. Please contact support.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: 'Invalid email or password.' };
    }

    console.log("User signed in successfully from local store:", user.email);
    return {
      success: true,
      message: 'Signed in successfully!',
      user: { id: user.id, name: user.name, email: user.email },
    };
  } catch (error: any) {
    console.error('🔴 Sign in error in server action (local storage):');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    let userMessage = 'An unexpected error occurred during sign in. Please try again.';
    if (error.message.includes('Failed to read user data')) { // This would be from readUsers if JSON is corrupt
        userMessage = 'Server error reading user information. Please try again later.';
    }
    
    return { success: false, message: userMessage };
  }
}
