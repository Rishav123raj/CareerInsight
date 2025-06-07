
import mongoose from 'mongoose';

// This environment variable is critical.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI === "YOUR_MONGODB_CONNECTION_STRING_PLEASE_REPLACE_ME") {
  console.error(
    '\n🔴 FATAL ERROR: MONGODB_URI is not properly configured in your .env file.\n' +
    'Please ensure you have a .env file in the project root with a VALID MONGODB_URI.\n' +
    'Current value is missing or still a placeholder.\n'
  );
  // This error helps identify the issue early if the server tries to start without a proper URI.
  // For server actions, they will catch this if dbConnect is called.
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
  if (!MONGODB_URI || MONGODB_URI === "YOUR_MONGODB_CONNECTION_STRING_PLEASE_REPLACE_ME") {
    console.error("🔴 dbConnect Error: MONGODB_URI is not defined or is a placeholder. Cannot connect to database.");
    throw new Error('MongoDB URI is not configured. Please check your .env file.');
  }

  if (cached.conn) {
    console.log("🟢 Using cached MongoDB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering, good for diagnosing connection issues
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };

    console.log("🟡 Attempting to connect to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB connected successfully!");
      return mongooseInstance;
    }).catch(err => {
      console.error("🔴 MongoDB connection error during initial connection promise:", err.message);
      console.error("Full error stack for connection promise:", err.stack);
      // Reset promise on error to allow retry on subsequent calls if the issue is transient
      cached.promise = null;
      // Re-throw to be caught by the caller of dbConnect
      throw new Error(`Failed to connect to MongoDB: ${err.message}. Check server logs for details.`);
    });
  }

  try {
    console.log("⏳ Awaiting MongoDB connection promise...");
    cached.conn = await cached.promise;
  } catch (e: any) {
    // This catch block is important if the promise was already set but failed.
    console.error("🔴 Failed to establish MongoDB connection after awaiting promise:", e.message);
    console.error("Full error stack for await promise:", e.stack);
    cached.promise = null; // Ensure promise is reset on failure
    // Re-throw to ensure server actions can report a failure.
    throw new Error(`Database connection failed: ${e.message}. Check server logs.`);
  }
  
  if (!cached.conn) {
    // This case should ideally be caught by the promise rejection, but as a safeguard:
    console.error("🔴 dbConnect Error: Connection object is null after attempting connection.");
    throw new Error("Database connection attempt resulted in a null connection object.");
  }

  return cached.conn;
}

export default dbConnect;
