import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crm_mvp';

  try {
    // Attempt standard connection with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Connected to MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[DB] Standard MongoDB connection failed (${err.message}).`);
    
    // Fallback to in-memory MongoDB in development so the app runs out-of-the-box
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[DB] Attempting to start embedded in-memory MongoDB for development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[DB] Connected to in-memory MongoDB at ${memUri}`);
        return;
      } catch (memErr) {
        console.error('[DB] Failed to start in-memory MongoDB:', memErr.message);
      }
    }
    
    throw err;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
