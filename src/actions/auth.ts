
'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs'; // Using bcryptjs as it was in previous local setup

// Define the path to the users.json file
const usersFilePath = path.resolve(process.cwd(), 'src', 'data', 'users.json');

interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Hashed password
  createdAt?: Date; // Optional: if you want to keep track of creation time
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: { id: string; name: string; email: string }; // Return non-sensitive user info
  error?: { code?: string; message: string };
}

// Helper function to read users from the JSON file
async function getUsers(): Promise<User[]> {
  try {
    await fs.mkdir(path.dirname(usersFilePath), { recursive: true }); // Ensure directory exists
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    // If file doesn't exist or is empty, or other read errors, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // File not found, normal for first run
    }
    console.warn("Warning: Could not read users.json, starting with empty user list. Error:", (error as Error).message);
    return [];
  }
}

// Helper function to save users to the JSON file
async function saveUsers(users: User[]): Promise<void> {
  await fs.mkdir(path.dirname(usersFilePath), { recursive: true }); // Ensure directory exists
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
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
    const users = await getUsers();
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return { success: false, message: 'This email is already registered.', error: { code: 'auth/email-already-in-use' } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: crypto.randomUUID(), // Modern Node.js for UUID
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    users.push(newUser);
    await saveUsers(users);

    // Do not return password or sensitive data
    const { password: _p, ...userToReturn } = newUser;
    return {
      success: true,
      message: 'User registered successfully!',
      user: userToReturn,
    };
  } catch (error: any) {
    console.error('🔴 Sign Up Error (Local JSON):', error);
    return { success: false, message: error.message || 'An unexpected error occurred during sign up.', error: { message: error.message } };
  }
}

export async function signInUser(formData: FormData): Promise<AuthResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  try {
    const users = await getUsers();
    const user = users.find(u => u.email === email);

    if (!user || !user.password) {
      return { success: false, message: 'Invalid email or password.', error: { code: 'auth/invalid-credential' } };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.', error: { code: 'auth/invalid-credential' } };
    }

    // Do not return password or sensitive data
    const { password: _p, ...userToReturn } = user;
    return {
      success: true,
      message: 'Signed in successfully!',
      user: userToReturn,
    };
  } catch (error: any) {
    console.error('🔴 Sign In Error (Local JSON):', error);
    return { success: false, message: error.message || 'An unexpected error occurred during sign in.', error: { message: error.message } };
  }
}
