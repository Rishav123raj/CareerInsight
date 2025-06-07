
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Log a prominent error on the server console
  console.error(
    '\nFATAL ERROR: MONGODB_URI environment variable is not defined.\n' +
    'Please ensure you have a .env file in the project root with MONGODB_URI set to your MongoDB connection string.\n' +
    'Example: MONGODB_URI="mongodb://localhost:27017/yourdbname" or your Atlas connection string.\n'
  );
  // This error will be caught by the server action and potentially returned to the client.
  throw new Error(
    'MongoDB URI is not configured. Please define the MONGODB_URI environment variable in your .env file.'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Ensure MONGODB_URI is re-checked here in case the initial throw didn't stop execution (shouldn't happen but good practice)
    if (!MONGODB_URI) {
        console.error("dbConnect: MONGODB_URI is missing even after initial check.");
        throw new Error("MongoDB URI is missing.");
    }
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully.");
      return mongoose;
    }).catch(err => {
      console.error("MongoDB connection error in promise:", err.message);
      cached.conn = null; // Reset conn on promise error
      cached.promise = null; // Reset promise on error to allow retry
      throw err; // Re-throw to be caught by the caller
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null; // Ensure promise is reset on failure to allow retry
    console.error("Failed to establish MongoDB connection:", e.message);
    throw e; // Re-throw to be caught by server actions
  }

  return cached.conn;
}

export default dbConnect;
