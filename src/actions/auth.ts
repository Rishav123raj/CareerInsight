
'use server';

import dbConnect from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import bcrypt from 'bcryptjs';

interface SignUpResponse {
  success: boolean;
  message: string;
  user?: { id: string; name: string; email: string };
}

interface SignInResponse {
  success: boolean;
  message: string;
  user?: { id: string; name: string; email: string };
}

export async function signUpUser(formData: FormData): Promise<SignUpResponse> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { success: false, message: 'All fields are required.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.'}
  }

  try {
    console.log("Attempting to connect to DB for sign up...");
    await dbConnect();
    console.log("DB connected for sign up.");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("New user saved successfully:", newUser.email);

    return {
      success: true,
      message: 'User registered successfully!',
      user: { id: newUser._id.toString(), name: newUser.name, email: newUser.email },
    };
  } catch (error: any) {
    console.error('🔴 Sign up error in server action:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    let userMessage = 'An unexpected error occurred during sign up. Please try again.';
    if (error.message && error.message.toLowerCase().includes('mongodb')) {
      userMessage = 'Database error during sign up. Please check server logs and MongoDB connection.';
    } else if (error.name === 'ValidationError') {
        let messages = Object.values(error.errors).map((err: any) => err.message);
        userMessage = `Validation Error: ${messages.join(', ')}`;
    }
    
    return { success: false, message: userMessage };
  }
}

export async function signInUser(formData: FormData): Promise<SignInResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  try {
    console.log("Attempting to connect to DB for sign in...");
    await dbConnect();
    console.log("DB connected for sign in.");

    const user = await User.findOne({ email }).select('+password'); 
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (!user.password) {
        console.error("User account incomplete - password field missing from DB record for:", email);
        return { success: false, message: 'User account incomplete. Please contact support.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: 'Invalid email or password.' };
    }

    console.log("User signed in successfully:", user.email);
    return {
      success: true,
      message: 'Signed in successfully!',
      user: { id: user._id.toString(), name: user.name, email: user.email },
    };
  } catch (error: any) {
    console.error('🔴 Sign in error in server action:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    let userMessage = 'An unexpected error occurred during sign in. Please try again.';
    if (error.message && error.message.toLowerCase().includes('mongodb')) {
      userMessage = 'Database error during sign in. Please check server logs and MongoDB connection.';
    }
    
    return { success: false, message: userMessage };
  }
}
