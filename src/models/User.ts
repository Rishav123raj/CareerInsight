
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional because we won't always fetch it
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email.'],
      unique: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      select: false, // By default, do not return password field
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// To prevent model overwrite errors in Next.js hot reloading
const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
