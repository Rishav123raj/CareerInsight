
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
    await dbConnect();

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

    return {
      success: true,
      message: 'User registered successfully!',
      user: { id: newUser._id.toString(), name: newUser.name, email: newUser.email },
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    // More specific error handling can be added here (e.g., for validation errors from Mongoose)
    if (error.name === 'ValidationError') {
        let messages = Object.values(error.errors).map((err: any) => err.message);
        return { success: false, message: `Validation Error: ${messages.join(', ')}` };
    }
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signInUser(formData: FormData): Promise<SignInResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email }).select('+password'); // Explicitly select password
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (!user.password) {
        // This case should ideally not happen if password is required on schema and always set
        return { success: false, message: 'User account incomplete. Please contact support.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: 'Invalid email or password.' };
    }

    return {
      success: true,
      message: 'Signed in successfully!',
      user: { id: user._id.toString(), name: user.name, email: user.email },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}
